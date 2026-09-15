"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewTask() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const isLoggedIn =
      localStorage.getItem("isLoggedIn") === "true";

    if (!isLoggedIn) {
      router.replace("/login");
      return;
    }

    setCheckingAuth(false);
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
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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