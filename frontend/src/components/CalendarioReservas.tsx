import { useState } from "react";
import { sobrepoeReserva, type PeriodoReservado } from "../services/automovelService";

const mesFormato = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });
const diaFormato = new Intl.DateTimeFormat("pt-BR", { dateStyle: "full", timeZone: "UTC" });
const semana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function CalendarioReservas({ hoje, reservas, inicio, fim, selecionar }: {
  hoje: string;
  reservas: PeriodoReservado[];
  inicio: string;
  fim: string;
  selecionar: (dia: string) => void;
}) {
  const [deslocamento, setDeslocamento] = useState(0);
  const [ano, mes] = hoje.split("-").map(Number);
  const primeiro = new Date(Date.UTC(ano, mes - 1 + deslocamento, 1));
  const anoExibido = primeiro.getUTCFullYear();
  const mesExibido = primeiro.getUTCMonth();
  const dias = new Date(Date.UTC(anoExibido, mesExibido + 1, 0)).getUTCDate();

  return (
    <section className="reservation-calendar" aria-label="Calendário de disponibilidade">
      <div className="reservation-calendar-heading">
        <button type="button" className="btn btn-ghost" aria-label="Mês anterior"
          disabled={!deslocamento} onClick={() => setDeslocamento(mesAtual => mesAtual - 1)}>‹</button>
        <h3 aria-live="polite">{mesFormato.format(primeiro)}</h3>
        <button type="button" className="btn btn-ghost" aria-label="Próximo mês"
          onClick={() => setDeslocamento(mesAtual => mesAtual + 1)}>›</button>
      </div>
      <div className="reservation-calendar-grid">
        {semana.map(dia => <span key={dia} className="reservation-weekday">{dia}</span>)}
        {Array.from({ length: primeiro.getUTCDay() }, (_, i) => <span key={`vazio-${i}`} aria-hidden="true" />)}
        {Array.from({ length: dias }, (_, i) => {
          const data = new Date(Date.UTC(anoExibido, mesExibido, i + 1));
          const dia = data.toISOString().slice(0, 10);
          const reservado = sobrepoeReserva(reservas, dia, dia);
          const selecionado = Boolean(inicio) && inicio <= dia && dia <= (fim || inicio);
          return <button type="button" key={dia}
            className={`reservation-day${reservado ? " reserved" : selecionado ? " selected" : ""}`}
            disabled={reservado || dia < hoje}
            aria-label={`${diaFormato.format(data)}${reservado ? " — reservado" : ""}`}
            aria-pressed={selecionado}
            onClick={() => selecionar(dia)}>{i + 1}</button>;
        })}
      </div>
      <p className="reservation-calendar-legend" aria-live="polite">
        {inicio && !fim ? "Selecione a data de término. Para um dia, selecione a mesma data."
          : "Selecione a data de início e depois a data de término."}
      </p>
      <p className="reservation-calendar-legend"><span /> Reservado · Pedidos pendentes não bloqueiam datas.</p>
    </section>
  );
}
