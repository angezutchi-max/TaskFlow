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
  const [error, setError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

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

    if (!title) {
      setError("Le titre est obligatoire.");
      return;
    }

    try {
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
          title,
          description,
        }),
      });

      if (!response.ok) {
        setError("Impossible de créer la tâche.");
        return;
      }

      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      setError("Une erreur est survenue.");
    }
  }

  if (checkingAuth) {
    return (
      <main>
        <p>Vérification de la connexion...</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Créer une tâche</h1>

      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Titre</label>

          <input
            type="text"
            id="title"
            placeholder="Ex : Apprendre TypeScript"
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
            placeholder="Décris ta tâche..."
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
          />
        </div>

        <button type="submit">
          Créer la tâche
        </button>
      </form>
    </main>
  );
}