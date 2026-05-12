import type { LogoItem } from "@/types/logo";

export const getLogoUrl = (item: Pick<LogoItem, "logo_image_url" | "updated_at">) =>
  `${item.logo_image_url}?v=${encodeURIComponent(item.updated_at)}`;

export const getRandomItem = <T,>(array: readonly T[]): T =>
  array[Math.floor(Math.random() * array.length)];

export const shuffle = <T,>(array: readonly T[]): T[] =>
  [...array].sort(() => Math.random() - 0.5);

export interface QuizQuestion {
  logo: LogoItem;
  options: string[];
}

/**
 * Pick a quiz question avoiding recently used logos.
 * Returns the question plus the updated recently-used list (caller stores it).
 */
export const pickQuizQuestion = (
  logos: LogoItem[],
  recentlyUsed: string[],
): { question: QuizQuestion; nextRecentlyUsed: string[] } | null => {
  if (logos.length < 4) return null;

  const available = logos.filter((l) => !recentlyUsed.includes(l.id));
  const pool =
    available.length >= 4
      ? available
      : logos.filter((l) => !recentlyUsed.slice(-3).includes(l.id));

  const correct = getRandomItem(pool);
  const incorrect = shuffle(logos.filter((l) => l.id !== correct.id))
    .slice(0, 3)
    .map((l) => l.name);

  const options = shuffle([correct.name, ...incorrect]);

  return {
    question: { logo: correct, options },
    nextRecentlyUsed: [...recentlyUsed.slice(-4), correct.id],
  };
};

/**
 * Fuzzy match a spoken transcript against quiz option names.
 */
export const fuzzyMatchOption = (
  transcript: string,
  options: string[],
): string | null => {
  const t = transcript.toLowerCase().trim();
  const tWords = t.split(" ").filter((w) => w.length > 2);

  return (
    options.find((option) => {
      const o = option.toLowerCase();
      if (t.includes(o) || o.includes(t)) return true;
      const oWords = o.split(" ").filter((w) => w.length > 2);
      if (oWords.some((w) => t.includes(w))) return true;
      if (tWords.some((w) => o.includes(w))) return true;
      return false;
    }) ?? null
  );
};
