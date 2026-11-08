"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = (props: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      richColors
      closeButton
      position="top-right"
      toastOptions={{
        classNames: {
          toast: "group toast shadow-lg rounded-xl border",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "var(--success-bg)",
          "--success-text": "var(--success-fg)",
          "--success-border": "var(--success-border)",
          "--error-bg": "var(--destructive-bg)",
          "--error-text": "var(--destructive-fg)",
          "--error-border": "var(--destructive-border)",
          "--warning-bg": "var(--warning-bg)",
          "--warning-text": "var(--warning-fg)",
          "--warning-border": "var(--warning-border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };