import { 
  ProcessedOutput, 
  NeuroPrintVector, 
  SprintCard, 
  QuizQuestion, 
  ScholarContent, 
  PodcastScript,
  AppState
} from '@/types';

/**
 * Mock NeuroPrint Profile (Blended Learner)
 */
export const mockNeuroPrint: NeuroPrintVector = {
  audio: 0.85,             // Strong audio preference
  adhd: 0.70,              // High ADHD (fast-paced focus cards)
  scholar: 0.35,           // Lower weight for dense text
  lastUpdated: Date.now(),
  manualOverride: false
};

/**
 * Mock Sprint Cards (ADHD Profile)
 */
export const mockSprintCards: SprintCard[] = [
  {
    id: 's1',
    title: 'Cellular Mitosis',
    bullets: [
      'Prophase: Chromosomes condense',
      'Metaphase: Chromosomes align in middle',
      'Anaphase: Sister chromatids pull apart'
    ],
    challenge: 'Where do chromosomes align during Metaphase?',
    visualPrompt: 'A simple diagram of cell division with labeled phases'
  },
  {
    id: 's2',
    title: 'Metaphase Details',
    bullets: [
      'Microtubules attach to kinetochores',
      'Spindle fibers pull from opposite poles',
      'Checkpoint ensures accurate separation'
    ],
    challenge: 'What attaches to the kinetochores?',
    visualPrompt: 'Microscopic view of spindle fibers'
  }
];

/**
 * Mock Scholar Side-by-Side (Scholar Profile)
 */
export const mockScholarContent: ScholarContent = {
  originalText: 'Mitosis is a process of nuclear division in eukaryotic cells that occurs when a parent cell divides to produce two identical daughter cells. During cell division, mitosis refers specifically to the separation of the duplicated genetic material carried in the nucleus.',
  simplifiedText: 'Mitosis is how animal cells clone themselves. One "parent" cell splits into two perfect "daughter" copies. It specifically focuses on how the instructions (DNA) in the nucleus get separated correctly.',
  keyTerms: [
    {
      term: 'Eukaryotic',
      definition: 'Cells that contain a nucleus and other membrane-bound organelles.',
      examRelevance: 'Likely to appear in multiple-choice definitions of cell types.'
    },
    {
      term: 'Genetic Material',
      definition: 'Information stored in DNA that determines the traits of an organism.',
      examRelevance: 'Core concept for all biology units.'
    }
  ]
};

/**
 * Mock Podcast Script (Audio Profile)
 */
export const mockPodcastScript: PodcastScript = {
  segments: [
    { speaker: 'A', text: "Alright, let's talk about mitosis. It's basically the cell's way of cloning itself, right?" },
    { speaker: 'B', text: "Exactly. But it's not just a messy split. It's a very choreographed dance of chromosomes." },
    { speaker: 'A', text: "Wait, so it's all about making sure both new cells get the exact same DNA instructions?" },
    { speaker: 'B', text: "Spot on. If one cell misses a chromosome, the whole system breaks down." }
  ]
};

/**
 * Mock Quiz System
 */
export const mockQuizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'During which phase of mitosis do chromosomes align in the center of the cell?',
    options: ['Prophase', 'Metaphase', 'Anaphase', 'Telophase'],
    correctIndex: 1,
    explanation: 'Metaphase is the "middle" phase where alignment happens.',
    difficulty: 3,
    reframedAngle: 'If you were looking through a microscope and saw a straight line of chromosomes, what phase are you in?'
  }
];

/**
 * Unified Session Output
 */
export const mockProcessedOutput: ProcessedOutput = {
  sessionId: 'session_123',
  neuroPrint: mockNeuroPrint,
  sprintCards: mockSprintCards,
  scholar: mockScholarContent,
  podcast: mockPodcastScript,
  conceptMapNodes: [
    { id: '1', label: 'Mitosis' },
    { id: '2', label: 'Prophase' },
    { id: '3', label: 'Metaphase' },
    { id: '4', label: 'Anaphase' }
  ],
  conceptMapEdges: [
    { source: '1', target: '2' },
    { source: '1', target: '3' },
    { source: '1', target: '4' }
  ]
};

/**
 * Initial Global State
 */
export const initialAppState: AppState = {
  neuroPrint: mockNeuroPrint,
  currentSession: mockProcessedOutput,
  isLoading: false,
  streak: 5
};
