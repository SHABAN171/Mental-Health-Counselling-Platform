import type { AssessmentType, RiskLevel } from "@/generated/prisma/enums";

export type Questionnaire = {
  type: AssessmentType;
  title: string;
  description: string;
  questions: string[];
  options: { value: number; label: string }[];
  maxScore: number;
  scoreToRisk: (score: number) => RiskLevel;
};

const FREQUENCY_OPTIONS = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "Several days" },
  { value: 2, label: "More than half the days" },
  { value: 3, label: "Nearly every day" },
];

export const QUESTIONNAIRES: Record<AssessmentType, Questionnaire> = {
  DEPRESSION: {
    type: "DEPRESSION",
    title: "Depression screening",
    description: "Over the last 2 weeks, how often have you been bothered by the following?",
    questions: [
      "Little interest or pleasure in doing things",
      "Feeling down, depressed, or hopeless",
      "Trouble falling asleep, staying asleep, or sleeping too much",
      "Feeling tired or having little energy",
      "Poor appetite or overeating",
      "Feeling bad about yourself, or that you are a failure",
      "Trouble concentrating on things such as reading or watching TV",
      "Moving or speaking noticeably slower than usual, or being unusually fidgety or restless",
      "Thoughts that you would be better off dead, or of hurting yourself in some way",
    ],
    options: FREQUENCY_OPTIONS,
    maxScore: 27,
    scoreToRisk: (score) => {
      if (score <= 4) return "MINIMAL";
      if (score <= 9) return "MILD";
      if (score <= 14) return "MODERATE";
      if (score <= 19) return "MODERATELY_SEVERE";
      return "SEVERE";
    },
  },
  ANXIETY: {
    type: "ANXIETY",
    title: "Anxiety screening",
    description: "Over the last 2 weeks, how often have you been bothered by the following?",
    questions: [
      "Feeling nervous, anxious, or on edge",
      "Not being able to stop or control worrying",
      "Worrying too much about different things",
      "Trouble relaxing",
      "Being so restless that it's hard to sit still",
      "Becoming easily annoyed or irritable",
      "Feeling afraid as if something awful might happen",
    ],
    options: FREQUENCY_OPTIONS,
    maxScore: 21,
    scoreToRisk: (score) => {
      if (score <= 4) return "MINIMAL";
      if (score <= 9) return "MILD";
      if (score <= 14) return "MODERATE";
      return "SEVERE";
    },
  },
  STRESS: {
    type: "STRESS",
    title: "Stress assessment",
    description: "Over the last month, how often have you felt or experienced the following?",
    questions: [
      "Felt overwhelmed by your responsibilities",
      "Felt unable to control the important things in your life",
      "Had trouble relaxing because of stress",
      "Felt physically tense (headaches, muscle tension, etc.)",
      "Felt irritable or easily frustrated",
      "Felt like things were piling up and hard to manage",
      "Had difficulty sleeping due to stress or worry",
      "Felt mentally or emotionally exhausted",
    ],
    options: FREQUENCY_OPTIONS,
    maxScore: 24,
    scoreToRisk: (score) => {
      if (score <= 6) return "MINIMAL";
      if (score <= 12) return "MILD";
      if (score <= 18) return "MODERATE";
      return "SEVERE";
    },
  },
};

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  MINIMAL: "Minimal",
  MILD: "Mild",
  MODERATE: "Moderate",
  MODERATELY_SEVERE: "Moderately severe",
  SEVERE: "Severe",
};

export const RISK_LEVEL_RECOMMENDATIONS: Record<RiskLevel, string> = {
  MINIMAL:
    "Your responses suggest minimal symptoms right now. Keep an eye on how you're feeling, and consider trying the mood tracker to spot any changes over time.",
  MILD:
    "Your responses suggest mild symptoms. Self-care, the educational resources on this platform, and continued mood tracking may help. Consider talking to a counselor if things don't improve.",
  MODERATE:
    "Your responses suggest moderate symptoms. Speaking with one of our counselors could be genuinely helpful — consider booking a session.",
  MODERATELY_SEVERE:
    "Your responses suggest moderately severe symptoms. We strongly recommend booking a session with a counselor soon.",
  SEVERE:
    "Your responses suggest severe symptoms. Please consider reaching out to a licensed mental health professional as soon as possible. If you are in crisis or having thoughts of self-harm, contact your local emergency number or a crisis line right away (in the US: call or text 988).",
};
