export interface QuizPrefs {
  style?: string;
  audience?: string;
  occasion?: string;
}

const PREF_KEY = "lifewear-quiz";
const SEEN_KEY = "lifewear-quiz-seen";
export const PREFS_EVENT = "lifewear:prefs-changed";

export function getQuizPrefs(): QuizPrefs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PREF_KEY);
    return raw ? (JSON.parse(raw) as QuizPrefs) : null;
  } catch {
    return null;
  }
}

export function saveQuizPrefs(prefs: QuizPrefs) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
  markQuizSeen();
  window.dispatchEvent(new CustomEvent(PREFS_EVENT));
}

export function hasSeenQuiz(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(SEEN_KEY) === "1";
}

export function markQuizSeen() {
  if (typeof window === "undefined") return;
  localStorage.setItem(SEEN_KEY, "1");
}
