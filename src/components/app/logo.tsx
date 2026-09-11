"use client";

import { cn } from "@/lib/utils";

/** Логотип «Коробка» — 3D-куб с «?» на передней грани. */
export function Logo({
  size = 28,
  spin = true,
  className,
}: {
  size?: number;
  spin?: boolean;
  className?: string;
}) {
  const half = size / 2;
  const faces = [
    // front
    { t: `translateZ(${half}px)`, bg: "linear-gradient(135deg,#7c6cf0,#9d8df5)", content: true },
    // back
    { t: `rotateY(180deg) translateZ(${half}px)`, bg: "linear-gradient(135deg,#5b4bd4,#7c6cf0)" },
    // right
    { t: `rotateY(90deg) translateZ(${half}px)`, bg: "linear-gradient(135deg,#14b8a6,#2dd4bf)" },
    // left
    { t: `rotateY(-90deg) translateZ(${half}px)`, bg: "linear-gradient(135deg,#0e9488,#14b8a6)" },
    // top
    { t: `rotateX(90deg) translateZ(${half}px)`, bg: "linear-gradient(135deg,#a99af7,#c4b8fa)" },
    // bottom
    { t: `rotateX(-90deg) translateZ(${half}px)`, bg: "linear-gradient(135deg,#4a3f8f,#5b4bd4)" },
  ];

  return (
    <span
      className={cn("relative inline-block shrink-0 align-middle", className)}
      style={{ width: size, height: size, perspective: `${size * 4}px` }}
      aria-hidden="true"
    >
      <span
        className={cn("absolute inset-0 block", spin && "animate-[box-spin_9s_linear_infinite]")}
        style={{ transformStyle: "preserve-3d", transform: "rotateX(-14deg) rotateY(22deg)" }}
      >
        {faces.map((f, i) => (
          <span
            key={i}
            className="absolute inset-0 grid place-items-center rounded-[22%] border border-white/25 shadow-[inset_0_0_8px_rgba(255,255,255,0.35)]"
            style={{ transform: f.t, background: f.bg, backfaceVisibility: "hidden" }}
          >
            {f.content && (
              <span
                className="font-black italic text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
                style={{ fontSize: size * 0.58, lineHeight: 1 }}
              >
                ?
              </span>
            )}
          </span>
        ))}
      </span>
    </span>
  );
}
