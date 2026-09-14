type Task = {
  id: number;
  title: string;
  completed: boolean;
};

const tasks: Task[] = [
  {
    id: 1,
    title: "Apprendre Next.js",
    completed: true,
  },
  {
    id: 2,
    title: "Créer le dashboard",
    completed: false,
  },
  {
    id: 3,
    title: "Apprendre TypeScript",
    completed: false,
  },
  {
    id: 4,
    title: "Créer une API",
    completed: true,
  },
];

export default function Dashboard() {
  return (
    <main>
      <h1>Tableau de bord</h1>

      <p>Bienvenue sur ton espace TaskFlow.</p>

      <section>
        <h2>Résumé</h2>

        <div>
          <div>
            <h3>Total des tâches</h3>
            <p>{tasks.length}</p>
          </div>

          <div>
            <h3>Terminées</h3>
            <p>{tasks.filter((task) => task.completed).length}</p>
          </div>

          <div>
            <h3>En cours</h3>
            <p>{tasks.filter((task) => !task.completed).length}</p>
          </div>
        </div>
      </section>

      <section>
  <h2>Mes tâches</h2>

  <div>
    {tasks.map((task) => (
      <div key={task.id}>
        <h3>{task.title}</h3>

        <p>
          {task.completed ? "Terminée" : "En cours"}
        </p>
      </div>
    ))}
  </div>
</section>
    </main>
  );
}