import { api } from "./api";

export type Perfil = "CLIENTE" | "EMPRESA" | "BANCO";

export interface UsuarioLogado {
  id: number;
  login: string;
  perfil: Perfil;
}

export async function autenticar(
  login: string,
  senha: string
) {
  return api<UsuarioLogado>("/auth/entrar", "POST", { login, senha });
}
