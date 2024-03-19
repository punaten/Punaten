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
from scipy.interpolate import interp1d
from sklearn.metrics import accuracy_score
import datetime
from joblib import dump, load
HAND_KEYPOINTS = [5, 6, 7, 8, 9, 10]  # 例: 手のキーポイント
LEG_KEYPOINTS = [11, 12, 13, 14, 15, 16]      # 例: 足のキーポイント
TORSO_KEYPOINTS = [1, 2, 3, 4] # 例: 体幹のキーポイント

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

# クラスラベルの取得
def get_class_labels(folder_path):
    class_labels = []
    for class_name in os.listdir(folder_path):
        class_dir = os.path.join(folder_path, class_name)
        if os.path.isdir(class_dir):
            for filename in os.listdir(class_dir):
                if filename.endswith('.json'):
                    class_labels.append(class_name)
    return class_labels

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

# パーツごとのオプティカルフローの計算
def calculate_optical_flow_for_parts(keypoints, part_indices):
    optical_flows = []
    for video_keypoints in keypoints:
        video_flows = []
        for i in range(len(video_keypoints) - 1):
            prev_frame_keypoints = video_keypoints[i]
            next_frame_keypoints = video_keypoints[i + 1]
            flow = [np.subtract(next_frame_keypoints[j], prev_frame_keypoints[j]) for j in part_indices]
            video_flows.append(flow)
        optical_flows.append(video_flows)
    return optical_flows

# 特徴量抽出
def extract_features_for_parts(optical_flows):
    features = []
    for video_flows in optical_flows:
        video_features = []
        for flow in video_flows:
            # 特徴量として平均、標準偏差、最大値、最小値を使用
            mean_flow = np.mean(flow, axis=0)
            std_flow = np.std(flow, axis=0)
            max_flow = np.max(flow, axis=0)
            min_flow = np.min(flow, axis=0)
            feature = np.concatenate([mean_flow, std_flow, max_flow, min_flow])
            video_features.append(feature)
        features.append(video_features)
    return features

# 特徴量のリサンプリング
def resample_features(features, target_length = 40):
    resampled_features = []
    for video_features in features:
        # 現在のフレーム数
        current_length = len(video_features)
        # リサンプリングが必要な場合
        if current_length != target_length:
            # 時間軸を作成
            time_axis = np.linspace(0, 1, current_length)
            target_time_axis = np.linspace(0, 1, target_length)
            # 各特徴量に対して線形補間を行い、リサンプリング
            resampled_video_features = []
            for i in range(len(video_features[0])):
                interpolator = interp1d(time_axis, [feature[i] for feature in video_features], kind='linear')
                resampled_feature = interpolator(target_time_axis)
                resampled_video_features.append(resampled_feature)
            # 転置して元の形状に戻す
            resampled_video_features = np.transpose(resampled_video_features)
        else:
            resampled_video_features = video_features
        resampled_features.append(resampled_video_features)
    return resampled_features


# キーポイントデータの読み込み
keypoints, labels = load_keypoints_from_json("clustering/python/train/production")
# データのクリーニング
cleaned_keypoints = clean_data(keypoints)
# データの正規化
normalized_keypoints = normalize_data(cleaned_keypoints)
# オプティカルフローの計算
hand_optical_flows = calculate_optical_flow_for_parts(normalized_keypoints, HAND_KEYPOINTS)
leg_optical_flows = calculate_optical_flow_for_parts(normalized_keypoints, LEG_KEYPOINTS)
torso_optical_flows = calculate_optical_flow_for_parts(normalized_keypoints, TORSO_KEYPOINTS)
# オプティカルフローから特徴量を抽出
hand_features = extract_features_for_parts(hand_optical_flows)
leg_features = extract_features_for_parts(leg_optical_flows)
torso_features = extract_features_for_parts(torso_optical_flows)
# 特徴量を結合
features = np.concatenate([hand_features, leg_features, torso_features], axis=1)
# モデルを使用して予測
kmeans = load('model.joblib')
predictions = kmeans.predict(features)