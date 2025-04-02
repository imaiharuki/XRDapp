"use client";

import { Element } from "@/lib/const";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { DeleteData, EXCELexporter } from "@/lib/utils";
import { XRDDataset } from "@/app/page";
import UploadForm from "../UploadForm";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

export interface FetchXRDData {
  id: number;
  username: string;
  material: string;
  elements: Element[];
  temperature: number;
  x_value: number[];
  y_value: number[];
  upload_date: Date;
}

interface ColumnProps {
  onDataSelect: (data: XRDDataset) => void;
  onDelete?: () => void;
  onUpdate?: () => void;
}

export const columns = ({
  onDataSelect,
  onDelete,
  onUpdate,
}: ColumnProps): ColumnDef<FetchXRDData>[] => [
  {
    accessorKey: "material",
    header: "Material",
  },
  {
    accessorKey: "elements",
    header: "Elements",
  },
  {
    accessorKey: "username",
    header: "Name",
  },
  {
    accessorKey: "temperature",
    header: "温度 [K]",
  },
  {
    accessorKey: "upload_date",
    header: "最終更新日",
    cell: ({ row }) => {
      const date = new Date(row.getValue("upload_date"));
      return date.toLocaleString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Tokyo",
      });
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const data = row.original;

      const FormattedDate = new Date(data.upload_date)
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, "");

      const dataset: XRDDataset = {
        id: data.id,
        fileName: `${data.username}_${data.material}_${FormattedDate}_${data.temperature}K`,
        data: {
          x: data.x_value,
          y: data.y_value,
        },
      };

      const handleSelect = () => {
        onDataSelect(dataset);
      };

      const handleDelete = async () => {
        try {
          await DeleteData(data.id);
          onDelete?.();
        } catch (error) {
          console.error("削除に失敗しました:", error);
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={handleSelect}
              className="text-blue-600 justify-center font-bold"
            >
              SELECT
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                EXCELexporter(data);
              }}
              className="text-green-600 justify-center font-bold"
            >
              EXPORT
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-gray-600 font-bold "
              onClick={(e) => {
                e.preventDefault();
              }}
            >
              <UploadForm dataset={dataset} type="EDIT" onUpdate={onUpdate} />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-red-600 justify-center font-bold"
            >
              DELETE
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
