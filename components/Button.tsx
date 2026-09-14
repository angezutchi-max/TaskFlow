"use client";

type ButtonProps = {
  text: string;
  onClick?: () => void;
  type?: "button" | "submit";
};

export default function Button({
  text,
  onClick,
  type = "submit",
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
    >
      {text}
    </button>
  );
}