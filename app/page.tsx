import Counter from "@/components/Counter";

const appName: string = "TaskFlow";
const description: string =
  "Une application moderne de gestion des tâches";

export default function Home() {
  return (
    <>

      <main>
        <h1>Bienvenue sur {appName}</h1>
        <p>{description}</p>
        <Counter />
      </main>
    </>
  );
}