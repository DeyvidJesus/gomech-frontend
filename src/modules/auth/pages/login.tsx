import { useLogin } from "../hooks/useLogin";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const login = useLogin();
  const navigate = useNavigate();
  const { data } = useAuth();

  if (data?.token) {
    navigate({ to: "/" });
    return null;
  }

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    login.mutate(
      { email, password },
      {
        onSuccess: () => navigate({ to: "/" }),
        onError: (err) => alert(err.message),
      }
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" disabled={login.isPending}>
        {login.isPending ? "Entrando..." : "Login"}
      </button>
    </form>
  );
}
