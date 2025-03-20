import { XRDDataset } from "@/app/page";
import React from "react";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

const Filelist = ({
  datasets,
  onRemove,
}: {
  datasets: XRDDataset[];
  onRemove: (id: string) => void;
}) => {
  return (
    // datasetがないときはborderを消したい
    <div
      className={cn(
        "flex flex-col justify-center gap-2",
        datasets.length > 0 && "border-2 border-gray-300 rounded-md p-2"
      )}
    >
      {datasets.map((dataset: XRDDataset) => (
        <div className="flex items-center justify-between">
          <div
            key={dataset.id}
            className="flex items-center bg-gray-100 rounded-full px-3 py-1 justify-between"
          >
            <span className="text-sm">{dataset.fileName}</span>
            <Button
              variant="ghost"
              size="icon"
              className="ml-1 h-6 w-6"
              onClick={() => onRemove(dataset.id)}
            >
              <X size={14} className="cursor-pointer" />
            </Button>
          </div>
          <div className="ml-2">
            <Sheet>
              <SheetTrigger>
                <Button variant={"outline"}>Upload</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Upload XRD file</SheetTitle>
                  <SheetDescription>
                    アップロードするXRDファイルの情報を追加してください
                  </SheetDescription>
                </SheetHeader>

                <SheetFooter>
                  <SheetClose asChild>
                    <Button type="submit">Upload</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Filelist;
