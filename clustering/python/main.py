import os
import json
import numpy as np
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt
from sklearn.preprocessing import MinMaxScaler
from sklearn.decomposition import PCA

# JSONファイルからキーポイントデータを読み込む関数
def load_keypoints_from_json(folder_path):
    all_keypoints = []
    for class_name in os.listdir(folder_path):
        class_dir = os.path.join(folder_path, class_name)
        if os.path.isdir(class_dir):
            for filename in os.listdir(class_dir):
                if filename.endswith('.json'):
                    file_path = os.path.join(class_dir, filename)
                    with open(file_path) as f:
                        data = json.load(f)
                        video_keypoints = []
                        for pose in data:
                            keypoints = [[kp['x'], kp['y']] for kp in pose['keypoints']]
                            video_keypoints.append(keypoints)
                        all_keypoints.append(video_keypoints)
    return all_keypoints

# データクリーニング: 欠損キーポイントの補完
def clean_data(data):
    cleaned_data = []
    for video_keypoints in data:
        cleaned_video = []
        for frame_keypoints in video_keypoints:
            # 欠損キーポイントを平均値で補完
            cleaned_frame = [kp if kp != [0, 0] else [np.nan, np.nan] for kp in frame_keypoints]
            cleaned_video.append(cleaned_frame)
        cleaned_data.append(cleaned_video)
    return cleaned_data

# 正規化: キーポイントデータのスケーリング
def normalize_data(data):
    # 全てのキーポイントを1次元配列に変換
    all_keypoints = np.array([kp for video in data for frame in video for kp in frame]).reshape(-1, 2)
    # MinMaxScalerを使用して[0, 1]の範囲にスケーリング
    scaler = MinMaxScaler()
    scaled_keypoints = scaler.fit_transform(all_keypoints)
    # スケーリングされたキーポイントを元の形式に戻す
    normalized_data = []
    idx = 0
    for video_keypoints in data:
        normalized_video = []
        for frame_keypoints in video_keypoints:
            normalized_frame = [scaled_keypoints[idx + i] for i in range(len(frame_keypoints))]
            idx += len(frame_keypoints)
            normalized_video.append(normalized_frame)
        normalized_data.append(normalized_video)
    return normalized_data

# オプティカルフローを計算する関数
def calculate_optical_flow_from_keypoints(keypoints):
    optical_flows = []
    for video_keypoints in keypoints:
        video_flows = []
        for i in range(len(video_keypoints) - 1):
            prev_frame_keypoints = video_keypoints[i]
            next_frame_keypoints = video_keypoints[i + 1]
            # 各キーポイントの移動量（オプティカルフロー）を計算
            flow = [np.subtract(next_kp, prev_kp) for prev_kp, next_kp in zip(prev_frame_keypoints, next_frame_keypoints)]
            video_flows.append(flow)
        optical_flows.append(video_flows)
    return optical_flows

# 特徴抽出関数
def extract_features(optical_flows, frame_interval=20):
    extracted_features = []
    for video_flows in optical_flows:
        if len(video_flows) < frame_interval:
            # フレーム数が間隔より少ない場合はスキップ
            continue
        video_features = []
        for i in range(0, len(video_flows), frame_interval):
            # 指定したフレーム間隔で特徴を抽出
            interval_flows = video_flows[i:i + frame_interval]
            # 各キーポイントのオプティカルフローの平均と標準偏差を計算
            mean_flows = np.mean(interval_flows, axis=0)
            std_flows = np.std(interval_flows, axis=0)
            # 平均と標準偏差を結合して特徴ベクトルを形成
            features = np.concatenate([mean_flows.flatten(), std_flows.flatten()])
            video_features.append(features)

        extracted_features.append(video_features)
    print("extracted_features shape:", np.array(extracted_features).shape)
    return extracted_features

# 次元削減関数
def reduce_dimensions(features, n_components=2):
    reduced_features = []
    pca = PCA(n_components=n_components)
    for video_features in features:
        # PCAを使用して特徴の次元数を削減
        reduced_video_features = pca.fit_transform(video_features)
        reduced_features.append(reduced_video_features)
    return reduced_features

# クラスタリング関数
def perform_clustering(features, n_clusters=4):
    # 各ビデオの特徴を1次元配列に連結
    all_features = np.concatenate(features, axis=0)
    # K-Meansクラスタリングを実行
    kmeans = KMeans(n_clusters=n_clusters, random_state=0).fit(all_features)
    return kmeans

# 結果の保存関数
def save_results(clusters, features, output_dir):
    labels = clusters.labels_
    # 特徴ベクトルの平均値を計算
    mean_features = np.mean(features, axis=1)

    # クラスタリング結果をプロットして画像として保存
    plt.figure(figsize=(10, 8))
    for i, label in enumerate(labels):
        if i < len(mean_features):  # mean_featuresの範囲内であることを確認
            plt.scatter(mean_features[i][0], mean_features[i][1], c=f'C{label}', label=f'Cluster {label}')
    plt.title('Clustering Results')
    plt.xlabel('Feature 1')
    plt.ylabel('Feature 2')
    plt.legend()
    plt.savefig(f'{output_dir}/clustering_result.png')
    plt.close()


# メイン関数
def main(input_dir, output_dir):
    # キーポイントデータの読み込み
    keypoints = load_keypoints_from_json(input_dir)

    # データのクリーニング
    cleaned_keypoints = clean_data(keypoints)

    # データの正規化
    normalized_keypoints = normalize_data(cleaned_keypoints)

    # オプティカルフローの計算
    optical_flows = calculate_optical_flow_from_keypoints(normalized_keypoints)

    # 特徴抽出
    features = extract_features(optical_flows)

    # 次元削減
    reduced_data = reduce_dimensions(features)

    # クラスタリング
    clusters = perform_clustering(reduced_data)

    # clustersとfeaturesを標準出力
    print("clusters:", np.array(clusters).shape)
    # KMeansオブジェクトの属性を出力
    print("クラスタ中心 (Centroids):")
    print(clusters.cluster_centers_)

    print("\n各データポイントのクラスタラベル (Labels):")
    print(clusters.labels_)

    print("\nクラスタ内誤差平方和 (Inertia):")
    print(clusters.inertia_)

    print("\n繰り返し回数 (Number of Iterations):")
    print(clusters.n_iter_)
    print("features:", np.array(features).shape)

    # 結果の保存
    save_results(clusters, features, output_dir)

if __name__ == '__main__':
    input_dir = 'clustering/python/train'
    output_dir = 'clustering/python/output'
    main(input_dir, output_dir)
