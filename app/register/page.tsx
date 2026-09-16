"use client";

import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

import Button from "@/components/Button";
import app from "@/lib/firebase";

const auth = getAuth(app);

export default function Register() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);

      // Inscription réussie
      router.push("/login");
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        setError("Cette adresse email est déjà utilisée.");
      } else if (error.code === "auth/invalid-email") {
        setError("L'adresse email n'est pas valide.");
      } else if (error.code === "auth/weak-password") {
        setError("Le mot de passe doit contenir au moins 6 caractères.");
      } else {
        setError("Une erreur est survenue lors de l'inscription.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>Inscription</h1>

      <form onSubmit={handleRegister}>
        <div>
          <label htmlFor="name">Nom</label>
          <input
            type="text"
            id="name"
            placeholder="Votre nom"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>

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

        {error && <p>{error}</p>}

        <Button
          text={loading ? "Création..." : "Créer mon compte"}
        />
      </form>
    </main>
  );
}
