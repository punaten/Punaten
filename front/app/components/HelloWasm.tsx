import { Keypoint, Pose } from "@tensorflow-models/pose-detection";
import { useEffect, useState } from "react";
import { useClustering } from "./detection/useClustering";

// import data from "~/test-data/edm.json";
// import data from "~/test-data/edm2.json";
// import data from "~/test-data/edm3.json";
// import data from "~/test-data/edm4.json";
// import data from "~/test-data/edm5.json";

// import data from "~/test-data/yonezu.json";
// import data from "~/test-data/yonezu2.json";
// import data from "~/test-data/yonezu3.json";

// import data from "~/test-data/happy.json";
import data from "~/test-data/happy2.json";
// import data from "~/test-data/happy3.json"; miss

// import data from "~/test-data/girl.json";
// import data from "~/test-data/girl2.json"; miss
// import data from "~/test-data/girl3.json";
// import data from "~/test-data/girl4.json";
// import data from "~/test-data/girl5.json";

const HelloWasm = () => {
  const { nekoType } = useClustering(data);

  return (
    <div>
      <h1>WebAssembly Example</h1>
      <p>Result:{nekoType}</p>
    </div>
  );
};

export default HelloWasm;
