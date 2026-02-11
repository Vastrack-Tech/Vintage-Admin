"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => void;
  isLoading: boolean;
  initialData?: any; // If present, we are in "Edit" mode
}

export function CategoryModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  initialData,
}: CategoryModalProps) {
  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: { name: "", description: "" },
  });

  // Populate form when editing
  useEffect(() => {
    if (initialData) {
      setValue("name", initialData.name);
      setValue("description", initialData.description || "");
    } else {
      reset({ name: "", description: "" });
    }
  }, [initialData, isOpen, reset, setValue]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-black">
            {initialData ? "Edit Category" : "Add New Category"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onConfirm)} className="space-y-4 text-black py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              {...register("name", { required: true })}
              placeholder="e.g. Wigs"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Short description..."
            />
          </div>
          <div className="flex justify-end text-white gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#DC8404] hover:bg-[#b86e03] text-white"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : initialData ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
