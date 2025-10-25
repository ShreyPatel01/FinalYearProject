"use client";

import { PlusIcon } from "@radix-ui/react-icons";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface CreateCategoryPopoverProps {
  onCreate: (categoryName: string) => void;
  onPress: () => void;
  open: boolean;
}

const CreateCategoryPopover: React.FC<CreateCategoryPopoverProps> = ({
  onCreate,
  onPress,
  open,
}) => {
  const [categoryName, setCategoryName] = useState<string | null>(null);
  return (
    <Popover open={open} onOpenChange={onPress}>
      <PopoverTrigger className="mt-1.5 w-fit p-2 bg-transparent rounded-lg ml-12 hover:bg-black hover:bg-opacity-5 transition-all ease-in-out ">
        <div className="flex flex-row text-black font-semibold">
          Create Category
          <PlusIcon className="w-5 h-5 mt-0.5 text-black ml-2" />
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col">
          <p className="text-xl font-semibold w-full text-center">
            New Category Name
          </p>
          <Input
            type="text"
            className="text-black text-lg mt-4"
            onChange={(e) => {
              setCategoryName(e.target.value);
              console.log(e.target.value);
            }}
          />
          <Button
            className="bg-slate-50 mt-4 text-black hover:text-white"
            onClick={() => {
              if (categoryName) {
                onCreate(categoryName);
              }
            }}
            disabled={categoryName !== null && categoryName.trim().length === 0}
          >
            Create New Category
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CreateCategoryPopover;
