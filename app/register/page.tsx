import Button from "@/components/Button";

export default function Register() {
  return (
    <main>
      <h1>Inscription</h1>

      <form>
        <div>
          <label htmlFor="name">Nom</label>
          <input
            type="text"
            id="name"
            placeholder="Votre nom"
          />
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="Votre email"
          />
        </div>

        <div>
          <label htmlFor="password">Mot de passe</label>
          <input
            type="password"
            id="password"
            placeholder="Votre mot de passe"
          />
        </div>

        <Button text="Créer mon compte"/>
      </form>
    </main>
  );
}