import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  const { email, password } = body;

  if (
    (email === "admin@test.com" && password === "12345678") ||
    (email === "user@test.com" && password === "87654321")
  ) {
    return NextResponse.json({
      success: true,
      message: "Connexion réussie !",
    });
  }

  return NextResponse.json(
    {
      success: false,
      message: "Email ou mot de passe incorrect.",
    },
    {
      status: 401,
    }
  );
}