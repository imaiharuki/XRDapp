import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
