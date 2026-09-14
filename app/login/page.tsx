"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/Button";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Réinitialiser les messages
    setError("");
    setMessage("");

    // Validation de l'email
    if (!email) {
      setError("L'email est obligatoire.");
      return;
    }

    // Validation du mot de passe
    if (!password) {
      setError("Le mot de passe est obligatoire.");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    try {
      // Envoyer les données à notre API
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

      // Récupérer la réponse de l'API
      const data = await response.json();

      console.log("Réponse API :", data);

      // Si l'API renvoie une erreur
      if (!response.ok) {
        setError(data.message);
        return;
      }

      // Si la connexion réussit
      setMessage(data.message);
    } catch (error) {
      console.error("ERREUR FETCH :", error);
      setError("Une erreur est survenue. Veuillez réessayer.");
    }
  }

  return (
    <main>

      <h1>Connexion</h1>

      {/* Message d'erreur */}
      {error && <p>{error}</p>}

      {/* Message de réussite */}
      {message && <p>{message}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>

          <input
            type="email"
            id="email"
            placeholder="Votre email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="password">Mot de passe</label>

          <input
            type="password"
            id="password"
            placeholder="Votre mot de passe"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <Button text="Se connecter" />
      </form>
    </main>
  );
}

