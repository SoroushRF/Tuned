import { 
  ProcessedOutput, 
  NeuroPrintVector, 
  SprintCard, 
  QuizQuestion, 
  ScholarContent, 
  PodcastScript,
  AppState
} from '@/types';

export const mockAudioLearner: NeuroPrintVector = {
  audio: 0.9,
  adhd: 0.2,
  scholar: 0.1,
  lastUpdated: Date.now(),
  manualOverride: false
};

export const mockADHDLearner: NeuroPrintVector = {
  audio: 0.1,
  adhd: 0.9,
  scholar: 0.3,
  lastUpdated: Date.now(),
  manualOverride: false
};

export const mockNeuroPrint: NeuroPrintVector = mockAudioLearner;

/**
 * Mock Sprint Cards (ADHD Profile)
 */
export const mockSprintCards: SprintCard[] = [
  {
    id: "SC001",
    title: "Echo Chamber (Confirmation Bias)",
    bullets: ["Seek info confirming beliefs", "Ignore contradicting facts", "Minds love agreement", "Reinforces old ideas"],
    challenge: "I feed on what you already believe. What am I?",
    diagramPrompt: "Person in a thought bubble with 'Yes' signs",
    status: "pending",
    rescue: {
      reframeText: "Let’s slow it down and look at the idea from one level higher.",
      hint: "It’s the bias that prefers agreement over evidence.",
      visualAid: "A thought bubble with repeated approval marks"
    }
  },
  {
    id: "SC002",
    title: "Mental Spotlight (Availability Heuristic)",
    bullets: ["Easy recall means common", "Vivid stories sway judgment", "Recent events loom large", "Familiarity feels more likely"],
    challenge: "I make rare events seem common because they're loud in your memory.",
    diagramPrompt: "Brain with a spotlight on a single memory",
    status: "pending",
    rescue: {
      reframeText: "Try a simpler pass: this is about what feels easiest to remember, not what is actually most common.",
      hint: "If it comes to mind fast, it can feel more likely than it really is.",
      visualAid: "A spotlight aimed at one bright memory while other memories fade."
    }
  }
];

export const mockScholarContent: ScholarContent = {
  originalText: "Cognitive biases represent systematic deviations from rational judgment, arising from heuristic shortcuts employed by the brain to manage information complexity.",
  simplifiedText: "Cognitive biases are basically shortcuts our brains take. Think of it like a mental fast-pass lane. Instead of thinking through every detail (exhausting!), our brains use these quick rules, called 'heuristics.' Known glitches help us make intentional choices.",
  keyTerms: [
    {
      term: "Cognitive Bias",
      definition: "A systematic error in thinking that affects the decisions and judgments people make.",
      examRelevance: "Crucial for explaining irrational behavior in social contexts."
    },
    {
      term: "Heuristic",
      definition: "A mental shortcut that allows people to solve problems quickly.",
      examRelevance: "Key examples include availability and anchoring."
    }
  ]
};

export const mockPodcastScript: PodcastScript = {
  segments: [
    { speaker: "A", text: "Welcome to Mind Under Matter! We are decoding the software glitches of your brain: cognitive biases." },
    { speaker: "B", text: "Exactly! Like the Availability Heuristic—vivid stories feeling more true than numbers." }
  ]
};

export const mockQuizQuestions: QuizQuestion[] = [
  {
    id: 'critik',
    question: "Which bias makes you only look for things you already believe?",
    options: ["Confirmation Bias", "Anchoring Bias", "Optimism Bias", "Framing Effect"],
    correctIndex: 0,
    explanation: "Confirmation bias is the tendency to search for it, interpret it, and favor it.",
    difficulty: 2,
    reframedAngle: "Why do we feel 'right' even when we are wrong about a controversial topic?"
  }
];

export const mockProcessedOutput: ProcessedOutput = {
  sessionId: 'session_final',
  neuroPrint: mockNeuroPrint,
  sprintCards: mockSprintCards,
  scholar: mockScholarContent,
  podcast: mockPodcastScript,
  conceptMapNodes: [
    { id: "cb", label: "Cognitive Biases" },
    { id: "h", label: "Heuristics" }
  ],
  conceptMapEdges: [
    { source: "cb", target: "h" }
  ]
};

export const initialAppState: AppState = {
  neuroPrint: mockNeuroPrint,
  currentSession: undefined,
  isLoading: false,
  streak: 0,
  theme: 'dark'
};
