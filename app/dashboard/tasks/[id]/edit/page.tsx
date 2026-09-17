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

export default function EditTask() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [saving, setSaving] = useState(false);
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

            const task: Task = data;

            setTitle(task.title);
            setDescription(task.description || "");
            setStartDate(task.startDate || "");
            setEndDate(task.endDate || "");
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

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError("Le titre est obligatoire.");
      return;
    }

    if (!startDate) {
      setError("La date de début est obligatoire.");
      return;
    }

    if (!endDate) {
      setError("La date de fin est obligatoire.");
      return;
    }

    if (endDate < startDate) {
      setError(
        "La date de fin doit être après ou égale à la date de début."
      );
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      setError("Tu dois être connecté.");
      return;
    }

    try {
      setSaving(true);

      const token = await user.getIdToken();

      const response = await fetch(
        `/api/tasks/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: trimmedTitle,
            description: description.trim(),
            startDate,
            endDate,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Impossible de modifier la tâche."
        );
        return;
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Erreur :", error);
      setError("Une erreur est survenue.");
    } finally {
      setSaving(false);
    }
  }

  if (checkingAuth) {
    return (
      <main className="task-form-page">
        <div className="task-form-container">
          <p className="loading-message">
            Vérification de la connexion...
          </p>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="task-form-page">
        <div className="task-form-container">
          <p className="loading-message">
            Chargement de la tâche...
          </p>
        </div>
      </main>
    );
  }

  if (error && !title) {
    return (
      <main className="task-form-page">
        <div className="task-form-container">
          <button
            type="button"
            className="back-button"
            onClick={() => router.push("/dashboard")}
          >
            ← Retour au dashboard
          </button>

          <div className="form-error">
            {error}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="task-form-page">
      <div className="task-form-container">
        <div className="task-form-header">
          <button
            type="button"
            className="back-button"
            onClick={() => router.push("/dashboard")}
            disabled={saving}
          >
            ← Retour
          </button>

          <h1>Modifier la tâche</h1>

          <p>
            Modifie les informations de ta tâche.
          </p>
        </div>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="task-form"
        >
          <div className="form-group">
            <label htmlFor="title">
              Titre
            </label>

            <input
              type="text"
              id="title"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">
              Description
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              rows={5}
              disabled={saving}
            />
          </div>

          <div className="date-fields">
            <div className="form-group">
              <label htmlFor="startDate">
                Date de début
              </label>

              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(event) =>
                  setStartDate(event.target.value)
                }
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">
                Date de fin
              </label>

              <input
                type="date"
                id="endDate"
                value={endDate}
                min={startDate || undefined}
                onChange={(event) =>
                  setEndDate(event.target.value)
                }
                disabled={saving}
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={() => router.push("/dashboard")}
              disabled={saving}
            >
              Annuler
            </button>

            <button
              type="submit"
              className="submit-button"
              disabled={saving}
            >
              {saving
                ? "Enregistrement..."
                : "Enregistrer les modifications"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}