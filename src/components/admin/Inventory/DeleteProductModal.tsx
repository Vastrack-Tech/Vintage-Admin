"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface DeleteProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  productName?: string;
}

export function DeleteProductModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  productName,
}: DeleteProductModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px] bg-white">
        <DialogHeader>
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle size={20} />
            </div>
            <DialogTitle className="text-xl">Delete Product</DialogTitle>
          </div>
          <DialogDescription className="pt-2 text-gray-600 text-base">
            Are you sure you want to delete <strong>{productName}</strong>?
            <br />
            <span className="text-sm text-red-500 mt-2 block">
              This will also delete all variants associated with this product.
              This action cannot be undone.
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3 pt-6">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 rounded-xl"
          >
            {isLoading ? "Deleting..." : "Delete Product"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
