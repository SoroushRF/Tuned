import { SurveyQuestion } from '@/types';

export const SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'attention-proxy',
    text: "You open YouTube to 'quickly check something' before studying. 45 minutes later, what happened?",
    options: [
      { 
        label: "I got sucked into a documentary or explainer video", 
        deltas: { audio: 0.12, adhd: 0.05 },
        icon: "🎬"
      },
      { 
        label: "I have 14 tabs open and forgot what I was looking for", 
        deltas: { adhd: 0.18 },
        icon: "📑"
      },
      { 
        label: "I watched something in another language", 
        deltas: { scholar: 0.10 },
        icon: "🌐"
      },
      { 
        label: "I closed it and opened my notes. I hate wasting time", 
        deltas: { adhd: -0.05 },
        icon: "⏱️"
      }
    ]
  },
  {
    id: 'modality-proxy',
    text: "A concept finally 'clicks' for you. What just happened?",
    options: [
      { 
        label: "Someone drew it out or showed me a visual", 
        deltas: { audio: 0.08, adhd: 0.05 },
        icon: "🎨"
      },
      { 
        label: "I heard a story or real-world example", 
        deltas: { audio: 0.15 },
        icon: "📖"
      },
      { 
        label: "I re-read it slowly by myself", 
        deltas: { scholar: 0.10, adhd: -0.05 },
        icon: "🧘"
      },
      { 
        label: "Someone quizzed me and I had to retrieve it", 
        deltas: { adhd: 0.10 },
        icon: "🏹"
      }
    ]
  },
  {
    id: 'duration-proxy',
    text: "Honest answer: how long into a lecture before your mind goes somewhere else?",
    options: [
      { 
        label: "I'm gone within 10 minutes", 
        deltas: { adhd: 0.20 },
        icon: "💨"
      },
      { 
        label: "Around 25–30 minutes I start drifting", 
        deltas: { adhd: 0.10 },
        icon: "☁️"
      },
      { 
        label: "Depends entirely on how interesting it is", 
        deltas: { adhd: 0.05 },
        icon: "🎭"
      },
      { 
        label: "I stay locked in if I care about the topic", 
        deltas: { adhd: 0.0 },
        icon: "🔒"
      }
    ]
  },
  {
    id: 'language-proxy',
    text: "You're reading a dense academic paper. What's actually slowing you down?",
    options: [
      { 
        label: "The vocabulary — I keep hitting words I don't know", 
        deltas: { scholar: 0.20 },
        icon: "📓"
      },
      { 
        label: "The sentence structure — it's too nested and long", 
        deltas: { scholar: 0.15 },
        icon: "🧬"
      },
      { 
        label: "I lose track of the argument across paragraphs", 
        deltas: { adhd: 0.10, scholar: 0.05 },
        icon: "🧩"
      },
      { 
        label: "Nothing really — I read fast", 
        deltas: { scholar: -0.05 },
        icon: "⚡"
      }
    ]
  },
  {
    id: 'format-proxy',
    text: "You need to review 40 pages of notes the night before an exam. What do you actually do?",
    options: [
      { 
        label: "Read them out loud or wish I had a recording", 
        deltas: { audio: 0.20 },
        icon: "🎙️"
      },
      { 
        label: "Break them into small chunks and tackle one at a time", 
        deltas: { adhd: 0.15 },
        icon: "🧱"
      },
      { 
        label: "Read slowly and carefully, highlighting key terms", 
        deltas: { scholar: 0.12 },
        icon: "🖊️"
      },
      { 
        label: "Make a practice test and drill myself", 
        deltas: { adhd: 0.08 },
        icon: "🎯"
      }
    ]
  },
  {
    id: 'self-id',
    text: "Last one — any of these sound like you? Pick all that apply.",
    isMultiSelect: true,
    options: [
      { 
        label: "I learn better by listening than reading", 
        deltas: { audio: 0.35 },
        icon: "🎧"
      },
      { 
        label: "I struggle to focus for long stretches", 
        deltas: { adhd: 0.35 },
        icon: "⏳"
      },
      { 
        label: "English isn't my first language/academic writing slows me down", 
        deltas: { scholar: 0.35 },
        icon: "🌍"
      },
      { 
        label: "None of these apply to me", 
        deltas: {},
        icon: "✅"
      }
    ]
  }
];
