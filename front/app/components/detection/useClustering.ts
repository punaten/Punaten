import { useEffect, useState } from "react";
import "@tensorflow/tfjs-backend-webgl";
import { Keypoint, Pose } from "@tensorflow-models/pose-detection";

export const useClustering = () => {
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

  const getNekoType = async (data: Pose[]) => {
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
      //人数分の出演カウント
      //キーがidで、valueが出現回数
      const idCount: { [key: number]: number } = {};

      // let idCoount: number[] = [];
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
        if (id) {
          //keyがidのvalueを1増やす
          idCount[id] = (idCount[id] || 0) + 1;
        }
        checkHandAndNose(leftHand, rightHand, nose);
      });

      const num = data.length - 1;
      //idCountの中で2番目に多いidの出現回数を取得
      const secondIdCoount = Object.values(idCount).sort((a, b) => b - a)[1];

      console.log(secondIdCoount);

      return {
        leftHand: {
          x: {
            speed: sumValue.left.x / num,
          },
          y: {
            speed: sumValue.left.y / num,
          },
        },
        rightHand: {
          x: {
            speed: sumValue.right.x / num,
          },
          y: {
            speed: sumValue.right.y / num,
          },
        },
        secondIdCoount,
        overHandCount,
      };
    };

    const result = getData(data);
    console.log(result);

    const resultNum = wasmModule
      ? wasmModule.clustering(
        result.leftHand.x.speed,
        result.leftHand.y.speed,
        result.rightHand.x.speed,
        result.rightHand.y.speed,
        result.secondIdCoount,
        result.overHandCount
      )
      : -1;
    //"edm", "Girlfriend", "happy_happy", "shikarareru", "yonezu_happy"
    const numToNekoType = (result: number) => {
      switch (result) {
        case 0:
          return "shikarareru";
        case 1:
          return "yonezu_happy";
        case 2:
          return "happy_happy";
        case 3:
          return "Girlfriend";
        case 4:
          return "edm";
        default:
          return "error";
      }
    };
    const nekoType = numToNekoType(resultNum);
    return nekoType;
  };

  return { getNekoType };
};
