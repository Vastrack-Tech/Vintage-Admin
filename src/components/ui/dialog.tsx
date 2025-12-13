"use client";

import * as React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import clsx from "clsx";

// Simple classnames helper (we also have clsx installed, using it above)

export type DialogProps = React.ComponentProps<typeof RadixDialog.Root> & {
  children: React.ReactNode;
};

export function Dialog({ children, ...props }: DialogProps) {
  // This component is a thin wrapper around Radix Dialog.Root to match your import usage
  return <RadixDialog.Root {...props}>{children}</RadixDialog.Root>;
}

// Optional trigger if you want to use it elsewhere
export const DialogTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof RadixDialog.Trigger>
>(function DialogTrigger({ children, ...props }, ref) {
  return (
    <RadixDialog.Trigger ref={ref as any} {...props}>
      {children}
    </RadixDialog.Trigger>
  );
});

export interface DialogContentProps
  extends React.ComponentProps<typeof RadixDialog.Content> {
  className?: string;
}

export const DialogContent = React.forwardRef<
  HTMLDivElement,
  DialogContentProps
>(function DialogContent({ className, children, ...props }, ref) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />

      <RadixDialog.Content
        ref={ref as any}
        {...props}
        className={clsx(
          "fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-lg focus:outline-none",
          className
        )}
      >
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
});

export const DialogHeader: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ children, className }) => {
  return (
    <div className={clsx("mb-2 flex flex-col space-y-1", className)}>
      {children}
    </div>
  );
};

export const DialogFooter: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ children, className }) => {
  return (
    <div
      className={clsx(
        "mt-4 flex items-center justify-end space-x-2",
        className
      )}
    >
      {children}
    </div>
  );
};

export const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<typeof RadixDialog.Title> & { className?: string }
>(function DialogTitle({ className, children, ...props }, ref) {
  return (
    <RadixDialog.Title
      ref={ref as any}
      {...props}
      className={clsx(
        "text-lg font-semibold leading-none tracking-tight",
        className
      )}
    >
      {children}
    </RadixDialog.Title>
  );
});

export const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<typeof RadixDialog.Description> & { className?: string }
>(function DialogDescription({ className, children, ...props }, ref) {
  return (
    <RadixDialog.Description
      ref={ref as any}
      {...props}
      className={clsx("text-sm text-muted-foreground", className)}
    >
      {children}
    </RadixDialog.Description>
  );
});

export default Dialog;
