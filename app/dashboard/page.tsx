"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
};

const auth = getAuth(app);

export default function Dashboard() {
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (!user) {
          router.replace("/login");
          return;
        }

        async function getTasks() {
          try {
            const token = await user.getIdToken();

            const response = await fetch("/api/tasks", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (!response.ok) {
              throw new Error(
                "Impossible de récupérer les tâches."
              );
            }

            const data = await response.json();

            setTasks(data);
          } catch (error) {
            console.error("Erreur :", error);
          } finally {
            setLoading(false);
          }
        }

        getTasks();
      }
    );

    return () => unsubscribe();
  }, [router]);

  async function deleteTask(id: string) {
    const user = auth.currentUser;

    if (!user) {
      return;
    }

    try {
      const token = await user.getIdToken();

      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error(
          "Impossible de supprimer la tâche."
        );
        return;
      }

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== id)
      );
    } catch (error) {
      console.error(
        "Erreur lors de la suppression :",
        error
      );
    }
  }

  async function toggleTask(task: Task) {
    const user = auth.currentUser;

    if (!user) {
      return;
    }

    try {
      const token = await user.getIdToken();

      const response = await fetch(
        `/api/tasks/${task.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            completed: !task.completed,
          }),
        }
      );

      if (!response.ok) {
        console.error(
          "Impossible de modifier la tâche."
        );
        return;
      }

      setTasks((currentTasks) =>
        currentTasks.map((t) =>
          t.id === task.id
            ? {
                ...t,
                completed: !t.completed,
              }
            : t
        )
      );
    } catch (error) {
      console.error(
        "Erreur lors de la modification :",
        error
      );
    }
  }

  if (loading) {
    return (
      <main className="dashboard">
        <div className="loading">
          <p>Chargement...</p>
        </div>
      </main>
    );
  }

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const pendingTasks = tasks.filter(
    (task) => !task.completed
  ).length;

  return (
    <main className="dashboard">
      <section className="dashboard-header">
        <div>
          <p className="dashboard-label">
            TABLEAU DE BORD
          </p>

          <h1>Bonjour</h1>

          <p className="dashboard-description">
            Voici un aperçu de tes tâches et de ta
            progression.
          </p>
        </div>

        <Link
          href="/dashboard/tasks/new"
          className="new-task-button"
        >
          <span>+</span>
          Nouvelle tâche
        </Link>
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">✓</div>

          <div>
            <p>Total des tâches</p>
            <h2>{tasks.length}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">✓</div>

          <div>
            <p>Tâches terminées</p>
            <h2>{completedTasks}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">◷</div>

          <div>
            <p>En cours</p>
            <h2>{pendingTasks}</h2>
          </div>
        </div>
      </section>

      <section className="tasks-section">
        <div className="section-header">
          <div>
            <h2>Mes tâches</h2>
            <p>Gère tes tâches quotidiennes.</p>
          </div>

          <span className="task-count">
            {tasks.length} tâche
            {tasks.length > 1 ? "s" : ""}
          </span>
        </div>

        {tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✓</div>

            <h3>Aucune tâche</h3>

            <p>
              Tu n&apos;as pas encore créé de tâche.
            </p>

            <Link
              href="/dashboard/tasks/new"
              className="empty-button"
            >
              Créer ma première tâche
            </Link>
          </div>
        ) : (
          <div className="tasks-grid">
            {tasks.map((task) => (
              <div
                className={`task-card ${
                  task.completed ? "completed" : ""
                }`}
                key={task.id}
              >
                <div className="task-card-top">
                  <span
                    className={`status ${
                      task.completed
                        ? "status-completed"
                        : "status-pending"
                    }`}
                  >
                    {task.completed
                      ? "Terminée"
                      : "En cours"}
                  </span>
                </div>

                <h3>{task.title}</h3>

                <p className="task-description">
                  {task.description ||
                    "Aucune description."}
                </p>

                <div className="task-actions">
                  <button
                    className="action-button complete"
                    onClick={() => toggleTask(task)}
                  >
                    {task.completed
                      ? "↩ En cours"
                      : "✓ Terminer"}
                  </button>

                  <Link
                    href={`/dashboard/tasks/${task.id}/edit`}
                    className="action-button edit"
                  >
                    Modifier
                  </Link>

                  <button
                    className="action-button delete"
                    onClick={() => deleteTask(task.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}