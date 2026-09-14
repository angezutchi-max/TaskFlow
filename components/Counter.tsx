"use client";

import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  function increment() {
    setCount(count + 1);
  }
  
function decrement() {
    setCount(count - 1);
}

  return (
    <div>
      <p>Compteur : {count}</p>

      <button onClick={increment}>
        +1
      </button>
      <button onClick={decrement}>
        -1
      </button>
    </div>
  );
}