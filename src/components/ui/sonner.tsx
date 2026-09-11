"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

/** Стеклянные тосты в стиле шапки/навбара (.glass-pill). */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "!rounded-[1.4rem] !border !border-white/50 !bg-white/65 !backdrop-blur-2xl !shadow-[0_8px_32px_rgba(38,24,82,0.12)] dark:!border-white/10 dark:!bg-[#2b2d31]/70 dark:!shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
          title: "!font-extrabold !italic !text-foreground",
          description: "!text-muted-foreground !font-medium",
          actionButton:
            "!rounded-full !bg-primary !text-primary-foreground !font-bold",
          cancelButton: "!rounded-full !bg-muted !text-foreground !font-bold",
          closeButton: "!rounded-full !border-white/50 !bg-white/65 !backdrop-blur-xl dark:!bg-[#2b2d31]/80",
        },
      }}
      style={
        {
          "--normal-bg": "transparent",
          "--normal-text": "var(--foreground)",
          "--normal-border": "transparent",
          "--border-radius": "1.4rem",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
