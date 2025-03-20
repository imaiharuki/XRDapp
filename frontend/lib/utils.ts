import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const parseXRDFile = (content: string) => {
  try {
    const lines = content.split("\n");
    const data: { x: number; y: number }[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith("#")) {
        const parts = trimmedLine.split(/\s+/);
        if (parts.length >= 2) {
          const x = parseFloat(parts[0]);
          const y = parseFloat(parts[1]);
          if (!isNaN(x) && !isNaN(y)) {
            data.push({ x, y });
          }
        }
      }
    }

    if (data.length === 0) {
      throw new Error("有効なデータが見つかりませんでした");
    }

    return data;
  } catch (err) {
    console.error("ファイル解析エラー:", err);
    throw new Error("ファイルの解析中にエラーが発生しました");
  }
};
