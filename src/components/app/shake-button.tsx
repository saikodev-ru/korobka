"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ButtonProps = React.ComponentProps<typeof Button> & {
  blocked?: boolean;
  blockedTitle?: string;
  blockedDescription?: string;
  onBlockedClick?: () => void;
};

/** Кнопка, которая трясётся и отказывается нажиматься, когда она заблокирована. */
export function ShakeButton({
  blocked,
  blockedTitle = "Нельзя!",
  blockedDescription,
  onBlockedClick,
  className,
  children,
  ...props
}: ButtonProps & {
  blocked?: boolean;
  blockedTitle?: string;
  blockedDescription?: string;
  onBlockedClick?: () => void;
}) {
  const [shaking, setShaking] = useState(false);

  return (
    <motion.div
      className="inline-flex"
      animate={
        shaking
          ? { x: [0, -7, 7, -5, 5, -3, 0], rotate: [0, -1.2, 1.2, -0.8, 0.8, 0] }
          : { x: 0, rotate: 0 }
      }
      transition={{ duration: 0.45 }}
      onAnimationComplete={() => setShaking(false)}
    >
      <Button
        className={cn(blocked && "opacity-60", className)}
        {...props}
        onClick={(e) => {
          if (blocked) {
            e.preventDefault();
            setShaking(true);
            try {
              navigator.vibrate?.(14);
            } catch {
              /* no-op */
            }
            if (blockedTitle || blockedDescription) {
              toast.warning(blockedTitle, { description: blockedDescription });
            }
            onBlockedClick?.();
            return;
          }
          props.onClick?.(e);
        }}
      >
        {children}
      </Button>
    </motion.div>
  );
}
