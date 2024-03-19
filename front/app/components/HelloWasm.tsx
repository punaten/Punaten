import { Keypoint, Pose } from "@tensorflow-models/pose-detection";
import { useEffect, useState } from "react";
// import data1 from "~/test-data/edm.json";
// import data2 from "~/test-data/edm2.json";
// import data3 from "~/test-data/edm3.json";
// import data4 from "~/test-data/edm4.json";
// import data5 from "~/test-data/edm5.json";

// import data1 from "~/test-data/yonezu.json";
// import data2 from "~/test-data/yonezu2.json";
// import data3 from "~/test-data/yonezu3.json";

// import data1 from "~/test-data/happy.json";
// import data2 from "~/test-data/happy2.json";
// import data3 from "~/test-data/happy3.json";

import data1 from "~/test-data/girl.json";
import data2 from "~/test-data/girl2.json";
import data3 from "~/test-data/girl3.json";
import data4 from "~/test-data/girl4.json";
import data5 from "~/test-data/girl5.json";

const HelloWasm = () => {
  const memory = new WebAssembly.Memory({ initial: 20, maximum: 100 });
  const [wasmModule, setWasmModule] = useState<WebAssembly.Exports | null>(
    null
  );

  useEffect(() => {
    const loadWasm = async () => {
      try {
        const wasm = await WebAssembly.instantiateStreaming(
          fetch("/hello.wasm"), // パブリックディレクトリに配置した`.wasm`ファイルへのパス
          {}
        );
        setWasmModule(wasm.instance.exports);
      } catch (err) {
        console.error("Failed to load wasm:", err);
      }
    };

    loadWasm();
  }, []);

  const getData = (data: Pose[]) => {
    let maxValue = { left: { x: 0, y: 0 }, right: { x: 0, y: 0 } };
    let minValue = { left: { x: 0, y: 0 }, right: { x: 0, y: 0 } };
    let sumValue = {
      left: { x: 0, y: 0 },
      right: { x: 0, y: 0 },
      nose: 0,
    };
    let preValue = {
      left: { x: 0, y: 0 },
      right: { x: 0, y: 0 },
    };
    const ids: number[] = [];
    let overHandCount: number = 0;

    const checkHandAndNose = (
      leftHand: number,
      rightHand: number,
      nose: number
    ) => {
      if (nose > leftHand || nose > rightHand) overHandCount++;
    };

    const getKeyPointsData = (
      keyPoint: Keypoint,
      side: "left" | "right"
    ): number => {
      const { x, y } = keyPoint;

      if (minValue[side].x === 0) minValue[side].x = x;
      if (minValue[side].y === 0) minValue[side].y = y;

      if (x > maxValue[side].x) maxValue[side].x = x;
      if (x < minValue[side].x) minValue[side].x = x;
      if (y > maxValue[side].y) maxValue[side].y = y;
      if (y < minValue[side].y) minValue[side].y = y;

      if (preValue[side].x !== 0) {
        sumValue[side].x += Math.abs(x - preValue[side].x);
        sumValue[side].y += Math.abs(y - preValue[side].y);
      }
      preValue[side].x = x;
      preValue[side].y = y;
      return y;
    };

    data.forEach((poses) => {
      const { keypoints, id } = poses;
      let rightHand = 0;
      let leftHand = 0;
      let nose = 0;
      keypoints.forEach((pose) => {
        switch (pose.name) {
          case "right_wrist":
            rightHand = getKeyPointsData(pose, "right");
            break;
          case "left_wrist":
            leftHand = getKeyPointsData(pose, "left");
            break;
          case "nose":
            sumValue.nose += pose.y;
            nose = pose.y;
            break;
        }
      });
      if (id && !ids.includes(id)) ids.push(id);
      checkHandAndNose(leftHand, rightHand, nose);
    });

    return {
      leftHand: {
        x: {
          speed: sumValue.left.x / (data.length - 1),
          max: maxValue.left.x,
          min: minValue.left.x,
          range: maxValue.left.x - minValue.left.x,
        },
        y: {
          speed: sumValue.left.y / (data.length - 1),
          max: maxValue.left.y,
          min: minValue.left.y,
          range: maxValue.left.y - minValue.left.y,
        },
      },
      rightHand: {
        x: {
          speed: sumValue.right.x / (data.length - 1),
          max: maxValue.right.x,
          min: minValue.right.x,
          range: maxValue.right.x - minValue.right.x,
        },
        y: {
          speed: sumValue.right.y / (data.length - 1),
          max: maxValue.right.y,
          min: minValue.right.y,
          range: maxValue.right.y - minValue.right.y,
        },
      },
      nose: {
        ave: sumValue.nose / data.length,
      },
      idCount: ids.length,
      overHandCount: overHandCount,
    };
  };

  const result1 = getData(data1);
  const result2 = getData(data2);
  const result3 = getData(data3);
  const result4 = getData(data4);
  const result5 = getData(data5);

  const results = [result1, result2, result3, result4, result5];

  function getAverageStats(statsList: any[]): any {
    const totalStats: any = {
      leftHand: {
        x: { speed: 0, max: 0, min: 0, range: 0 },
        y: { speed: 0, max: 0, min: 0, range: 0 },
      },
      rightHand: {
        x: { speed: 0, max: 0, min: 0, range: 0 },
        y: { speed: 0, max: 0, min: 0, range: 0 },
      },
      nose: { ave: 0 },
      idCount: 0,
      overHandCount: 0,
    };

    const numStats = statsList.length;

    statsList.forEach((stats) => {
      console.log(stats.overHandCount);
      totalStats.leftHand.x.speed += stats.leftHand.x.speed / numStats;
      totalStats.leftHand.x.max += stats.leftHand.x.max / numStats;
      totalStats.leftHand.x.min += stats.leftHand.x.min / numStats;
      totalStats.leftHand.x.range += stats.leftHand.x.range / numStats;

      totalStats.leftHand.y.speed += stats.leftHand.y.speed / numStats;
      totalStats.leftHand.y.max += stats.leftHand.y.max / numStats;
      totalStats.leftHand.y.min += stats.leftHand.y.min / numStats;
      totalStats.leftHand.y.range += stats.leftHand.y.range / numStats;

      totalStats.rightHand.x.speed += stats.rightHand.x.speed / numStats;
      totalStats.rightHand.x.max += stats.rightHand.x.max / numStats;
      totalStats.rightHand.x.min += stats.rightHand.x.min / numStats;
      totalStats.rightHand.x.range += stats.rightHand.x.range / numStats;

      totalStats.rightHand.y.speed += stats.rightHand.y.speed / numStats;
      totalStats.rightHand.y.max += stats.rightHand.y.max / numStats;
      totalStats.rightHand.y.min += stats.rightHand.y.min / numStats;
      totalStats.rightHand.y.range += stats.rightHand.y.range / numStats;

      totalStats.nose.ave += stats.nose.ave / numStats;

      totalStats.idCount += stats.idCount / numStats;
      totalStats.overHandCount += stats.overHandCount / numStats;
    });

    return totalStats;
  }

  const averageStats = getAverageStats(results);
  console.log(averageStats);

  //   const fetchedData = wasmModule
  //     ? wasmModule.clustering(data, data.length)
  //     : null;
  //   console.log(fetchedData);

  return (
    <div>
      <h1>WebAssembly Example</h1>
      {/* {wasmModule && (
        <p>Result: {wasmModule.clustering()}</p>
      )} */}
    </div>
  );
};

export default HelloWasm;
