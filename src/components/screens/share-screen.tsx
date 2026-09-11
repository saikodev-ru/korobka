"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Copy,
  Inbox,
  KeyRound,
  Send,
  Share2,
  Trash2,
  UserRoundPlus,
} from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import { decodeShareCode, encodeShareCode, shareText, tgLink } from "@/lib/share";
import { scheduleLabel } from "@/lib/schedule";
import { MemberAvatar } from "@/components/app/member-card";
import { cn } from "@/lib/utils";

/** Экран «Поделиться»: мой код ГД1 + импорт чужого. */
export function ShareScreen() {
  const me = useApp((s) => s.me);
  const friends = useApp((s) => s.friends);
  const shareStale = useApp((s) => s.shareStale);
  const markShared = useApp((s) => s.markShared);
  const addOrUpdateFriend = useApp((s) => s.addOrUpdateFriend);
  const removeFriend = useApp((s) => s.removeFriend);

  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const code = useMemo(() => encodeShareCode(me), [me]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
    markShared();
    toast.success("Код скопирован!", { description: "Отправь его друзьям в личку" });
  };

  const systemShare = async () => {
    markShared();
    if (navigator.share) {
      try {
        await navigator.share({ title: "Коробка", text: shareText(code) });
        return;
      } catch {
        /* отмена */
      }
    }
    void copy();
  };

  const importCode = () => {
    try {
      const m = decodeShareCode(input);
      const res = addOrUpdateFriend(m);
      toast.success(
        res === "added" ? `${m.name} в коробке!` : `${m.name} обновлён`,
        { description: "Его график теперь виден на вкладке «Сегодня»" },
      );
      setInput("");
    } catch (e) {
      toast.error("Не получилось", { description: e instanceof Error ? e.message : "Код не читается" });
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-4 px-4 pb-6 pt-4">
      {/* мой код */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-[1.75rem] p-5"
      >
        <div className="flex items-center gap-2">
          <KeyRound className="size-5 text-primary" />
          <p className="bang text-lg">Мой код ГД1</p>
          {shareStale && (
            <span className="ml-auto rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-primary">
              данные обновились
            </span>
          )}
        </div>
        <p className="mt-1 text-xs font-semibold text-muted-foreground">
          Отправь этот код друзьям — они увидят твой график и игры
        </p>

        <button
          type="button"
          onClick={copy}
          className={cn(
            "mt-3.5 w-full rounded-2xl border border-dashed border-primary/50 bg-primary/5 p-4 text-left transition-colors hover:bg-primary/10",
          )}
        >
          <p className="break-all font-mono text-[13px] font-bold leading-relaxed text-foreground/90">
            {code}
          </p>
        </button>

        <div className="mt-3.5 grid grid-cols-2 gap-2">
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={copy}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-extrabold text-primary-foreground shadow-[0_6px_18px_rgba(124,108,240,0.35)]"
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? "Скопировано" : "Копировать"}
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={systemShare}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-teal text-sm font-extrabold text-white shadow-[0_6px_18px_rgba(20,184,166,0.35)]"
          >
            <Share2 className="size-4" />
            Поделиться
          </motion.button>
        </div>
      </motion.section>

      {/* импорт кода */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card rounded-[1.75rem] p-5"
      >
        <div className="flex items-center gap-2">
          <Inbox className="size-5 text-teal" />
          <p className="bang text-lg">Код друга</p>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Вставь код ГД1.…"
          rows={3}
          className="mt-3 w-full resize-none rounded-2xl border border-input bg-card/70 p-3.5 font-mono text-[13px] font-bold outline-none placeholder:text-muted-foreground/60 focus-visible:ring-[3px] focus-visible:ring-ring/25"
        />
        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={importCode}
          disabled={input.trim().length < 10}
          className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-extrabold text-primary-foreground shadow-[0_6px_18px_rgba(124,108,240,0.35)] disabled:opacity-40"
        >
          <UserRoundPlus className="size-4" />
          Добавить друга
        </motion.button>
      </motion.section>

      {/* друзья */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-[1.75rem] p-5"
      >
        <p className="bang text-lg">Друзья в коробке</p>
        {friends.length === 0 ? (
          <p className="mt-2 text-sm font-semibold text-muted-foreground">
            Пока пусто. Обменяйся кодами с друзьями!
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {friends.map((f) => {
              const link = tgLink(f.tg);
              return (
                <li
                  key={f.id}
                  className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card/60 p-2.5"
                >
                  <MemberAvatar m={f} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold italic">{f.name}</p>
                    <p className="text-[11px] font-semibold text-muted-foreground">
                      {scheduleLabel(f.schedule)}
                      {f.tg ? ` · @${f.tg}` : ""}
                    </p>
                  </div>
                  {link && (
                    <a
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Написать ${f.name} в Telegram`}
                      className="grid size-9 place-items-center rounded-full bg-muted text-foreground transition hover:bg-teal hover:text-white active:scale-90"
                    >
                      <Send className="size-4" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      removeFriend(f.id);
                      toast(`${f.name} удалён из коробки`);
                    }}
                    aria-label={`Удалить ${f.name}`}
                    className="grid size-9 place-items-center rounded-full bg-muted text-muted-foreground transition hover:bg-destructive/15 hover:text-destructive active:scale-90"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </motion.section>
    </div>
  );
}
