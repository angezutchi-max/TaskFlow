import { NextResponse } from "next/server";
import { tasks } from "@/lib/tasks";

// Récupérer toutes les tâches
export async function GET() {
  return NextResponse.json(tasks);
}

// Créer une nouvelle tâche
export async function POST(request: Request) {
  const body = await request.json();

  const newTask = {
    id: Date.now(),
    title: body.title,
    description: body.description,
    completed: false,
  };

  tasks.push(newTask);

  return NextResponse.json(newTask, {
    status: 201,
  });
}