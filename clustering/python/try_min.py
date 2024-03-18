import os
import json
import numpy as np
from sklearn.metrics import adjusted_rand_score
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

# 特徴量抽出
def extract_features(optical_flows):
    features = []
    for video_flows in optical_flows:
        video_features = []
        for flow in video_flows:
            # 特徴量としてフローベクトルの平均を使用
            avg_flow = np.mean(flow, axis=0)
            video_features.append(avg_flow)
        features.append(video_features)
    # データの形状と型を出力
    print(f"Total videos: {len(features)}")
    for i, video_features in enumerate(features):
        print(f"Video {i + 1}: {len(video_features)} features, Type: {type(video_features)}")
        if video_features:
            first_feature = video_features[0]
            print(f"Type of first feature in Video {i + 1}: {type(first_feature)}, Shape: {first_feature.shape}, Dtype: {first_feature.dtype}")
    print(f"Type of features: {type(features)}")
    return features

# KMeansでクラスタリング
def cluster_features(features, n_clusters):
    # 特徴量を2次元配列に変換
    all_features = np.array([f for video in features for f in video])
    # KMeansモデルの作成と学習
    kmeans = KMeans(n_clusters=n_clusters, random_state=42)
    kmeans.fit(all_features)
    # 各データポイントのクラスタラベルを取得
    labels = kmeans.labels_
    # データの形状を出力
    print(f"Total data points: {len(labels)}")
    return labels

# 結果をプロット
def plot_clusters(features, labels, output_dir):
    all_features = np.array([f for video in features for f in video])
    plt.scatter(all_features[:, 0], all_features[:, 1], c=labels)
    plt.xlabel('Feature 1')
    plt.ylabel('Feature 2')
    plt.title('Clustering Results')
    plt.savefig(f'{output_dir}/clustering_result.png')
    plt.close()

# メイン処理
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

    features = extract_features(optical_flows)
    labels = cluster_features(features, n_clusters=5)
    plot_clusters(features, labels, output_dir)

if __name__ == '__main__':
    input_dir = 'clustering/python/train/production'
    output_dir = 'clustering/python/output'

    main(input_dir, output_dir)