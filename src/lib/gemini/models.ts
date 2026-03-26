/**
 * Nuro Neural Model Configuration
 * Centralized source of truth for all Gemini model assignments.
 */

// Core Synthesis Engine (Balanced reasoning + Multimodal depth)
// User chosen: Gemini 3 Flash for performance vs speed balance
export const GEMINI_CORE_MODEL = 'gemini-3-flash-preview';

// Low-Latency Reflex Engine (High-speed generation + cost efficiency)
// Optimized for: Quizzes, Socratic tutoring, Onboarding analysis
export const GEMINI_FAST_MODEL = 'gemini-3.1-flash-lite-preview';

// Specialized Text-to-Speech (Audio modality)
// Stay on 2.5 series as there is no 3.x TTS variant yet
export const GEMINI_AUDIO_MODEL = 'gemini-2.5-flash-preview-tts';
