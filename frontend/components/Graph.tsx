import { Line } from "react-chartjs-2";
import { Button } from "@/components/ui/button";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import React, { useMemo } from "react";
import { XRDDataset } from "@/app/page";

// Chart.jsの登録
ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface GraphProps {
  datasets: XRDDataset[];
  onClear: () => void;
  xMin?: number; // 横軸の最小値（オプショナル）
  xMax?: number; // 横軸の最大値（オプショナル）
}

// データセットごとに異なる色を生成する関数
const getDatasetColor = (index: number) => {
  const colors = [
    "rgb(75, 192, 192)", // ターコイズ
    "rgb(255, 99, 132)", // ピンク
    "rgb(54, 162, 235)", // ブルー
    "rgb(255, 206, 86)", // イエロー
    "rgb(153, 102, 255)", // パープル
    "rgb(255, 159, 64)", // オレンジ
    "rgb(75, 192, 192)", // ターコイズ
    "rgb(255, 99, 132)", // ピンク
    "rgb(54, 162, 235)", // ブルー
    "rgb(255, 206, 86)", // イエロー
    "rgb(153, 102, 255)", // パープル
    "rgb(255, 159, 64)", // オレンジ
  ];
  return colors[index % colors.length];
};

// Y軸方向のオフセット値を計算する関数
const calculateOffset = (index: number) => {
  // 各データセットを10倍ずつずらす
  return Math.pow(10, index);
};

function GraphComponent({ datasets, onClear, xMax, xMin }: GraphProps) {
  const chartData = useMemo(
    () => ({
      datasets: datasets.map((dataset, index) => {
        const color = getDatasetColor(index);
        const offset = calculateOffset(index);
        return {
          label: `XRDデータ - ${dataset.fileName}`,
          data: Array.from({ length: dataset.data.x.length }, (_, i) => ({
            x: dataset.data.x[i],
            y: dataset.data.y[i] * offset,
          })),
          borderColor: color,
          backgroundColor: color.replace("rgb", "rgba").replace(")", ", 0.2)"),
          pointRadius: 0,
          showLine: true,
          borderWidth: 1,
        };
      }),
    }),
    [datasets]
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      scales: {
        x: {
          type: "linear" as const,
          title: {
            display: true,
            text: "2θ (度)",
          },
          min: xMin, // 最小値を設定
          max: xMax, // 最大値を設定
        },
        y: {
          type: "logarithmic" as const,
          title: {
            display: true,
            text: "強度",
          },
          ticks: {
            display: false, // Y軸の数値を非表示
          },
          grid: {
            display: true, // グリッド線は表示したままにする
            color: "rgba(0, 0, 0, 0.1)", // グリッド線の色を薄く設定
          },
        },
      },
      hover: {
        mode: null as any, // ホバー時のインタラクションを無効化
      },
      plugins: {
        legend: {
          position: "top" as const,
        },
        title: {
          display: true,
          text: "X線回折 (XRD) データ",
        },
        tooltip: {
          enabled: false, // ツールチップを無効化
        },
      },
    }),
    [xMax, xMin]
  );

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-end mb-4">
        <Button size="sm" onClick={onClear} variant={"destructive"}>
          データを消去
        </Button>
      </div>
      <div className="w-full h-[60vh]">
        <Line options={chartOptions} data={chartData} />
      </div>
    </div>
  );
}

export const Graph = React.memo(GraphComponent);
