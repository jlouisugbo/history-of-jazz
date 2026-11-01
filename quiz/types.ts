export interface Track {
  id: string;
  file: string;
  title: string;
  artist: string;
  answers?: string[];
}

export interface Exam {
  id: string;
  title: string;
  audioDir: string;
  answerMode?: "listed";
  tracks: Track[];
}

export interface Catalog {
  questionCount: number;
  choiceCount: number;
  pointsPerQuestion: number;
  excerptSeconds: number;
  exams: Exam[];
}

export interface Excerpt {
  start: number;
  length: number;
}

export interface Question {
  track: Track;
  selected: string | null;
  excerpt: Excerpt | null;
  pendingPlay?: boolean | null;
}

export interface Choice {
  letter: string;
  label: string;
}

export type Screen = "start" | "quiz" | "study" | "result";

export type ActiveMode = "quiz" | "study" | null;

export interface StudyPendingSeek {
  seconds: number;
  play: boolean;
}
