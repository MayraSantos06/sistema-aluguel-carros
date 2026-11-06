import { api } from "./api";

export type AutomovelAPI = {
  id: number;
  matricula: string;
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
};

export type DadosAutomovel = Omit<AutomovelAPI, "id">;

export const automovelService = {
  listar: () => api<AutomovelAPI[]>("/automoveis"),

  cadastrar: (dados: DadosAutomovel) =>
    api<AutomovelAPI>("/automoveis", "POST", dados),

  atualizar: (id: number, dados: DadosAutomovel) =>
    api<AutomovelAPI>("/automoveis/" + id, "PUT", dados),

  excluir: (id: number) =>
    api<void>("/automoveis/" + id, "DELETE"),
};
