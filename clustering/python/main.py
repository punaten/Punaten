import os
import json
import numpy as np
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt

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
                            for kp in pose['keypoints']:
                                video_keypoints.append([kp['x'], kp['y']])
                        all_keypoints.append(video_keypoints)
    return all_keypoints

def flatten_keypoints(keypoints):
    return [kp for video in keypoints for kp in video]

def cluster_and_save_results(keypoints, output_dir):
    flattened_keypoints = flatten_keypoints(keypoints)
    kmeans = KMeans(n_clusters=3, random_state=0).fit(flattened_keypoints)

    # Assign cluster labels to each video
    video_labels = []
    start_index = 0
    for video in keypoints:
        end_index = start_index + len(video)
        video_label = kmeans.labels_[start_index:end_index]
        video_labels.append(video_label.tolist())  # Convert ndarray to list
        start_index = end_index

    # Save cluster labels for each video
    result_file = os.path.join(output_dir, 'cluster_labels.json')
    with open(result_file, 'w') as f:
        json.dump(video_labels, f)

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

def main(input_dir, output_dir):
    keypoints = load_keypoints_from_json(input_dir)
    cluster_and_save_results(keypoints, output_dir)

if __name__ == '__main__':
    py_dir = 'clustering/python/'
    input_dir = py_dir + 'train'
    output_dir = py_dir + 'output'
    os.makedirs(output_dir, exist_ok=True)
    main(input_dir, output_dir)
