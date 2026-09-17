"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
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

export default function Dashboard() {
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (!user) {
          router.replace("/login");
          return;
        }

        setUserEmail(user.email || "");

        async function loadTasks() {
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
            console.error(
              "Erreur lors du chargement des tâches :",
              error
            );
          } finally {
            setLoading(false);
          }
        }

        loadTasks();
      }
    );

    return () => unsubscribe();
  }, [router]);

  async function handleLogout() {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (error) {
      console.error(
        "Erreur lors de la déconnexion :",
        error
      );
    }
  }

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
        currentTasks.map((currentTask) =>
          currentTask.id === task.id
            ? {
                ...currentTask,
                completed: !currentTask.completed,
              }
            : currentTask
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
      {/* =========================
          EN-TÊTE
      ========================= */}

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

          {userEmail && (
            <p className="user-email">
              Connecté avec : {userEmail}
            </p>
          )}
        </div>

        <div className="dashboard-actions">
          <Link
            href="/dashboard/tasks/new"
            className="new-task-button"
          >
            <span>+</span>
            Nouvelle tâche
          </Link>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            Déconnexion
          </button>
        </div>
      </section>

      {/* =========================
          STATISTIQUES
      ========================= */}

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

      {/* =========================
          LISTE DES TÂCHES
      ========================= */}

      <section className="tasks-section">
        <div className="section-header">
          <div>
            <h2>Mes tâches</h2>

            <p>
              Sélectionne une tâche pour consulter ses
              détails.
            </p>
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
          <div className="tasks-list">
            {/* En-tête de la liste */}

            <div className="tasks-list-header">
              <span>Tâche</span>
              <span>État</span>
              <span>Date de fin</span>
              <span>Actions</span>
            </div>

            {/* Tâches */}

            {tasks.map((task) => (
              <div
                key={task.id}
                className={`task-row ${
                  task.completed ? "completed" : ""
                }`}
                onClick={() =>
                  router.push(
                    `/dashboard/tasks/${task.id}`
                  )
                }
              >
                {/* Titre uniquement */}

                <div className="task-row-title">
                  {task.title}
                </div>

                {/* État */}

                <div className="task-row-status">
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

                {/* Date de fin */}

                <div className="task-row-date">
                  {formatDate(task.endDate)}
                </div>

                {/* Actions */}

                <div
                  className="task-row-actions"
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                >
                  <button
                    type="button"
                    className="action-button complete"
                    onClick={() => toggleTask(task)}
                    title={
                      task.completed
                        ? "Remettre en cours"
                        : "Terminer"
                    }
                  >
                    {task.completed ? "↩" : "✓"}
                  </button>

                  <Link
                    href={`/dashboard/tasks/${task.id}/edit`}
                    className="action-button edit"
                    onClick={(event) =>
                      event.stopPropagation()
                    }
                  >
                    Modifier
                  </Link>

                  <button
                    type="button"
                    className="action-button delete"
                    onClick={() =>
                      deleteTask(task.id)
                    }
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