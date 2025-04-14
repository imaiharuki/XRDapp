"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { Button } from "../components/ui/button";
import { z } from "zod";
import { ElementsList } from "@/lib/const";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { MultiSelect } from "./MultiSelect";
import { XRDDataset } from "@/app/page";
import { useToast } from "@/hooks/use-toast";

const FormSchema = z.object({
  username: z.string().min(1, {
    message: "名前を入力してください",
  }),

  elements: z.array(z.enum(ElementsList)).min(1, {
    message: "少なくとも1つの元素を選択してください",
  }),
  material: z.string().min(1, {
    message: "材料名を入力してください",
  }),
  temperature: z
    .number({
      required_error: "温度を入力してください",
      invalid_type_error: "温度は数値で入力してください",
    })
    .nonnegative({
      message: "温度は0以上の値を入力してください",
    }),
});

const UploadForm = ({
  dataset,
  type,
  onUpdate,
}: {
  dataset: XRDDataset;
  type: "Upload" | "EDIT";
  onUpdate?: () => void;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showUpdateAlert, setShowUpdateAlert] = useState<boolean>(false);
  const [pendingData, setPendingData] = useState<z.infer<
    typeof FormSchema
  > | null>(null);
  const {toast} = useToast()

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: type === "EDIT" ? dataset.fileName.split("_")[0] : "",
      material: type === "EDIT" ? dataset.fileName.split("_")[1] : "",
      elements: [],
      temperature:
        type === "EDIT"
          ? Number(dataset.fileName.split("_")[3].replace("K", ""))
          : 0,
    },
  });

  const handleTriggerClick = (e: React.MouseEvent) => {
    if (type === "EDIT") {
      e.stopPropagation();
    }
    setIsOpen(true);
  };

  const handleSubmitRequest = async (
    data: z.infer<typeof FormSchema>,
    exists: boolean
  ) => {
    const submitData = {
      username: data.username,
      material: data.material,
      elements: data.elements,
      temperature: data.temperature,
      x_value: dataset.data.x,
      y_value: dataset.data.y,
    };

    const endpoint = exists
      ? `http://localhost:8000/api/v1/update?id=${dataset.id}`
      : "http://localhost:8000/api/v1/upload";
    const method = exists ? "PUT" : "POST";

    const response = await fetch(endpoint, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(submitData),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("サーバーエラー詳細:", errorData);
      throw new Error(
        typeof errorData === "object"
          ? JSON.stringify(errorData, null, 2)
          : `エラー: ${response.status} - ${response.statusText}`
      );
    }

    const result = await response.json();
    console.log("送信完了:", result);

    form.reset();
    setIsOpen(false);
    onUpdate?.();
  };

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      setIsSubmitting(true);
      console.log("送信開始", data);

      if (typeof dataset.id === "number") {
        console.log("IDチェック開始:", dataset.id);
        const checkResponse = await fetch(
          `http://localhost:8000/api/v1/identity_check?id=${dataset.id}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            credentials: "include",
          }
        );

        if (!checkResponse.ok) {
          throw new Error(
            `ID確認中にエラーが発生しました: ${checkResponse.status}`
          );
        }

        const exists = await checkResponse.json();
        console.log("IDチェック結果:", exists);

        if (exists) {
          console.log("既存データ更新モード");
          setPendingData(data);
          setShowUpdateAlert(true);
          return;
        }
      }

      console.log("新規データ作成モード");
      await handleSubmitRequest(data, false);
      
      toast({
        title: "DATA UPLOAD",
        description: "データがアップロードされました"
      })
    } catch (error) {
      console.error("エラーが発生しました:", error);
      let errorMessage = "不明なエラーが発生しました";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === "object") {
        errorMessage = JSON.stringify(error, null, 2);
      }

      console.error("エラー詳細:", errorMessage);
      // TODO: エラーメッセージをUIに表示
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild onClick={handleTriggerClick}>
          {type === "Upload" ? (
            <Button variant={"outline"}>Upload</Button>
          ) : (
            <div className="w-full flex justify-center">EDIT</div>
          )}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload XRD file</DialogTitle>
            <DialogDescription>
              アップロードするXRDファイルの情報を追加してください
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>名前</FormLabel>
                    <FormControl>
                      <Input placeholder="名前" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="elements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>元素</FormLabel>
                    <FormControl>
                      <MultiSelect
                        selected={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription>
                      含まれる元素を記入してください。
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="material"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>材料</FormLabel>
                    <FormControl>
                      <Input placeholder="材料名" {...field} />
                    </FormControl>
                    <FormDescription>
                      測定した材料を記入してください。
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>温度 [K]</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="温度"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === "" ? 0 : Number(value));
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      測定時の温度を入力してください。
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  disabled={isSubmitting}
                  onClick={async () => {
                    console.log("直接送信");
                    const data = form.getValues();
                    if (form.formState.isValid) {
                      await onSubmit(data);
                    } else {
                      form.trigger();
                    }
                  }}
                >
                  {isSubmitting ? "送信中..." : "Upload"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showUpdateAlert} onOpenChange={setShowUpdateAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>データの更新確認</AlertDialogTitle>
            <AlertDialogDescription>
              このIDのデータは既に存在します。上書き更新してもよろしいですか？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowUpdateAlert(false)}>
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (pendingData) {
                  await handleSubmitRequest(pendingData, true);
                  setPendingData(null);
                  setShowUpdateAlert(false);
                }
              }}
            >
              更新する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UploadForm;
