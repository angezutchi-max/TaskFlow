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
  try {
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
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de la tâche :",
      error
    );

    return NextResponse.json(
      {
        message: "Impossible de récupérer la tâche.",
      },
      {
        status: 500,
      }
    );
  }
}

// Modifier une tâche
export async function PUT(
  request: Request,
  { params }: Params
) {
  try {
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

    const title =
      body.title !== undefined
        ? body.title.trim()
        : task.title;

    if (!title) {
      return NextResponse.json(
        {
          message: "Le titre est obligatoire.",
        },
        {
          status: 400,
        }
      );
    }

    const updatedTask = {
      title,
      description:
        body.description !== undefined
          ? body.description.trim()
          : task.description || "",
      completed:
        body.completed !== undefined
          ? body.completed
          : task.completed,
      startDate:
        body.startDate !== undefined
          ? body.startDate
          : task.startDate || "",
      endDate:
        body.endDate !== undefined
          ? body.endDate
          : task.endDate || "",
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
  } catch (error) {
    console.error(
      "Erreur lors de la modification de la tâche :",
      error
    );

    return NextResponse.json(
      {
        message: "Impossible de modifier la tâche.",
      },
      {
        status: 500,
      }
    );
  }
}

// Supprimer une tâche
export async function DELETE(
  request: Request,
  { params }: Params
) {
  try {
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
  } catch (error) {
    console.error(
      "Erreur lors de la suppression de la tâche :",
      error
    );

    return NextResponse.json(
      {
        message: "Impossible de supprimer la tâche.",
      },
      {
        status: 500,
      }
    );
  }
}