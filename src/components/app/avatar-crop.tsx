"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, ZoomIn, ZoomOut } from "lucide-react";

/** Простой кроп-редактор аватара: зум + перетаскивание, результат 128×128 pixelated. */
export function AvatarCrop({
  src,
  onDone,
  onCancel,
}: {
  src: string;
  onDone: (dataUrl: string) => void;
  onCancel: () => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const boxSize = 264;

  const crop = useCallback(() => {
    const img = new Image();
    img.onload = () => {
      const OUT = 128;
      const canvas = document.createElement("canvas");
      canvas.width = OUT;
      canvas.height = OUT;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.imageSmoothingEnabled = false;
      // вписываем изображение в бокс с cover-логикой
      const base = Math.max(boxSize / img.width, boxSize / img.height);
      const w = img.width * base * zoom;
      const h = img.height * base * zoom;
      const dx = (boxSize - w) / 2 + offset.x;
      const dy = (boxSize - h) / 2 + offset.y;
      const scale = OUT / boxSize;
      ctx.drawImage(img, dx * scale, dy * scale, w * scale, h * scale);
      onDone(canvas.toDataURL("image/png"));
    };
    img.src = src;
  }, [zoom, offset, onDone, src]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      className="fixed inset-0 z-[70] flex flex-col items-center justify-center gap-5 bg-black/70 p-5 backdrop-blur-md"
    >
      <p className="bang text-lg text-white">Кадрируй фотку</p>

      <div
        className="relative cursor-grab overflow-hidden rounded-3xl border-2 border-white/30 shadow-2xl active:cursor-grabbing"
        style={{ width: boxSize, height: boxSize, touchAction: "none" }}
        onPointerDown={(e) => {
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          dragRef.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
        }}
        onPointerMove={(e) => {
          if (!dragRef.current) return;
          setOffset({
            x: dragRef.current.ox + (e.clientX - dragRef.current.x),
            y: dragRef.current.oy + (e.clientY - dragRef.current.y),
          });
        }}
        onPointerUp={() => (dragRef.current = null)}
        onPointerCancel={() => (dragRef.current = null)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="кроп"
          draggable={false}
          className="pointer-events-none absolute left-1/2 top-1/2 max-w-none pixelated"
          style={{
            width: "auto",
            height: "auto",
            transform: `translate(-50%,-50%) translate(${offset.x}px,${offset.y}px) scale(${zoom})`,
            minWidth: boxSize,
            minHeight: boxSize,
            objectFit: "cover",
          }}
        />
        <div className="pointer-events-none absolute inset-0 rounded-3xl shadow-[inset_0_0_0_9999px_rgba(0,0,0,0.35)]" />
        <div className="pointer-events-none absolute inset-6 rounded-full border-2 border-dashed border-white/60" />
      </div>

      <div className="glass-pill flex w-full max-w-[264px] items-center gap-2 rounded-full px-3 py-2">
        <button
          type="button"
          aria-label="Меньше"
          onClick={() => setZoom((z) => Math.max(1, +(z - 0.15).toFixed(2)))}
          className="grid size-8 place-items-center rounded-full transition hover:bg-black/10 active:scale-90 dark:hover:bg-white/10"
        >
          <ZoomOut className="size-4" />
        </button>
        <input
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={zoom}
          onChange={(e) => setZoom(+e.target.value)}
          className="h-1.5 flex-1 accent-[#7c6cf0]"
          aria-label="Масштаб"
        />
        <button
          type="button"
          aria-label="Больше"
          onClick={() => setZoom((z) => Math.min(3, +(z + 0.15).toFixed(2)))}
          className="grid size-8 place-items-center rounded-full transition hover:bg-black/10 active:scale-90 dark:hover:bg-white/10"
        >
          <ZoomIn className="size-4" />
        </button>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-white/40 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-white/10 active:scale-95"
        >
          Отмена
        </button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.93 }}
          onClick={crop}
          className="flex items-center gap-2 rounded-full bg-primary px-7 py-2.5 text-sm font-extrabold text-white shadow-lg transition hover:brightness-110"
        >
          <Check className="size-4" />
          Готово
        </motion.button>
      </div>
    </motion.div>
  );
}
