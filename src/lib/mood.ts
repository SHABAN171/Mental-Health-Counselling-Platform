import type { Mood } from "@/generated/prisma/enums";

export const MOOD_OPTIONS: { value: Mood; emoji: string; label: string }[] = [
  { value: "HAPPY", emoji: "\u{1F60A}", label: "Happy" },
  { value: "NORMAL", emoji: "\u{1F610}", label: "Normal" },
  { value: "SAD", emoji: "\u{1F622}", label: "Sad" },
  { value: "ANGRY", emoji: "\u{1F621}", label: "Angry" },
  { value: "ANXIOUS", emoji: "\u{1F630}", label: "Anxious" },
];

export const MOOD_SCORE: Record<Mood, number> = {
  ANGRY: 1,
  ANXIOUS: 2,
  SAD: 3,
  NORMAL: 4,
  HAPPY: 5,
};

export const MOOD_EMOJI: Record<Mood, string> = Object.fromEntries(
  MOOD_OPTIONS.map((o) => [o.value, o.emoji])
) as Record<Mood, string>;

export const MOOD_LABEL: Record<Mood, string> = Object.fromEntries(
  MOOD_OPTIONS.map((o) => [o.value, o.label])
) as Record<Mood, string>;

export const SCORE_TO_EMOJI: Record<number, string> = {
  1: MOOD_EMOJI.ANGRY,
  2: MOOD_EMOJI.ANXIOUS,
  3: MOOD_EMOJI.SAD,
  4: MOOD_EMOJI.NORMAL,
  5: MOOD_EMOJI.HAPPY,
};
