import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans
import os
import json

def load_keypoints_from_json(folder_path):
    keypoints = []
    for filename in os.listdir(folder_path):
        if filename.endswith('.json'):
            file_path = os.path.join(folder_path, filename)
            with open(file_path) as f:
                data = json.load(f)
                for pose in data:
                    for kp in pose['keypoints']:
                        keypoints.append([kp['x'], kp['y']])
    return np.array(keypoints)

# データの読み込み
folder_path = 'train/girlfriend'
keypoints = load_keypoints_from_json(folder_path)

# K-meansクラスタリングを実行
kmeans = KMeans(n_clusters=3, random_state=0).fit(keypoints)

# クラスタリングの結果を可視化
plt.figure(figsize=(8, 6))
colors = ['red', 'green', 'blue']
for i in range(3):
    cluster_points = keypoints[kmeans.labels_ == i]
    plt.scatter(cluster_points[:, 0], cluster_points[:, 1], c=colors[i], label=f'Cluster {i}')
plt.scatter(kmeans.cluster_centers_[:, 0], kmeans.cluster_centers_[:, 1], c='black', marker='x', label='Centroids')
plt.xlabel('X')
plt.ylabel('Y')
plt.legend()
plt.title('K-means Clustering Results')
plt.show()
