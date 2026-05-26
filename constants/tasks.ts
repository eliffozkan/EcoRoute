export interface Task {
  id: string;
  icon: string;
  nameKey: keyof typeof import('./translations').translations['en'];
  descKey: keyof typeof import('./translations').translations['en'];
  points: number;
}

export const TASKS = [
  { id: 'cup', icon: '🥤', nameKey: 'task1Name', descKey: 'task1Desc', points: 10 },
  { id: 'recycle', icon: '♻️', nameKey: 'task2Name', descKey: 'task2Desc', points: 10 },
  { id: 'plate', icon: '🍽️', nameKey: 'task3Name', descKey: 'task3Desc', points: 10 },
  { id: 'device', icon: '💻', nameKey: 'task4Name', descKey: 'task4Desc', points: 10 },
] as const;

export type TaskId = typeof TASKS[number]['id'];
