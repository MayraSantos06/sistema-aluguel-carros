import { useState } from "react";
import { autenticar, type UsuarioLogado } from "../services/authService";
import "./Login.css";

interface LoginProps {
  onLogin: (usuario: UsuarioLogado) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const usuario = await autenticar(login, senha);
      onLogin(usuario);
    } catch {
      setErro("Não foi possível entrar. Confira seu login e senha.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-intro">
        <div className="login-brand">AUTO<span>RENT</span></div>
        <h1>Seu próximo destino começa aqui.</h1>
        <p>
          Encontre o veículo ideal e gerencie seus aluguéis
          de maneira simples, rápida e segura.
        </p>
        <div className="login-decoration">🚘</div>
      </section>

      <section className="login-panel">
        <form className="login-form" onSubmit={entrar}>
          <span className="login-eyebrow">BEM-VINDO DE VOLTA</span>
          <h2>Entre na sua conta</h2>
          <p>Acesse sua área para continuar.</p>

          <label htmlFor="login">Usuário</label>
          <input
            id="login"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="Digite seu usuário"
            required
          />

          <label htmlFor="senha">Senha</label>
          <input
            id="senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Digite sua senha"
            required
          />

          {erro && <div className="login-error" role="alert">{erro}</div>}

          <button type="submit" disabled={carregando}>
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </section>
    </main>
  );
}