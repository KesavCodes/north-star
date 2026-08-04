import { JournalTemplate } from "../types";

export const DEFAULT_JOURNAL_TEMPLATES: JournalTemplate[] = [
  {
    id: "tpl-blank",
    name: "Blank Document",
    icon: "📝",
    description: "Start with a clean document for freeform writing.",
    isDefault: true,
    content: "",
  },
  {
    id: "tpl-daily-reflection",
    name: "Daily Reflection",
    icon: "🌟",
    description: "Review what went well, lessons learned, and gratitude.",
    isDefault: true,
    content: `Daily Reflection

🌟 Day in Brief:
Summary of today's key events and thoughts...

🚀 What Went Well:
- 

💡 What Could Be Improved:
- 

🙏 Grateful For:
- 
`,
  },
  {
    id: "tpl-gratitude-journal",
    name: "Gratitude & Positivity",
    icon: "💖",
    description: "Focus on daily gratitude, morning intentions, and highlights.",
    isDefault: true,
    content: `Gratitude Journal

☀️ Morning Intentions:
My main focus and mindset for today is...

💖 3 Things I Am Grateful For:
1. 
2. 
3. 

✨ Highlight of the Day:
The best moment of today was...
`,
  },
  {
    id: "tpl-daily-log",
    name: "Bullet Journal Log",
    icon: "🎯",
    description: "Track priority wins, brain dumps, and energy levels.",
    isDefault: true,
    content: `Daily Log & Tasks

🎯 Priority Wins:
- 
- 

🧠 Brain Dump & Notes:
- 

🔋 Energy & Focus Level (1-10):
`,
  },
  {
    id: "tpl-evening-review",
    name: "Evening Wind Down",
    icon: "🌙",
    description: "Reflect on how you feel and set intentions for tomorrow.",
    isDefault: true,
    content: `Evening Review

🌙 How do I feel right now?

🏆 Today's Top Achievement:

😴 Mindset & Plan for Tomorrow:
`,
  },
];
