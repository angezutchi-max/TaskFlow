import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";

import { adminDb } from "@/lib/firebase-admin";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

async function getUserFromRequest(request: Request) {
  const authorization = request.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.replace("Bearer ", "");

  try {
    const decodedToken = await getAuth().verifyIdToken(token);

    return decodedToken;
  } catch (error) {
    console.error(
      "Erreur de vérification du token :",
      error
    );

    return null;
  }
}

// Récupérer une tâche
export async function GET(
  request: Request,
  { params }: Params
) {
  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      {
        message: "Non autorisé.",
      },
      {
        status: 401,
      }
    );
  }

  const { id } = await params;

  const document = await adminDb
    .collection("tasks")
    .doc(id)
    .get();

  if (!document.exists) {
    return NextResponse.json(
      {
        message: "Tâche introuvable.",
      },
      {
        status: 404,
      }
    );
  }

  const task = {
    id: document.id,
    ...document.data(),
  };

  if (task.userId !== user.uid) {
    return NextResponse.json(
      {
        message: "Non autorisé.",
      },
      {
        status: 403,
      }
    );
  }

  return NextResponse.json(task);
}

// Modifier une tâche
export async function PUT(
  request: Request,
  { params }: Params
) {
  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      {
        message: "Non autorisé.",
      },
      {
        status: 401,
      }
    );
  }

  const { id } = await params;

  const document = await adminDb
    .collection("tasks")
    .doc(id)
    .get();

  if (!document.exists) {
    return NextResponse.json(
      {
        message: "Tâche introuvable.",
      },
      {
        status: 404,
      }
    );
  }

  const task = document.data();

  if (task?.userId !== user.uid) {
    return NextResponse.json(
      {
        message: "Non autorisé.",
      },
      {
        status: 403,
      }
    );
  }

  const body = await request.json();

  const updatedTask = {
    title: body.title ?? task.title,
    description:
      body.description ?? task.description,
    completed:
      body.completed ?? task.completed,
    userId: task.userId,
  };

  await adminDb
    .collection("tasks")
    .doc(id)
    .update(updatedTask);

  return NextResponse.json({
    id,
    ...updatedTask,
  });
}

// Supprimer une tâche
export async function DELETE(
  request: Request,
  { params }: Params
) {
  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      {
        message: "Non autorisé.",
      },
      {
        status: 401,
      }
    );
  }

  const { id } = await params;

  const document = await adminDb
    .collection("tasks")
    .doc(id)
    .get();

  if (!document.exists) {
    return NextResponse.json(
      {
        message: "Tâche introuvable.",
      },
      {
        status: 404,
      }
    );
  }

  const task = document.data();

  if (task?.userId !== user.uid) {
    return NextResponse.json(
      {
        message: "Non autorisé.",
      },
      {
        status: 403,
      }
    );
  }

  await adminDb
    .collection("tasks")
    .doc(id)
    .delete();

  return NextResponse.json({
    message: "Tâche supprimée.",
  });
}