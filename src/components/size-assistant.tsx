"use client";

import { useEffect, useRef, useState } from "react";
import { Ruler, Send, X } from "lucide-react";

type Role = "bot" | "user";
interface Message {
  role: Role;
  text: string;
}

type Stage = "chest" | "length" | "done";

const LADDER = ["XS", "S", "M", "L", "XL", "XXL"];

function sizeForChest(cm: number): string {
  if (cm < 44) return "XS";
  if (cm <= 47) return "S";
  if (cm <= 51) return "M";
  if (cm <= 55) return "L";
  if (cm <= 59) return "XL";
  return "XXL";
}

export default function SizeAssistant({
  open,
  onClose,
  productName,
  sizes,
  onRecommend,
}: {
  open: boolean;
  onClose: () => void;
  productName: string;
  sizes: string[];
  onRecommend: (size: string) => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [stage, setStage] = useState<Stage>("chest");
  const [chest, setChest] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [result, setResult] = useState<{ rec: string; relaxed: string } | null>(
    null
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  const botSay = (text: string, delay = 550): Promise<void> =>
    new Promise((resolve) => {
      setTyping(true);
      setTimeout(() => {
        setMessages((prev) => [...prev, { role: "bot", text }]);
        setTyping(false);
        resolve();
      }, delay);
    });

  useEffect(() => {
    if (!open) return;
    setMessages([]);
    setStage("chest");
    setChest(null);
    setInput("");
    setResult(null);
    let cancelled = false;
    (async () => {
      await botSay(
        "Hi! Let's find your perfect size 👋 Grab any T-shirt that fits you well right now."
      );
      if (cancelled) return;
      await botSay(
        "Using a measuring tape or ruler, measure the chest width of that T-shirt — from one armpit seam to the other (lay it flat). How many cm is it?"
      );
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typing]);

  if (!open) return null;

  const toProductSize = (ladderSize: string): string => {
    if (sizes.includes(ladderSize)) return ladderSize;
    const idx = LADDER.indexOf(ladderSize);
    return sizes[Math.min(Math.max(idx, 0), sizes.length - 1)];
  };

  const handleSubmit = () => {
    const value = parseFloat(input.replace(",", "."));
    setMessages((prev) => [...prev, { role: "user", text: input || "—" }]);
    setInput("");

    if (isNaN(value) || value <= 0 || value > 150) {
      void botSay(
        "Hmm, that doesn't look right. Please enter the measurement in centimetres as a number, for example 52."
      );
      return;
    }

    if (stage === "chest") {
      setChest(value);
      setStage("length");
      void botSay(
        "Got it! Now measure the length — from the shoulder seam down to the bottom hem. How many cm?"
      );
    } else if (stage === "length") {
      setStage("done");
      const base = sizeForChest(chest ?? value);
      const idx = LADDER.indexOf(base);
      const relaxed = LADDER[Math.min(idx + 1, LADDER.length - 1)];
      const rec = toProductSize(base);
      const relaxedProduct = toProductSize(relaxed);
      setResult({ rec, relaxed: relaxedProduct });
      void botSay(
        `Perfect! Based on your measurements, your size in this product is ${rec}. We recommend ${rec} for a regular fit${
          relaxedProduct !== rec
            ? ` or ${relaxedProduct} if you prefer a relaxed fit.`
            : "."
        }`
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute bottom-0 right-0 flex h-[520px] w-full flex-col border border-hairline bg-white sm:bottom-6 sm:right-6 sm:w-[380px]">
        {/* header */}
        <div className="flex h-12 items-center justify-between border-b border-hairline px-4">
          <span className="flex items-center gap-2 text-[13px] uppercase tracking-hero">
            <Ruler size={15} strokeWidth={1.5} />
            Size Assistant
          </span>
          <button
            aria-label="Close size assistant"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center hover:bg-surface"
          >
            <X size={17} strokeWidth={1.5} />
          </button>
        </div>

        {/* messages */}
        <div
          ref={scrollRef}
          className="flex-1 space-y-3 overflow-y-auto bg-white p-4"
        >
          <p className="text-center text-[11px] uppercase tracking-hero text-quiet">
            {productName}
          </p>
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <p
                className={`max-w-[85%] px-3.5 py-2.5 text-[14px] leading-relaxed ${
                  m.role === "user"
                    ? "bg-surface text-black"
                    : "border border-hairline bg-white text-black"
                }`}
              >
                {m.text}
              </p>
            </div>
          ))}
          {typing && (
            <div className="flex justify-start">
              <span className="border border-hairline px-3.5 py-2.5 text-[14px] text-quiet">
                ···
              </span>
            </div>
          )}
          {result && (
            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={() => {
                  onRecommend(result.rec);
                  onClose();
                }}
                className="flex h-10 items-center justify-center bg-black text-[13px] uppercase tracking-hero text-white hover:bg-[#222]"
              >
                Use size {result.rec}
              </button>
              {result.relaxed !== result.rec && (
                <button
                  onClick={() => {
                    onRecommend(result.relaxed);
                    onClose();
                  }}
                  className="flex h-10 items-center justify-center border border-black text-[13px] uppercase tracking-hero hover:bg-surface"
                >
                  Use {result.relaxed} (relaxed)
                </button>
              )}
            </div>
          )}
        </div>

        {/* input */}
        <div className="flex border-t border-hairline">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            inputMode="decimal"
            placeholder={
              stage === "chest"
                ? "Chest width in cm (e.g. 52)"
                : stage === "length"
                  ? "Length in cm (e.g. 68)"
                  : "Ask again or pick your size"
            }
            disabled={stage === "done"}
            className="h-11 flex-1 px-3 text-[14px] outline-none placeholder:text-quiet disabled:bg-white"
          />
          <button
            aria-label="Send"
            onClick={handleSubmit}
            disabled={stage === "done"}
            className="flex h-11 w-11 items-center justify-center bg-black text-white hover:bg-[#222] disabled:bg-hairline"
          >
            <Send size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
