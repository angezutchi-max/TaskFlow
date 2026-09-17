import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";

import { adminDb } from "@/lib/firebase-admin";

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

// Récupérer les tâches de l'utilisateur connecté
export async function GET(request: Request) {
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

    const snapshot = await adminDb
      .collection("tasks")
      .where("userId", "==", user.uid)
      .get();

    const tasks = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(tasks);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des tâches :",
      error
    );

    return NextResponse.json(
      {
        message: "Impossible de récupérer les tâches.",
      },
      {
        status: 500,
      }
    );
  }
}

// Créer une nouvelle tâche
export async function POST(request: Request) {
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

    const body = await request.json();

    const title = body.title?.trim();
    const description = body.description?.trim() || "";
    const startDate = body.startDate || "";
    const endDate = body.endDate || "";

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

    const newTask = {
      title,
      description,
      completed: false,
      userId: user.uid,
      startDate,
      endDate,
    };

    const document = await adminDb
      .collection("tasks")
      .add(newTask);

    return NextResponse.json(
      {
        id: document.id,
        ...newTask,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Erreur lors de la création de la tâche :",
      error
    );

    return NextResponse.json(
      {
        message: "Impossible de créer la tâche.",
      },
      {
        status: 500,
      }
    );
  }
}