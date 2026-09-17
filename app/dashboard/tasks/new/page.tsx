"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAuth,
  onAuthStateChanged,
} from "firebase/auth";

import app from "@/lib/firebase";

const auth = getAuth(app);

export default function NewTask() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [error, setError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }

      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [router]);

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

    try {
      setSaving(true);

      const user = auth.currentUser;

      if (!user) {
        setError("Tu dois être connecté.");
        return;
      }

      const token = await user.getIdToken();

      const response = await fetch("/api/tasks", {
        method: "POST",
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
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Impossible de créer la tâche."
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

  return (
    <main className="task-form-page">
      <div className="task-form-container">
        <div className="task-form-header">
          <button
            type="button"
            className="back-button"
            onClick={() => router.push("/dashboard")}
          >
            ← Retour
          </button>

          <h1>Créer une tâche</h1>

          <p>
            Ajoute une nouvelle tâche et définis sa période.
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
              placeholder="Ex : Apprendre TypeScript"
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
              placeholder="Décris ce que tu dois accomplir..."
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
                ? "Création..."
                : "Créer la tâche"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}