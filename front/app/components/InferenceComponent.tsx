import React, { useState, useEffect } from 'react';
import * as ort from 'onnxruntime-web';

type Keypoint = {
    x: number;
    y: number;
    score: number;
    name: string;
};

type Pose = {
    keypoints: Keypoint[];
    box: {
        xMin: number;
        xMax: number;
        yMin: number;
        yMax: number;
        width: number;
        height: number;
    };
    score: number;
    id: number;
};

const InferenceComponent: React.FC = () => {
    const [result, setResult] = useState<Float32Array | null>(null);

    useEffect(() => {
        const runInference = async () => {
            // JSONデータのフェッチと前処理
            const processedData = await preprocessKeypoints('/IMG_9233_pose_data.json');
            const inputData = new Float32Array(processedData.flat(2)); // 2次元配列を1次元配列にフラット化

            // ONNXモデルの読み込み
            const response = await fetch('/kmeans_model.onnx');
            const arrayBuffer = await response.arrayBuffer();
            const session = await ort.InferenceSession.create(arrayBuffer);

            // 推論の実行
            const inputTensor = new ort.Tensor('float32', inputData, [1, inputData.length]);
            const feeds: Record<string, ort.Tensor> = { float_input: inputTensor };
            const results = await session.run(feeds);

            // 結果の取得
            const outputData = results.output.data as Float32Array;
            setResult(outputData);
        };

        runInference();
    }, []);

    return (
        <div>
            <h2>Inference Result</h2>
            {result ? <p>{result.toString()}</p> : <p>Loading...</p>}
        </div>
    );
};

export default InferenceComponent;

// JSONデータから入力データを前処理する関数
const preprocessKeypoints = async (url: string): Promise<number[][]> => {
    debugger
    const poses = await loadKeypointsFromJson(url);
    const cleanedPoses = cleanData(poses);
    const normalizedPoses = normalizeData(cleanedPoses);

    const handFlows = calculateOpticalFlowForParts([normalizedPoses], HAND_KEYPOINTS);
    const legFlows = calculateOpticalFlowForParts([normalizedPoses], LEG_KEYPOINTS);
    const torsoFlows = calculateOpticalFlowForParts([normalizedPoses], TORSO_KEYPOINTS);
  
    const handFeatures = extractFeaturesForParts(handFlows);
    const legFeatures = extractFeaturesForParts(legFlows);
    const torsoFeatures = extractFeaturesForParts(torsoFlows);
  
    // パーツごとの特徴量を結合して最終的な特徴ベクトルを作成
    const finalFeatures = handFeatures.map((hf, i) => {
        const lf = legFeatures[i];
        const tf = torsoFeatures[i];
        return hf.map((hfv, j) => [...hfv, ...lf[j], ...tf[j]]);
    });
    
    const averagedFeatures = averageFeatures(finalFeatures);

    // ここでは特徴量の配列をフラット化して返す
    return averagedFeatures.map(feature => feature.flat()); // 各ビデオの特徴量をフラット化
};

// JSONデータからキーポイントデータを読み込む関数
const loadKeypointsFromJson = async (url: string): Promise<Pose[]> => {
    const response = await fetch(url);
    const data: Pose[] = await response.json();
    return data;
};

// データクリーニング: 欠損キーポイントの補完
const cleanData = (poses: Pose[]): Pose[] => {
    return poses.map(pose => ({
        ...pose,
        keypoints: pose.keypoints.map(kp => ({
            ...kp,
            x: kp.x === 0 ? NaN : kp.x,
            y: kp.y === 0 ? NaN : kp.y,
        })),
    }));
};

// 正規化: キーポイントデータのスケーリング
const normalizeData = (poses: Pose[]): Pose[] => {
    // キーポイントのxとy座標の最小値と最大値を求める
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    
    poses.forEach(pose => {
        pose.keypoints.forEach(kp => {
            if (kp.x < minX) minX = kp.x;
            if (kp.x > maxX) maxX = kp.x;
            if (kp.y < minY) minY = kp.y;
            if (kp.y > maxY) maxY = kp.y;
        });
    });

    // 最小値と最大値を使用してキーポイントデータを正規化
    return poses.map(pose => ({
        ...pose,
        keypoints: pose.keypoints.map(kp => ({
            ...kp,
            x: (kp.x - minX) / (maxX - minX),
            y: (kp.y - minY) / (maxY - minY),
        })),
    }));
};

// オプティカルフローの計算
function calculateOpticalFlowForParts(videos: Pose[][], partIndices: number[]): number[][][][] {
    const opticalFlows: number[][][][] = [];
  
    for (const keypoints of videos) {
      const videoFlows: number[][][] = [];
      for (let i = 0; i < keypoints.length - 1; i++) {
        const prevFrameKeypoints = keypoints[i].keypoints;
        const nextFrameKeypoints = keypoints[i + 1].keypoints;
        const flow: number[][] = [];
        for (const j of partIndices) {
          const prevKeypoint = prevFrameKeypoints[j];
          const nextKeypoint = nextFrameKeypoints[j];
          const flowVector = [nextKeypoint.x - prevKeypoint.x, nextKeypoint.y - prevKeypoint.y];
          flow.push(flowVector);
        }
        videoFlows.push(flow);
      }
      opticalFlows.push(videoFlows);
    }
  
    return opticalFlows;
  }
  
  const HAND_KEYPOINTS = [5, 6, 7, 8, 9, 10]; // 例: 手のキーポイント
  const LEG_KEYPOINTS = [11, 12, 13, 14, 15, 16]; // 例: 足のキーポイント
  const TORSO_KEYPOINTS = [1, 2, 3, 4]; // 例: 体幹のキーポイント
  
// ビデオ全体の特徴量を平均化
const averageFeatures = (features: number[][][][]): number[][] => {
    return features.map(videoFeatures => {
      const summedFeatures = videoFeatures.reduce((acc, frameFeatures) => {
        return acc.map((val, i) => val + frameFeatures.reduce((sum, feature) => sum + feature[i], 0));
      }, Array(videoFeatures[0][0].length).fill(0));
      return summedFeatures.map(val => val / videoFeatures.length);
    });
  };
  

// 特徴量抽出
const extractFeaturesForParts = (opticalFlows: number[][][][]): number[][][][] => {
    return opticalFlows.map(videoFlows => {
      return videoFlows.map(flow => {
        // 平均フローを計算
        const meanFlow = flow.reduce((acc, val) => acc.map((v, i) => v + val[i]), Array(flow[0].length).fill(0))
          .map(val => val / flow.length);
  
        // 標準偏差フローを計算
        const stdFlow = flow.reduce((acc, val) => acc.map((v, i) => v + (val[i] - meanFlow[i]) ** 2), Array(flow[0].length).fill(0))
          .map(val => Math.sqrt(val / flow.length));
  
        // 最大フローを計算
        const maxFlow = flow.reduce((acc, val) => acc.map((v, i) => Math.max(v, val[i])), Array(flow[0].length).fill(-Infinity));
  
        // 最小フローを計算
        const minFlow = flow.reduce((acc, val) => acc.map((v, i) => Math.min(v, val[i])), Array(flow[0].length).fill(Infinity));
  
        return [...meanFlow, ...stdFlow, ...maxFlow, ...minFlow];
      });
    });
  };
