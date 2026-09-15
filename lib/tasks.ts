export type Task = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
};

export let tasks: Task[] = [
  {
    id: 1,
    title: "Apprendre Next.js",
    description: "Comprendre les bases de Next.js",
    completed: true,
  },
  {
    id: 2,
    title: "Créer le dashboard",
    description: "Construire le tableau de bord TaskFlow",
    completed: false,
  },
];