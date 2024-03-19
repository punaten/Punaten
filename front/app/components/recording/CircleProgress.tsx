import { Box, CircleProgressLabel } from "@yamada-ui/react";
import React from "react";

interface CircleProgressProps {
  value: number; // 進捗値 (0 - 100)
  innerText: string;
  size?: number; // サイズ (ピクセル単位)
  strokeWidth?: number; // 線の太さ (ピクセル単位)
  strokeColor?: string; // 進捗バーの色
  backgroundColor?: string; // 背景色
}

const CircleProgress: React.FC<CircleProgressProps> = ({
  value,
  innerText,
  size = 100,
  strokeWidth = 10,
  strokeColor = "blue",
  backgroundColor = "transparent",
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / 100) * circumference;
  const center = size / 2;

  return (
    <svg width={size} height={size}>
      {/* 背景円 */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={backgroundColor}
        strokeWidth={strokeWidth}
      />
      {/* 進捗バー */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={circumference - progress}
        strokeLinecap="round"
        transform={`rotate(-90 ${center} ${center})`}
      />
      <text
        x={center}
        y={center + strokeWidth / 4}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={strokeWidth * 0.8}
        fill={strokeColor}
      >
        {innerText}
      </text>
    </svg>
  );
};

export default CircleProgress;