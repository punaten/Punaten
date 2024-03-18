import os
import json
import numpy as np
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt
from sklearn.preprocessing import MinMaxScaler
from sklearn.decomposition import PCA
from sklearn.metrics import confusion_matrix
import seaborn as sns
from collections import Counter

# JSONファイルからキーポイントデータを読み込む関数
def load_keypoints_from_json(folder_path):
    all_keypoints = []
    all_labels = []  # 正解ラベルを保持するリスト
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
                        all_labels.append(class_name)  # 正解ラベルを追加
    return all_keypoints, all_labels

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
    for i, video_keypoints in enumerate(cleaned_data):
        num_frames = len(video_keypoints)
        num_keypoints = len(video_keypoints[0]) if num_frames > 0 else 0
        print(f"Video {i+1}: {num_frames} frames, {num_keypoints} keypoints per frame")
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

def calculate_optical_flow_from_keypoints(keypoints):
    print("calculate_optical_flow_from_keypoints")
    optical_flows = []
    for video_keypoints in keypoints:
        video_flows = []
        for i in range(len(video_keypoints) - 1):
            prev_frame_keypoints = video_keypoints[i]
            next_frame_keypoints = video_keypoints[i + 1]
            flow = [np.subtract(next_kp, prev_kp) for prev_kp, next_kp in zip(prev_frame_keypoints, next_frame_keypoints)]
            video_flows.append(flow)
        optical_flows.append(video_flows)

    # データの形状を出力
    for i, video in enumerate(optical_flows):
        print(f"Video {i + 1}: {len(video)} flows, {len(video[0]) if video else 0} flow vectors per frame")

    return optical_flows

# 特徴抽出関数
def extract_features(optical_flows, frame_interval=20):
    extracted_features = []
    for video_flows in optical_flows:
        if len(video_flows) < frame_interval:
            continue
        video_features = []
        for i in range(0, len(video_flows), frame_interval):
            interval_flows = video_flows[i:i + frame_interval]
            mean_flows = np.mean(interval_flows, axis=0)
            std_flows = np.std(interval_flows, axis=0)
            features = np.concatenate([mean_flows.flatten(), std_flows.flatten()])
            video_features.append(features)
        # 各ビデオの特徴ベクトルを1つのベクトルに平均化
        video_feature = np.mean(video_features, axis=0)
        extracted_features.append(video_feature)
    print("extracted_features shape:", np.array(extracted_features).shape)
    return np.array(extracted_features)

# クラスタリング関数
def perform_clustering(features, labels, n_clusters=4):
    kmeans = KMeans(n_clusters=n_clusters, random_state=0).fit(features)
    cluster_labels = kmeans.labels_

    # 各クラスタに対して最も頻繁に出現するラベルをマッピング
    label_mapping = {}
    for cluster in range(n_clusters):
        cluster_indices = [i for i, label in enumerate(cluster_labels) if label == cluster]
        cluster_labels = [labels[i] for i in cluster_indices]
        most_common_label = Counter(cluster_labels).most_common(1)[0][0]
        label_mapping[cluster] = most_common_label

    return kmeans, label_mapping

# 結果の保存関数
def save_results(clusters, features, labels, output_dir):
    # クラスタラベルと実際のラベルを比較してconfusion matrixを作成
    cm = confusion_matrix(labels, clusters.labels_)

    # Confusion matrixをヒートマップとしてプロット
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
    plt.xlabel('Predicted Labels')
    plt.ylabel('True Labels')
    plt.title('Confusion Matrix')
    plt.savefig(f'{output_dir}/confusion_matrix.png')
    plt.close()

    # 特徴ベクトルの平均値を計算
    mean_features = np.mean(features, axis=1)

    # クラスタリング結果をプロットして画像として保存
    plt.figure(figsize=(10, 8))
    for i, label in enumerate(clusters.labels_):
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
    keypoints, labels = load_keypoints_from_json(input_dir)
    print("labels:", labels)

    # データのクリーニング
    cleaned_keypoints = clean_data(keypoints)
    # print("cleaned_keypoints shape:", cleaned_keypoints)

    # データの正規化
    normalized_keypoints = normalize_data(cleaned_keypoints)
    for i, video_keypoints in enumerate(normalized_keypoints):
        num_frames = len(video_keypoints)
        num_keypoints = len(video_keypoints[0]) if num_frames > 0 else 0
        print(f"Video {i+1}: {num_frames} frames, {num_keypoints} keypoints per frame")
        # print("First frame keypoints:")
        # print(video_keypoints[0])  # 最初のフレームのキーポイントを表示
        print("----------")

    # オプティカルフローの計算
    optical_flows = calculate_optical_flow_from_keypoints(normalized_keypoints)

    # 特徴抽出
    features = extract_features(optical_flows, 5)

    # クラスタリング
    clusters, label_mapping = perform_clustering(features, labels, 4)

    # KMeansオブジェクトの属性を出力
    print("labels:", label_mapping)
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
    save_results(clusters, features, label_mapping, output_dir)

if __name__ == '__main__':
    input_dir = 'clustering/python/train/production'
    output_dir = 'clustering/python/output'
    main(input_dir, output_dir)
