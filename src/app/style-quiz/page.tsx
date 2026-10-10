"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { QuizPanel } from "@/components/quiz";

export default function StyleQuizPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-[720px] px-4 py-14 lg:px-10">
      <div className="border border-hairline p-8 lg:p-12">
        <p className="flex items-center gap-2 text-[12px] uppercase tracking-hero text-quiet">
          <Sparkles size={14} strokeWidth={1.5} />
          Personalisation
        </p>
        <h1 className="mt-2 text-[24px] uppercase tracking-hero">
          The LifeWear Style Quiz
        </h1>
        <p className="mt-3 max-w-[520px] text-[14px] leading-relaxed text-quiet">
          Three quick questions. We'll reorder your homepage so the most
          relevant LifeWear appears first — no account needed.
        </p>
        <div className="mt-8 border-t border-hairline pt-8">
          <QuizPanel
            onDone={() => router.push("/")}
            onSkip={() => router.push("/")}
          />
        </div>
      </div>
      <p className="mt-4 text-center text-[13px] text-quiet">
        Prefer to browse?{" "}
        <Link href="/category/all" className="underline underline-offset-4 hover:text-black">
          Shop everything
        </Link>
      </p>
    </div>
  );
}
