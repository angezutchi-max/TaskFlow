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
};

const auth = getAuth(app);

export default function EditTask() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
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

            if (!response.ok) {
              setError(
                "Impossible de récupérer cette tâche."
              );
              return;
            }

            const task: Task = await response.json();

            setTitle(task.title);
            setDescription(task.description);
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

    const user = auth.currentUser;

    if (!user) {
      setError("Tu dois être connecté.");
      return;
    }

    try {
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
            title,
            description,
          }),
        }
      );

      if (!response.ok) {
        setError(
          "Impossible de modifier la tâche."
        );
        return;
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Erreur :", error);
      setError("Une erreur est survenue.");
    }
  }

  if (checkingAuth) {
    return (
      <main>
        <h1>Modifier la tâche</h1>
        <p>Vérification de la connexion...</p>
      </main>
    );
  }

  if (loading) {
    return (
      <main>
        <h1>Modifier la tâche</h1>
        <p>Chargement de la tâche...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <h1>Modifier la tâche</h1>
        <p>{error}</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Modifier la tâche</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Titre</label>

          <input
            type="text"
            id="title"
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
          />
        </div>

        <div>
          <label htmlFor="description">
            Description
          </label>

          <textarea
            id="description"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
          />
        </div>

        <button type="submit">
          Enregistrer les modifications
        </button>
      </form>
    </main>
  );
}