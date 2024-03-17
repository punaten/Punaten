import os
import json
import numpy as np
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt

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

# キーポイントデータを平坦化する関数
def flatten_keypoints(keypoints):
    return [kp for video in keypoints for frame in video for kp in frame]

# キーポイントからオプティカルフローを計算する関数
def calculate_optical_flow_from_keypoints(keypoints):
    optical_flows = []
    for video_keypoints in keypoints:
        video_flows = []
        for i in range(len(video_keypoints) - 1):
            prev_keypoints = video_keypoints[i]
            next_keypoints = video_keypoints[i + 1]
            # キーポイントの数が一致している場合のみオプティカルフローを計算
            if len(prev_keypoints) == len(next_keypoints):
                flows = [np.array([nx - px, ny - py]) for (px, py), (nx, ny) in zip(prev_keypoints, next_keypoints)]
                video_flows.append(flows)
        optical_flows.append(video_flows)
    return optical_flows


# キーポイントとオプティカルフローを組み合わせてクラスタリングする関数
def perform_clustering_with_optical_flow(keypoints, optical_flows):
    # 最初のフレームのキーポイントを削除して長さを合わせる
    adjusted_keypoints = [video[1:] for video in keypoints]
    flattened_keypoints = flatten_keypoints(adjusted_keypoints)
    flattened_flows = flatten_keypoints(optical_flows)
    features = np.hstack((flattened_keypoints, flattened_flows))
    kmeans = KMeans(n_clusters=3, random_state=0).fit(features)
    return kmeans


# クラスタリング結果を保存する関数
def save_results(kmeans, flattened_keypoints, output_dir):
    # Save clustering result as an image
    plt.figure(figsize=(8, 6))
    for i, label in enumerate(kmeans.labels_):
        plt.scatter(flattened_keypoints[i][0], flattened_keypoints[i][1], c=f'C{label}', label=f'Cluster {label}')
    plt.title('Clustering Results')
    plt.xlabel('X')
    plt.ylabel('Y')
    plt.legend()
    plt.savefig(os.path.join(output_dir, 'clustering_result.png'))
    plt.close()

# メイン関数
def main(input_dir, output_dir):
    keypoints = load_keypoints_from_json(input_dir)
    optical_flows = calculate_optical_flow_from_keypoints(keypoints)
    kmeans = perform_clustering_with_optical_flow(keypoints, optical_flows)
    flattened_keypoints = flatten_keypoints(keypoints)
    save_results(kmeans, flattened_keypoints, output_dir)

if __name__ == '__main__':
    py_dir = 'clustering/python/'
    input_dir = py_dir + 'train'
    output_dir = py_dir + 'output'
    os.makedirs(output_dir, exist_ok=True)
    main(input_dir, output_dir)
