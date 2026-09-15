import { NextResponse } from "next/server";
import { tasks } from "@/lib/tasks";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

// Récupérer une tâche
export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const taskId = Number(id);

  const task = tasks.find((task) => task.id === taskId);

  if (!task) {
    return NextResponse.json(
      {
        message: "Tâche introuvable.",
      },
      {
        status: 404,
      }
    );
  }

  return NextResponse.json(task);
}

// Modifier une tâche
export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const taskId = Number(id);

  const body = await request.json();

  const task = tasks.find((task) => task.id === taskId);

  if (!task) {
    return NextResponse.json(
      {
        message: "Tâche introuvable.",
      },
      {
        status: 404,
      }
    );
  }

  task.title = body.title ?? task.title;
  task.description = body.description ?? task.description;
  task.completed = body.completed ?? task.completed;

  return NextResponse.json(task);
}

// Supprimer une tâche
export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  const taskId = Number(id);

  const index = tasks.findIndex((task) => task.id === taskId);

  if (index === -1) {
    return NextResponse.json(
      {
        message: "Tâche introuvable.",
      },
      {
        status: 404,
      }
    );
  }

  tasks.splice(index, 1);

  return NextResponse.json({
    message: "Tâche supprimée.",
  });
}