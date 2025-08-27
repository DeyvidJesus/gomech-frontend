import { useRegister } from "../hooks/useRegister";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

function Register() {
  const register = useRegister();
  const navigate = useNavigate();

  const { data } = useAuth();

  if (data?.token) {
    navigate({ to: "/" });
    return null;
  }

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    register.mutate(
      { name, email, password },
      {
        onSuccess: () => navigate({ to: "/" }),
        onError: (err) => alert(err.message),
      }
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nome"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
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
      <button type="submit" disabled={register.isPending}>
        {register.isPending ? "Registrando..." : "Registrar"}
      </button>
    </form>
  );
}

export default Register;