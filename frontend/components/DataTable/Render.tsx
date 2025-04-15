import React, { useEffect, useState, useCallback } from "react";
import { columns, FetchXRDData } from "./columns";
import DataTable from "./DataTable";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { RefreshCw } from "lucide-react";
import { XRDDataset } from "@/app/page";

interface DataRenderProps {
  onDataSelect: (data: XRDDataset) => void;
}

const getData = async (): Promise<FetchXRDData[]> => {
  try {
    const response = await fetch("api/v1/get", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`エラー: ${response.status} - ${response.statusText}`);
    }

    const XRDdatas = await response.json();
    return XRDdatas.map((data: FetchXRDData) => ({
      id: data.id,
      username: data.username,
      material: data.material,
      elements: data.elements,
      temperature: data.temperature,
      x_value: data.x_value,
      y_value: data.y_value,
      upload_date: new Date(data.upload_date),
    }));
  } catch (error) {
    console.error("データの取得に失敗しました:", error);
    throw error;
  }
};

const DataRender = ({ onDataSelect }: DataRenderProps) => {
  const [data, setData] = useState<FetchXRDData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const result = await getData();
      setData(result);
    } catch (error) {
      console.error("データの取得に失敗しました:", error);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, []);

  // 初回ロード時のデータフェッチ
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant={"secondary"}>XRDデータ</Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[80vw] sm:max-w-[80vw]">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>XRDデータベース</SheetTitle>
              <SheetDescription>
                データベースに記録されたXRDデータ
              </SheetDescription>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={fetchData}
              disabled={isRefreshing}
              className={isRefreshing ? "animate-spin" : ""}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>
        <div className="w-full py-10">
          {isLoading ? (
            <div className="text-center">データを読み込み中...</div>
          ) : (
            <DataTable
              columns={columns({
                onDataSelect,
                onDelete: fetchData,
                onUpdate: fetchData,
              })}
              data={data}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DataRender;
