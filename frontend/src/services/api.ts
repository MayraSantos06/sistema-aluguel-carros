export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function api<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  const headers = new Headers({ "X-Requested-With": "XMLHttpRequest" });
  if (method !== "GET") {
    const csrf = await api<{ headerName: string; token: string }>("/auth/csrf");
    headers.set(csrf.headerName, csrf.token);
  }
  if (body !== undefined) headers.set("Content-Type", "application/json");
  const response = await fetch(`/api${path}`, {
    method,
    headers,
    cache: "no-store",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new ApiError(response.status, data?.detail || data?.message || `Operação recusada (${response.status}).`);
  }
  return response.status === 204 ? undefined as T : response.json();
}

export const mensagemErro = (erro: unknown) =>
  erro instanceof Error ? erro.message : "Não foi possível concluir a operação.";

export type PerfilCliente = {
  nome: string;
  cpf: string;
  rg: string;
  profissao: string;
  endereco: string;
  empregadores?: { nome: string; rendimento: number }[] | null;
};
