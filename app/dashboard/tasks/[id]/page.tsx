"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getAuth,
  onAuthStateChanged,
} from "firebase/auth";

import app from "@/lib/firebase";

type Task = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  startDate: string;
  endDate: string;
};

const auth = getAuth(app);

function formatDate(date: string) {
  if (!date) {
    return "Non définie";
  }

  const [year, month, day] = date.split("-");

  return `${day}/${month}/${year}`;
}

export default function TaskDetails() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (!user) {
          router.replace("/login");
          return;
        }

        setCheckingAuth(false);

        async function getTask() {
          try {
            const token = await user.getIdToken();

            const response = await fetch(
              `/api/tasks/${id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const data = await response.json();

            if (!response.ok) {
              setError(
                data.message ||
                  "Impossible de récupérer cette tâche."
              );
              return;
            }

            setTask(data);
          } catch (error) {
            console.error("Erreur :", error);
            setError("Une erreur est survenue.");
          } finally {
            setLoading(false);
          }
        }

        getTask();
      }
    );

    return () => unsubscribe();
  }, [id, router]);

  if (checkingAuth || loading) {
    return (
      <main className="task-details-page">
        <div className="task-details-container">
          <p className="loading-message">
            Chargement de la tâche...
          </p>
        </div>
      </main>
    );
  }

  if (error || !task) {
    return (
      <main className="task-details-page">
        <div className="task-details-container">
          <button
            type="button"
            className="back-button"
            onClick={() => router.push("/dashboard")}
          >
            ← Retour au dashboard
          </button>

          <div className="form-error">
            {error || "Tâche introuvable."}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="task-details-page">
      <div className="task-details-container">
        <button
          type="button"
          className="back-button"
          onClick={() => router.push("/dashboard")}
        >
          ← Retour au dashboard
        </button>

        <div className="task-details-card">
          <div className="task-details-header">
            <div>
              <span
                className={
                  task.completed
                    ? "task-status completed"
                    : "task-status pending"
                }
              >
                {task.completed
                  ? "Terminée"
                  : "En cours"}
              </span>

              <h1>{task.title}</h1>
            </div>
          </div>

          <div className="task-details-section">
            <h2>Description</h2>

            <p>
              {task.description ||
                "Aucune description pour cette tâche."}
            </p>
          </div>

          <div className="task-details-dates">
            <div className="task-date">
              <span className="task-date-label">
                Date de début
              </span>

              <strong>
                {formatDate(task.startDate)}
              </strong>
            </div>

            <div className="task-date">
              <span className="task-date-label">
                Date de fin
              </span>

              <strong>
                {formatDate(task.endDate)}
              </strong>
            </div>
          </div>

          <div className="task-details-actions">
            <button
              type="button"
              className="edit-task-button"
              onClick={() =>
                router.push(
                  `/dashboard/tasks/${task.id}/edit`
                )
              }
            >
              Modifier la tâche
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}