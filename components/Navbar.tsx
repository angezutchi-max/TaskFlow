"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    function checkLogin() {
      const loggedIn =
        localStorage.getItem("isLoggedIn") === "true";

      setIsLoggedIn(loggedIn);
    }

    checkLogin();

    window.addEventListener("authChange", checkLogin);

    return () => {
      window.removeEventListener("authChange", checkLogin);
    };
  }, [pathname]);

  function handleLogout() {
    localStorage.removeItem("isLoggedIn");

    window.dispatchEvent(new Event("authChange"));

    router.push("/login");
  }

  return (
    <nav>
      <div>
        <Link href="/">TaskFlow</Link>
      </div>

      <div>
        <Link href="/">Accueil</Link>

        {isLoggedIn ? (
          <>
            <Link href="/dashboard">Dashboard</Link>

            <button
              type="button"
              onClick={handleLogout}
            >
              Déconnexion
            </button>
          </>
        ) : (
          <>
            <Link href="/login">Connexion</Link>

            <Link href="/register">Inscription</Link>
          </>
        )}
      </div>
    </nav>
  );
}