"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Task = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
};

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getTasks() {
      try {
        const response = await fetch("/api/tasks");
        const data = await response.json();

        setTasks(data);
      } catch (error) {
        console.error("Erreur :", error);
      } finally {
        setLoading(false);
      }
    }

    getTasks();
  }, []);

  async function deleteTask(id: number) {
    await fetch(`/api/tasks/${id}`, {
      method: "DELETE",
    });

    setTasks(tasks.filter((task) => task.id !== id));
  }

  async function toggleTask(task: Task) {
    await fetch(`/api/tasks/${task.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        completed: !task.completed,
      }),
    });

    setTasks(
      tasks.map((t) =>
        t.id === task.id
          ? { ...t, completed: !t.completed }
          : t
      )
    );
  }

  if (loading) {
    return (
      <main className="dashboard">
        <div className="loading">
          <p>Chargement des tâches...</p>
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
      {/* HEADER */}
      <section className="dashboard-header">
        <div>
          <p className="dashboard-label">TABLEAU DE BORD</p>

          <h1>Bonjour </h1>

          <p className="dashboard-description">
            Voici un aperçu de tes tâches et de ta progression.
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

      {/* STATISTIQUES */}
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

      {/* TÂCHES */}
      <section className="tasks-section">
        <div className="section-header">
          <div>
            <h2>Mes tâches</h2>
            <p>Gère tes tâches quotidiennes.</p>
          </div>

          <span className="task-count">
            {tasks.length} tâche{tasks.length > 1 ? "s" : ""}
          </span>
        </div>

        {tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✓</div>

            <h3>Aucune tâche</h3>

            <p>
              Tu n'as pas encore créé de tâche.
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