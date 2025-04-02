"use client";

import * as React from "react";
import { X } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ElementsList, Element } from "@/lib/const";

export type Option = {
  value: Element;
  label: string;
  group?: string;
};

interface MultiSelectProps {
  selected: Element[];
  onChange?: (selected: Element[]) => void;
  placeholder?: string;
  className?: string;
  maxSelections?: number;
}

export function MultiSelect({
  selected = [],
  onChange,
  placeholder = "元素を選択...",
  className,
  maxSelections = Number.POSITIVE_INFINITY,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleUnselect = (item: Element) => {
    onChange?.(selected.filter((i) => i !== item));
  };

  const handleSelect = (item: Element) => {
    if (selected.includes(item)) {
      onChange?.(selected.filter((i) => i !== item));
    } else if (selected.length < maxSelections) {
      onChange?.([...selected, item]);
    }
  };

  const options: Option[] = ElementsList.map((element) => ({
    value: element,
    label: element,
  }));

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          onClick={(e) => {
            e.stopPropagation();
            setOpen(!open);
          }}
        >
          <div className="flex flex-wrap gap-1">
            {selected.length > 0 ? (
              selected.map((item) => (
                <div key={item} className="flex items-center gap-1">
                  <div
                    className={cn(
                      "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold",
                      "border-transparent bg-secondary text-secondary-foreground"
                    )}
                  >
                    {item}
                    <span
                      role="button"
                      tabIndex={0}
                      className="ml-1 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnselect(item);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleUnselect(item);
                        }
                      }}
                    >
                      <X className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="元素を検索..." />
          <CommandList>
            <CommandEmpty>元素が見つかりません。</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => {
                    handleSelect(option.value);
                    setOpen(true);
                  }}
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      selected.includes(option.value)
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <X className="h-3 w-3" />
                  </div>
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
