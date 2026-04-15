export interface TaskTemplate {
  id: string;
  name: string;
  emoji: string;
  tasks: { name: string; estPomodoros: number }[];
}

export const DEFAULT_TEMPLATES: TaskTemplate[] = [
  {
    id: 'study-routine',
    name: 'Study Routine',
    emoji: '📖',
    tasks: [
      { name: 'Review notes', estPomodoros: 1 },
      { name: 'Read chapter', estPomodoros: 2 },
      { name: 'Practice exercises', estPomodoros: 2 },
      { name: 'Summary & flashcards', estPomodoros: 1 },
    ],
  },
  {
    id: 'deep-work',
    name: 'Deep Work Session',
    emoji: '🧠',
    tasks: [
      { name: 'Plan & prioritize', estPomodoros: 1 },
      { name: 'Deep work block', estPomodoros: 4 },
      { name: 'Review & document', estPomodoros: 1 },
    ],
  },
  {
    id: 'morning-routine',
    name: 'Morning Routine',
    emoji: '🌅',
    tasks: [
      { name: 'Inbox zero', estPomodoros: 1 },
      { name: 'Planning & goals', estPomodoros: 1 },
      { name: 'Most important task', estPomodoros: 2 },
    ],
  },
  {
    id: 'coding',
    name: 'Coding Sprint',
    emoji: '💻',
    tasks: [
      { name: 'Review PRs & issues', estPomodoros: 1 },
      { name: 'Feature development', estPomodoros: 3 },
      { name: 'Testing & debugging', estPomodoros: 2 },
      { name: 'Code review & docs', estPomodoros: 1 },
    ],
  },
  {
    id: 'writing',
    name: 'Writing Session',
    emoji: '✍️',
    tasks: [
      { name: 'Research & outline', estPomodoros: 1 },
      { name: 'First draft', estPomodoros: 3 },
      { name: 'Edit & revise', estPomodoros: 2 },
    ],
  },
];
