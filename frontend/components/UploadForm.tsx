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
  temperature: z
    .number({
      required_error: "温度を入力してください",
      invalid_type_error: "温度は数値で入力してください",
    })
    .nonnegative({
      message: "温度は0以上の値を入力してください",
    }),
});

const UploadForm = ({ dataset }: { dataset: XRDDataset }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: "",
      material: "",
      elements: [],
      temperature: 0,
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      setIsSubmitting(true);
      console.log("送信開始");

      // XRDデータセットと送信データを結合
      const submitData = {
        username: data.username,
        material: data.material,
        elements: data.elements,
        temperature: data.temperature,
        x_value: dataset.data.x,
        y_value: dataset.data.y,
      };

      console.log("フォームデータ:", submitData);

      // APIエンドポイントにPOSTリクエストを送信
      const response = await fetch("http://localhost:8000/api/v1/upload", {
        method: "POST",
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

      // 成功時の処理
      form.reset(); // フォームをリセット
      setIsOpen(false); // ダイアログを閉じる
      // TODO: 成功メッセージをトースト通知などで表示
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
              name="temperature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>温度</FormLabel>
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "送信中..." : "Upload"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadForm;
