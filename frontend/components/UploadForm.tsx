"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
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
  tempareture: z
    .number({
      required_error: "温度を入力してください",
      invalid_type_error: "温度は数値で入力してください",
    })
    .nonnegative({
      message: "温度は0以上の値を入力してください",
    }),
});

const UploadForm = ({ dataset }: { dataset: XRDDataset }) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: "",
      material: "",
      elements: [],
      tempareture: undefined,
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      console.log("送信開始");
      console.log("フォームデータ:", data);

      // XRDデータセットと送信データを結合
      const submitData = {
        username: data.username,
        material: data.material,
        elements: data.elements,
        tempareture: data.tempareture,
        x_value: dataset.data.x,
        y_value: dataset.data.y,
      };

      // APIエンドポイントにPOSTリクエストを送信
      const response = await fetch("https://localhost:8000/api/v1/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error(`エラー: ${response.status}`);
      }

      const result = await response.json();
      console.log("response:", response);
      console.log("送信完了:", result);

      // 成功時の処理（例: ダイアログを閉じる、成功メッセージを表示するなど）
    } catch (error) {
      console.error("エラーが発生しました:", error);
      // エラー処理（例: エラーメッセージを表示するなど）
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"}>Upload</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload XRD file</DialogTitle>
          <DialogDescription>
            アップロードするXRDファイルの情報を追加してください
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();

              form.handleSubmit(onSubmit)(e);
            }}
            className="space-y-4"
          >
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
              name="tempareture"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>温度</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="温度"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
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
              <Button type="submit">Upload</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadForm;
