/**
 * Tuned - Shared TypeScript Interfaces
 * Single source of truth for all domain-specific data structures.
 */

export type InputType = 'pdf' | 'image' | 'text' | 'docx' | 'audio' | 'link';

/**
 * NeuroPrint Profile - 0.0 to 1.0 weight per dimension
 */
export interface NeuroPrintVector {
  audio: number;            // Podcast script preference
  adhd: number;             // Sprint card preference
  scholar: number;          // Side-by-side / density preference
  lastUpdated: number;      // Unix timestamp
  manualOverride: boolean;  // True if user adjusted manually
}

/**
 * Normalized intermediate data from any input source
 */
export interface NormalizedContent {
  textBlocks: string[];       // Extracted raw text segments
  imageBlocks: string[];      // Base64 encoded images (for visual tasks)
  sourceType: InputType;
  targetConcepts?: string[];  // Extracted concepts from target exam/syllabus
  userNote?: string;          // Appended note from Upload Desk
}

/**
 * Parsa - ADHD Feature (Sprint Mode)
 */
export interface SprintCard {
  id: string;
  title: string;
  bullets: string[];
  challenge: string;          // Single quick-check question
  visualPrompt?: string;      // Optional Gemini-generated visual context
}

/**
 * Parsa - Universal Quiz System
 */
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: number;         // 1-10 invisible scale
  reframedAngle: string;      // Different way to ask (for rescue card)
}

export interface RescueCard {
  questionId: string;
  reframeText: string;        // "Let's look at this differently..."
  visualAid?: string;         // Simple diagram instruction for Gemini
}

/**
 * Soroush - Scholar Profile Feature
 */
export interface ScholarContent {
  originalText: string;
  simplifiedText: string;
  keyTerms: {
    term: string;
    definition: string;
    examRelevance: string;
  }[];
}

/**
 * Podcast script output (Speaker A/B dialogue)
 */
export interface PodcastScript {
  segments: {
    speaker: 'A' | 'B';
    text: string;
  }[];
}

/**
 * Unified response from the Gemini processing pipeline
 */
export interface ProcessedOutput {
  sessionId: string;
  neuroPrint: NeuroPrintVector;
  sprintCards: SprintCard[];
  scholar: ScholarContent;
  podcast: PodcastScript;
  conceptMapNodes: { id: string; label: string }[];
  conceptMapEdges: { source: string; target: string }[];
}

/**
 * Global application state
 */
export interface AppState {
  neuroPrint: NeuroPrintVector;
  currentSession?: ProcessedOutput;
  isLoading: boolean;
  error?: string;
  streak: number;             // ADHD / Universal streak counter
  theme: 'light' | 'dark';
}
