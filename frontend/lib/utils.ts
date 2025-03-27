import { XRDDataset } from "@/app/page";
import { FetchXRDData } from "@/components/DataTable/columns";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import * as XLSX from "xlsx";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const parseXRDFile = (content: string) => {
  try {
    const lines = content.split("\n");
    const x: number[] = [];
    const y: number[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith("#")) {
        const parts = trimmedLine.split(/\s+/);
        if (parts.length >= 2) {
          const xVal = parseFloat(parts[0]);
          const yVal = parseFloat(parts[1]);
          if (!isNaN(xVal) && !isNaN(yVal)) {
            x.push(xVal);
            y.push(yVal);
          }
        }
      }
    }

    if (x.length === 0) {
      throw new Error("有効なデータが見つかりませんでした");
    }

    return { x, y };
  } catch (err) {
    console.error("ファイル解析エラー:", err);
    throw new Error("ファイルの解析中にエラーが発生しました");
  }
};

export const EXCELexporter = (data: FetchXRDData) => {
  // ワークブックとワークシートの作成
  const wb = XLSX.utils.book_new();

  const FormattedDate = new Date(data.upload_date)
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");

  // XRDデータシートの作成
  const xrdData = [
    ["2θ", "Intensity"], // ヘッダー行
    ...data.x_value.map((x, index) => [x, data.y_value[index]]), // データ行
  ];
  const wsData = XLSX.utils.aoa_to_sheet(xrdData);

  // カラム幅の設定
  wsData["!cols"] = [
    { wch: 12 }, // 2θ
    { wch: 12 }, // Intensity
  ];

  // ワークブックにXRDデータシートを追加
  XLSX.utils.book_append_sheet(wb, wsData, "XRDデータ");

  // Excelファイルとしてダウンロード
  XLSX.writeFile(
    wb,
    `${FormattedDate}_${data.material}_[${data.elements.join("-")}]_${
      data.temperature
    }K.xlsx`
  );
};
