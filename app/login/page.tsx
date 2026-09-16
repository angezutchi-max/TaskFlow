"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

import Button from "@/components/Button";
import app from "@/lib/firebase";

const auth = getAuth(app);

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!email) {
      setError("L'email est obligatoire.");
      return;
    }

    if (!password) {
      setError("Le mot de passe est obligatoire.");
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);

      // Connexion réussie
      window.dispatchEvent(new Event("authChange"));

      router.push("/dashboard");
    } catch (error: any) {
      console.error("Erreur Firebase :", error);

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        setError("Email ou mot de passe incorrect.");
      } else if (error.code === "auth/invalid-email") {
        setError("L'adresse email n'est pas valide.");
      } else if (error.code === "auth/too-many-requests") {
        setError(
          "Trop de tentatives. Veuillez patienter avant de réessayer."
        );
      } else {
        setError(
          error.message ||
            "Une erreur est survenue lors de la connexion."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <Link href="/">← Retour à l'accueil</Link>

      <h1>Connexion</h1>

      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>

          <input
            type="email"
            id="email"
            placeholder="Votre email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
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
            required
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