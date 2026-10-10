"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import {
  getQuizPrefs,
  hasSeenQuiz,
  markQuizSeen,
  saveQuizPrefs,
  type QuizPrefs,
} from "@/lib/prefs";

const QUESTIONS: {
  key: keyof QuizPrefs;
  question: string;
  options: { label: string; value: string }[];
}[] = [
  {
    key: "style",
    question: "What's your style?",
    options: [
      { label: "Casual", value: "casual" },
      { label: "Streetwear", value: "streetwear" },
      { label: "Formal", value: "formal" },
      { label: "Minimalist", value: "minimalist" },
    ],
  },
  {
    key: "audience",
    question: "Who are you shopping for?",
    options: [
      { label: "Myself", value: "myself" },
      { label: "Partner", value: "partner" },
      { label: "Kids", value: "kids" },
      { label: "Family", value: "family" },
    ],
  },
  {
    key: "occasion",
    question: "What's the occasion?",
    options: [
      { label: "Everyday", value: "everyday" },
      { label: "Work", value: "work" },
      { label: "Workout", value: "workout" },
      { label: "Special", value: "special" },
    ],
  },
];

export function QuizPanel({
  onDone,
  onSkip,
}: {
  onDone?: () => void;
  onSkip?: () => void;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizPrefs>({});
  const [finished, setFinished] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const existing = getQuizPrefs();
    if (existing) setAnswers(existing);
  }, []);

  const answer = (key: keyof QuizPrefs, value: string) => {
    const next = { ...answers, [key]: value };
    setAnswers(next);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      saveQuizPrefs(next);
      setFinished(true);
      setTimeout(() => {
        onDone?.();
        router.refresh();
      }, 1400);
    }
  };

  const q = QUESTIONS[step];

  return (
    <div>
      {!finished ? (
        <>
          <div className="mb-1 flex items-center justify-between">
            <p className="text-[12px] uppercase tracking-hero text-quiet">
              Question {step + 1} of {QUESTIONS.length}
            </p>
            <div className="flex gap-1.5">
              {QUESTIONS.map((_, i) => (
                <span
                  key={i}
                  className={`h-[3px] w-8 ${i <= step ? "bg-black" : "bg-hairline"}`}
                />
              ))}
            </div>
          </div>
          <h2 className="mt-4 text-[18px] uppercase tracking-hero">
            {q.question}
          </h2>
          <div className="mt-5 flex flex-col gap-2.5">
            {q.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => answer(q.key, opt.value)}
                className={`flex h-11 items-center justify-between border px-4 text-[14px] transition-colors ${
                  answers[q.key] === opt.value
                    ? "border-black bg-surface"
                    : "border-hairline hover:border-black"
                }`}
              >
                {opt.label}
                {answers[q.key] === opt.value && (
                  <Check size={15} strokeWidth={1.5} />
                )}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              markQuizSeen();
              onSkip?.();
            }}
            className="mt-5 text-[13px] text-quiet underline underline-offset-4 hover:text-black"
          >
            Skip for now
          </button>
        </>
      ) : (
        <div className="py-6 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center border border-black">
            <Check size={22} strokeWidth={1.5} />
          </span>
          <h2 className="mt-4 text-[18px] uppercase tracking-hero">
            You're all set
          </h2>
          <p className="mt-2 text-[14px] text-quiet">
            Your homepage is now personalised to your LifeWear style.
          </p>
        </div>
      )}
    </div>
  );
}

export default function QuizModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (hasSeenQuiz()) return;
    const t = setTimeout(() => setOpen(true), 900);
    return () => clearTimeout(t);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => {
          markQuizSeen();
          setOpen(false);
        }}
      />
      <div className="relative w-full max-w-[440px] border border-hairline bg-white p-7">
        <button
          aria-label="Close"
          onClick={() => {
            markQuizSeen();
            setOpen(false);
          }}
          className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center hover:bg-surface"
        >
          <X size={18} strokeWidth={1.5} />
        </button>
        <p className="text-[12px] uppercase tracking-hero text-quiet">
          Welcome to UNIQLO
        </p>
        <h1 className="mt-1 text-[20px] uppercase tracking-hero">
          Find your LifeWear
        </h1>
        <p className="mt-2 text-[14px] text-quiet">
          Answer 3 quick questions and we'll tailor your homepage.
        </p>
        <div className="mt-5 border-t border-hairline pt-5">
          <QuizPanel
            onDone={() => setOpen(false)}
            onSkip={() => setOpen(false)}
          />
        </div>
      </div>
    </div>
  );
}
