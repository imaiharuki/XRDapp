"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Graph } from "@/components/Graph";
import { parseXRDFile } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import Filelist from "@/components/Filelist";
import DataRender from "@/components/DataTable/Render";

// ここの実装
// 本来はクライアント側で与えられるstringのidと
// データベースで与えられるnumberのidを分割する必要がある
// データベースのスキーマ変更とマイグレーションが面倒でやっていないが、不都合が起きたら変更する
// 現状、idがstringのデータはクライアントからサーバーに送っていないデータ
// idがnumberのデータはサーバーから渡されたデータ
// 本来管理するidはstringのid

export interface XRDDataset {
  id: string | number;
  fileName: string;
  data: { x: number[]; y: number[] };
}

export default function Home() {
  const [datasets, setDatasets] = useState<XRDDataset[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [xMax, setXMax] = useState<number>(120);
  const [xMin, setXMin] = useState<number>(0);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsLoading(true);
      setError(null);

      const newDatasets = await Promise.all(
        Array.from(files).map(async (file) => {
          const content = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = () =>
              reject(new Error("ファイルの読み込み中にエラーが発生しました"));
            reader.readAsText(file);
          });

          const data = parseXRDFile(content);
          return {
            id: crypto.randomUUID(),
            fileName: file.name,
            data: data,
          };
        })
      );

      setDatasets((prev) => [...prev, ...newDatasets]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
      event.target.value = "";
    }
  };

  const handleDataUpload = ({ id, fileName, data }: XRDDataset) => {
    setDatasets((prev) => [...prev, { id, fileName, data }]);
  };

  const handleRemoveDataset = (id: string | number) => {
    setDatasets((prev) => prev.filter((dataset) => dataset.id !== id));
  };

  const handleClear = () => {
    setDatasets([]);
    setError(null);
  };

  return (
    <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-8 sm:p-12 font-[family-name:var(--font-geist-sans)]">
      <header className="w-full max-w-4xl text-center">
        <h1 className="text-2xl font-bold mb-4">XRDデータビューア</h1>
        <p className="text-sm text-gray-600 mb-6">
          X線回折（XRD）ファイルをアップロードし、対数スケールでデータを表示します
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild variant={"default"}>
            <label htmlFor="xrd-file" className="cursor-pointer">
              <Input
                type="file"
                id="xrd-file"
                className="hidden"
                accept=".xy,.txt,.csv"
                onChange={handleFileUpload}
                multiple
              />
              XRDファイルを選択
            </label>
          </Button>
          <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
            <Filelist datasets={datasets} onRemove={handleRemoveDataset} />
          </div>
          <DataRender onDataSelect={handleDataUpload} />
        </div>
      </header>

      <main className="w-full max-w-4xl">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>読み込み中...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64 text-red-500">
            <p>{error}</p>
          </div>
        ) : datasets.length > 0 ? (
          <>
            <Graph
              datasets={datasets}
              onClear={handleClear}
              xMax={xMax}
              xMin={xMin}
            />
            <div className="flex justify-between pt-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <label htmlFor="theta-max">Θ-Min</label>
                <Input
                  type="number"
                  placeholder="Θ-min"
                  onChange={(e) => setXMin(Number(e.target.value))}
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <label htmlFor="theta-max">Θ-Max</label>
                <Input
                  type="number"
                  placeholder="Θ-max"
                  onChange={(e) => setXMax(Number(e.target.value))}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center h-64 text-gray-400">
            <p>XRDファイルをアップロードしてください</p>
          </div>
        )}
      </main>

      <footer className="text-sm text-gray-500">
        <p>© 2025 XRDデータビューア</p>
      </footer>
    </div>
  );
}
