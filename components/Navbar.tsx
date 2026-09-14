import Link from "next/link";

export default function Navbar() {
  return (
    <nav>
      <div>TaskFlow</div>

      <div>
        <Link href="/">Accueil</Link>
        <Link href="/login">Connexion</Link>
        <Link href="/register">Inscription</Link>
        <Link href="/dashboard">Dashboard</Link>
      </div>
    </nav>
  );
}