"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/Button";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!email) {
      setError("L'email est obligatoire.");
      return;
    }

    if (!password) {
      setError("Le mot de passe est obligatoire.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Le mot de passe doit contenir au moins 8 caractères."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      console.log("Réponse API :", data);

      if (!response.ok) {
        setError(data.message);
        return;
      }

      setMessage(data.message);

      // Mémoriser la connexion
      localStorage.setItem("isLoggedIn", "true");

      window.dispatchEvent(new Event("authChange"));

      // Rediriger vers le dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("ERREUR FETCH :", error);
      setError(
        "Une erreur est survenue. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <Link href="/">← Retour à l'accueil</Link>

      <h1>Connexion</h1>

      {error && <p>{error}</p>}

      {message && <p>{message}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>

          <input
            type="email"
            id="email"
            placeholder="Votre email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
          />
        </div>

        <div>
          <label htmlFor="password">Mot de passe</label>

          <input
            type="password"
            id="password"
            placeholder="Votre mot de passe"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
          />
        </div>

        <Button
          text={loading ? "Connexion..." : "Se connecter"}
          type="submit"
        />
      </form>
    </main>
  );
}