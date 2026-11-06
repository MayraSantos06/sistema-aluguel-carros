import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { autenticar, type UsuarioLogado } from "./services/authService";
import { api, ApiError, mensagemErro, type PerfilCliente } from "./services/api";
import {
  automovelService,
  type AutomovelAPI,
} from "./services/automovelService";

type Role = "CLIENTE" | "EMPRESA" | "BANCO";
type Route =
  | "home"
  | "login"
  | "signup"
  | "client-dashboard"
  | "profile"
  | "catalog"
  | "vehicle"
  | "request"
  | "edit-request"
  | "confirmation"
  | "rentals"
  | "rental-detail"
  | "company-dashboard"
  | "company-vehicles"
  | "vehicle-form"
  | "company-rentals"
  | "company-review"
  | "bank-dashboard"
  | "bank-analysis"
  | "contracts";

type Vehicle = {
  id: number;
  brand: string;
  model: string;
  year: number;
  registration: string;
  plate: string;
  image: string;
  status: "Disponível" | "Indisponível";
};


type RentalStatus = "Solicitado" | "Em análise" | "Aprovado" | "Recusado" | "Cancelado";
type Rental = {
  id: number;
  vehicleId: number;
  client: string;
  start: string;
  end: string;
  createdAt: string | null;
  dados: AluguelAPI;
  status: RentalStatus;
};

const photos = {
  hero: "https://images.unsplash.com/photo-1704476944918-c1258561ebb9?auto=format&fit=crop&w=2200&q=88",
  editorial:
    "https://images.unsplash.com/photo-1645400379459-f6fd3d963fd4?auto=format&fit=crop&w=1800&q=85",
  auth: "https://images.unsplash.com/photo-1606590526474-b07bb3623ad1?auto=format&fit=crop&w=1600&q=85",
  car1: "https://images.unsplash.com/photo-1511994477422-b69e44bd4ea9?auto=format&fit=crop&w=1200&q=82",
  car2: "https://images.unsplash.com/photo-1485291571150-772bcfc10da5?auto=format&fit=crop&w=1200&q=82",
  car3: "https://images.unsplash.com/photo-1550242499-b5171f56de56?auto=format&fit=crop&w=1200&q=82",
  car4: "https://images.unsplash.com/photo-1756990683708-afd38ed20f1f?auto=format&fit=crop&w=1200&q=82",
};

function converterAutomovel(a: AutomovelAPI): Vehicle {
  return {
    id: a.id,
    brand: a.marca,
    model: a.modelo,
    year: a.ano,
    registration: a.matricula,
    plate: a.placa,
    image: photos.car3,
    status: "Disponível",
  };
}

type AluguelAPI = {
  id: number;
  cliente: PerfilCliente;
  automovel: AutomovelAPI;
  dataInicio: string;
  dataFim: string;
  dataPedido?: string | null;
  status: "PENDENTE" | "APROVADO" | "RECUSADO" | "CANCELADO";
  agenteParecer: string | null;
  observacaoParecer: string | null;
  dataContrato: string | null;
  agenteContrato: string | null;
  tipoProprietario: Role | null;
  proprietario: string | null;
  valorCredito: number | null;
  bancoCredito: string | null;
};

function converterAluguel(a: AluguelAPI): Rental {
  const status = { PENDENTE: "Solicitado", APROVADO: "Aprovado", RECUSADO: "Recusado", CANCELADO: "Cancelado" } as const;
  return { id: a.id, vehicleId: a.automovel.id, client: a.cliente.nome, start: a.dataInicio,
    end: a.dataFim, createdAt: a.dataPedido ?? null, status: status[a.status], dados: a };
}

const moeda = (valor: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });

function formatDate(value: string | null | undefined) {
  if (!value) return "Data não registrada";
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isNaN(date.getTime()) ? "Data não registrada" : dateFormatter.format(date);
}

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
    menu: (
      <>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </>
    ),
    close: (
      <>
        <path d="m6 6 12 12M18 6 6 18" />
      </>
    ),
    grid: (
      <>
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </>
    ),
    car: (
      <>
        <path d="m5 16-1 3h2l1-2h10l1 2h2l-1-3" />
        <path d="M5 16h14v-5l-2-4H7l-2 4v5Z" />
        <circle cx="8" cy="13" r="1" />
        <circle cx="16" cy="13" r="1" />
      </>
    ),
    file: (
      <>
        <path d="M7 3h7l4 4v14H7z" />
        <path d="M14 3v5h4M10 13h5M10 17h5" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    logout: (
      <>
        <path d="M10 5H5v14h5M14 8l4 4-4 4M8 12h10" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m16 16 4 4" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),
    edit: (
      <>
        <path d="m4 20 4-1 11-11-3-3L5 16zM14 7l3 3" />
      </>
    ),
    trash: (
      <>
        <path d="M5 7h14M9 7V4h6v3M8 10v8M12 10v8M16 10v8M7 7l1 14h8l1-14" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    calendar: (
      <>
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3v4M16 3v4M4 10h16" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    building: (
      <>
        <path d="M4 21V5h10v16M14 10h6v11M8 9h2M8 13h2M8 17h2M17 14h1M17 17h1" />
      </>
    ),
  };
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function Logo({ onClick }: { onClick: () => void }) {
  return (
    <button className="logo" onClick={onClick} aria-label="Ir para o início">
      VÉLORA<span>.</span>
    </button>
  );
}

function Button({
  children,
  variant = "primary",
  icon,
  onClick,
  type = "button",
  disabled = false,
  className = "",
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  icon?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`btn btn-${variant} ${className}`}
    >
      {children}
      {icon && <Icon name={icon} size={17} />}
    </button>
  );
}

function Badge({ status }: { status: string }) {
  const key = status.toLowerCase().replace(" ", "-").replace("í", "i");
  return (
    <span className={`badge badge-${key}`}>
      <span />
      {status}
    </span>
  );
}

function PublicHeader({ go }: { go: (r: Route) => void }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handle);
    return () => window.removeEventListener("scroll", handle);
  }, []);
  const jump = (id: string) => {
    setOpen(false);
    if (location.hash !== "#home") go("home");
    requestAnimationFrame(() =>
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }),
    );
  };
  return (
    <header className={`public-header ${scrolled ? "solid" : ""}`}>
      <Logo onClick={() => go("home")} />
      <nav className={open ? "open" : ""} aria-label="Navegação principal">
        <button onClick={() => jump("inicio")}>Início</button>
        <button onClick={() => jump("veiculos")}>Veículos</button>
        <button onClick={() => jump("como-funciona")}>Como funciona</button>
        <div className="mobile-auth">
          <Button variant="ghost" onClick={() => go("login")}>
            Entrar
          </Button>
          <Button onClick={() => go("signup")}>Criar conta</Button>
        </div>
      </nav>
      <div className="header-actions">
        <Button variant="ghost" onClick={() => go("login")}>
          Entrar
        </Button>
        <Button onClick={() => go("signup")}>Criar conta</Button>
      </div>
      <button
        className="menu-button"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Fechar menu" : "Abrir menu"}
      >
        <Icon name={open ? "close" : "menu"} />
      </button>
    </header>
  );
}

function VehicleCard({ vehicle, onView }: { vehicle: Vehicle; onView: () => void }) {
  return (
    <article className="vehicle-card">
      <div className="vehicle-image">
        <img src={vehicle.image} alt={`${vehicle.brand} ${vehicle.model}`} />
        <Badge status={vehicle.status} />
      </div>
      <div className="vehicle-body">
        <div>
          <p className="eyebrow">
            {vehicle.brand} · {vehicle.year}
          </p>
          <h3>{vehicle.model}</h3>
        </div>
        <p className="vehicle-id">{vehicle.registration}</p>
        <button className="text-link" onClick={onView}>
          Ver detalhes <Icon name="arrow" size={16} />
        </button>
      </div>
    </article>
  );
}

function Home({
  go,
  vehicles,
  chooseVehicle,
}: {
  go: (r: Route) => void;
  vehicles: Vehicle[];
  chooseVehicle: (id: number) => void;
}) {
  return (
    <div className="public-page">
      <PublicHeader go={go} />
      <main>
        <section className="hero" id="inicio">
          <img className="hero-bg" src={photos.hero} alt="Automóvel premium em estúdio escuro" />
          <div className="hero-shade" />
          <div className="hero-copy">
            <p className="eyebrow light">Aluguel automotivo, reimaginado</p>
            <h1>
              O PRÓXIMO
              <br />
              <span>CAMINHO</span> É SEU.
            </h1>
            <div className="hero-bottom">
              <p>
                Descubra uma nova experiência em aluguel de automóveis. Simples de escolher.
                Extraordinária de viver.
              </p>
              <div className="button-row">
                <Button
                  icon="arrow"
                  onClick={() =>
                    document.getElementById("veiculos")?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Explorar veículos
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    document.getElementById("como-funciona")?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Como funciona
                </Button>
              </div>
            </div>
          </div>
          <div className="scroll-cue">
            <span>Role para descobrir</span>
            <i />
          </div>
        </section>

        <section className="section vehicle-section" id="veiculos">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Seleção Vélora</p>
              <h2>
                Escolha o que
                <br />
                move você.
              </h2>
            </div>
            <p className="section-intro">
              Uma curadoria de automóveis para momentos que pedem algo além do comum.
            </p>
          </div>
          <div className="vehicle-grid">
            {vehicles.slice(0, 3).map((v) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                onView={() => {
                  chooseVehicle(v.id);
                  go("vehicle");
                }}
              />
            ))}
          </div>
          <p className="demo-note">
            Veículos e identificações exibidos para fins de demonstração acadêmica.
          </p>
        </section>

        <section className="steps-section" id="como-funciona">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow light">Como funciona</p>
              <h2>
                Da escolha à estrada,
                <br />
                sem complicação.
              </h2>
            </div>
          </div>
          <div className="steps-grid">
            {[
              [
                "01",
                "Escolha seu automóvel",
                "Explore a seleção e encontre o modelo ideal para o seu próximo caminho.",
              ],
              [
                "02",
                "Solicite o aluguel",
                "Informe o período desejado e confirme seus dados com segurança.",
              ],
              [
                "03",
                "Acompanhe a análise",
                "Veja cada atualização do pedido e consulte seu contrato em um só lugar.",
              ],
            ].map(([n, title, text]) => (
              <article className="step" key={n}>
                <span>{n}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="editorial">
          <img src={photos.editorial} alt="Automóvel esportivo sob iluminação dramática" />
          <div className="editorial-overlay" />
          <div className="editorial-copy">
            <p className="eyebrow light">Experiência em movimento</p>
            <h2>
              A estrada muda.
              <br />A sensação permanece.
            </h2>
            <p>
              Precisão em cada etapa, transparência em cada decisão. A VÉLORA conecta você ao
              automóvel certo com uma experiência simples e cuidadosamente desenhada.
            </p>
            <Button variant="secondary" icon="arrow" onClick={() => go("signup")}>
              Começar agora
            </Button>
          </div>
        </section>
      </main>
      <footer className="footer">
        <div>
          <Logo onClick={() => go("home")} />
          <p>A liberdade de escolher seu próximo caminho.</p>
        </div>
        <div className="footer-links">
          <button onClick={() => go("home")}>Início</button>
          <button onClick={() => go("catalog")}>Veículos</button>
          <button onClick={() => go("login")}>Área do cliente</button>
        </div>
        <p className="academic">
          Projeto acadêmico · Engenharia de Software
          <br />© 2026 VÉLORA
        </p>
      </footer>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
  children,
  defaultValue,
  min,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  children?: ReactNode;
  defaultValue?: string;
  min?: string;
}) {
  return (
    <label className="field">
      <span>
        {label}
        {required && <b> *</b>}
      </span>
      {children || (
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          defaultValue={defaultValue}
          min={min}
        />
      )}
    </label>
  );
}


function AuthLayout({
  mode,
  go,
  onLogin,
}: {
  mode: "login" | "signup";
  go: (r: Route) => void;
  onLogin: (r: Role, usuario: string) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = new FormData(e.currentTarget);
    const user = String(data.get("usuario") || "").trim();
    const password = String(data.get("senha") || "");
    const confirmation = String(data.get("confirmacao") || "");

    setError("");
    setNotice("");

    if (!user || !password) {
      setError("Preencha o usuário e a senha.");
      return;
    }

    if (mode === "signup" && password !== confirmation) {
      setError("As senhas não coincidem. Revise os campos.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        await api("/auth/cadastro", "POST", { login: user, senha: password });
        setNotice("Conta criada com sucesso! Agora você pode entrar.");
      } else {
        const profile = await autenticar(user, password);
        onLogin(profile.perfil, profile.login);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocorreu um erro. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <img
          src={photos.auth}
          alt="Automóvel premium em ambiente escuro"
        />

        <div className="auth-image-shade" />

        <Logo onClick={() => go("home")} />

        <div className="auth-quote">
          <p>
            “A liberdade começa
            <br />
            com uma escolha.”
          </p>
          <span>VÉLORA / 2026</span>
        </div>
      </section>

      <section className="auth-form-wrap">
        <button
          className="back-link"
          onClick={() => go("home")}
        >
          ← Voltar ao início
        </button>

        <div className="auth-form">
          <p className="eyebrow">
            {mode === "login"
              ? "Acesso seguro"
              : "Junte-se à Vélora"}
          </p>

          <h1>
            {mode === "login"
              ? "Bem-vindo de volta."
              : "Crie sua conta."}
          </h1>

          <p className="muted">
            {mode === "login"
              ? "Entre para acompanhar seus pedidos e descobrir novos caminhos."
              : "Cadastre-se como cliente para solicitar e acompanhar aluguéis."}
          </p>

          {notice && (
            <div className="alert success">
              <Icon name="check" />
              {notice}
            </div>
          )}

          {error && (
            <div className="alert error">
              {error}
            </div>
          )}

          <form onSubmit={submit}>
            <Field
              label="Usuário"
              name="usuario"
              placeholder="Digite seu usuário"
              required
            />

            <Field label="Senha" name="senha" required>
              <div className="password-field">
                <input
                  name="senha"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  required
                  minLength={6}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword
                      ? "Ocultar senha"
                      : "Exibir senha"
                  }
                >
                  <Icon name="eye" />
                </button>
              </div>
            </Field>

            {mode === "signup" && (
              <Field
                label="Confirmar senha"
                name="confirmacao"
                type="password"
                placeholder="Repita sua senha"
                required
              />
            )}

            <Button
              type="submit"
              className="full-button"
              disabled={loading}
            >
              {loading
                ? "Aguarde..."
                : mode === "login"
                  ? "Entrar"
                  : "Criar conta"}

              {!loading && (
                <Icon name="arrow" size={17} />
              )}
            </Button>
          </form>

          <p className="auth-switch">
            {mode === "login"
              ? "Ainda não tem uma conta?"
              : "Já possui uma conta?"}{" "}

            <button
              onClick={() => {
                setError("");
                setNotice("");
                go(mode === "login" ? "signup" : "login");
              }}
            >
              {mode === "login"
                ? "Criar conta"
                : "Entrar"}
            </button>
          </p>

          {mode === "signup" && notice && (
            <Button
              variant="secondary"
              onClick={() => go("login")}
            >
              Ir para o login
            </Button>
          )}
        </div>
      </section>
    </main>
  );
}

const navByRole: Record<Role, { label: string; route: Route; icon: string }[]> = {
  CLIENTE: [
    { label: "Visão geral", route: "client-dashboard", icon: "grid" },
    { label: "Explorar veículos", route: "catalog", icon: "car" },
    { label: "Meus aluguéis", route: "rentals", icon: "file" },
    { label: "Meu perfil", route: "profile", icon: "user" },
  ],
  EMPRESA: [
    { label: "Visão geral", route: "company-dashboard", icon: "grid" },
    { label: "Automóveis", route: "company-vehicles", icon: "car" },
    { label: "Solicitações", route: "company-rentals", icon: "file" },
    { label: "Contratos", route: "contracts", icon: "file" },
  ],
  BANCO: [
    { label: "Visão geral", route: "bank-dashboard", icon: "grid" },
    { label: "Análise financeira", route: "bank-analysis", icon: "shield" },
    { label: "Contratos", route: "contracts", icon: "file" },
  ],
};

function AppShell({
  role,
  route,
  go,
  logout,
  usuarioLogado,
  children,
}: {
  role: Role;
  route: Route;
  go: (r: Route) => void;
  logout: () => void;
  usuarioLogado: string;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const roleLabel =
    role === "CLIENTE"
      ? "Cliente"
      : role === "EMPRESA"
        ? "Gestão da empresa"
        : "Instituição financeira";
  return (
    <div className="app-shell">
      <aside className={mobileOpen ? "sidebar open" : "sidebar"}>
        <div className="sidebar-top">
          <Logo onClick={() => go(navByRole[role][0].route)} />
          <button className="sidebar-close" onClick={() => setMobileOpen(false)}>
            <Icon name="close" />
          </button>
        </div>
        <div className="workspace-label">
          <span>Espaço de trabalho</span>
          <strong>{roleLabel}</strong>
        </div>
        <nav>
          {navByRole[role].map((item) => (
            <button
              key={item.route}
              className={route === item.route ? "active" : ""}
              onClick={() => {
                go(item.route);
                setMobileOpen(false);
              }}
            >
              <Icon name={item.icon} />
              {item.label}
            </button>
          ))}
        </nav>
<div className="sidebar-account">
  <div className="avatar">
    {role === "CLIENTE"
      ? usuarioLogado.slice(0, 2).toUpperCase()
      : role === "EMPRESA"
        ? "VE"
        : "BA"}
  </div>

  <div>
    <strong>
      {role === "CLIENTE"
        ? usuarioLogado
        : role === "EMPRESA"
          ? "Vélora Empresas"
          : "Banco Áureo"}
    </strong>
    <span>{role}</span>
  </div>

  <button onClick={logout} aria-label="Sair">
    <Icon name="logout" />
  </button>
</div>
      </aside>
      {mobileOpen && (
        <button
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-label="Fechar menu"
        />
      )}
      <section className="workspace">
        <header className="app-topbar">
          <button className="app-menu" onClick={() => setMobileOpen(true)}>
            <Icon name="menu" />
          </button>
          <p>
            AMBIENTE SEGURO <span>·</span> DADOS DEMONSTRATIVOS
          </p>
          <div>
            <span className="connection-dot" />
            Conectado
          </div>
        </header>
        <main className="app-main">{children}</main>
      </section>
    </div>
  );
}

function PageTitle({
  eyebrow,
  title,
  text,
  action,
}: {
  eyebrow: string;
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-title">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {text && <p>{text}</p>}
      </div>
      {action}
    </div>
  );
}

function StatCard({
  label,
  value,
  note,
  accent = "blue",
}: {
  label: string;
  value: number | string;
  note?: string;
  accent?: string;
}) {
  return (
    <article className={`stat-card accent-${accent}`}>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      {note && <p>{note}</p>}
      <i />
    </article>
  );
}

function Dashboard({
  role,
  rentals,
  vehicles,
  go,
  usuarioLogado,
  selectRental,
}: {
  role: Role;
  rentals: Rental[];
  vehicles: Vehicle[];
  go: (r: Route) => void;
  usuarioLogado: string;
  selectRental: (id: number) => void;
}) {
  const config =
    role === "CLIENTE"
      ? {
          eyebrow: "Sua jornada",
          title: `Olá, ${usuarioLogado}!`,
          text: "Acompanhe seus pedidos ou encontre o automóvel para o seu próximo caminho.",
        }
      : role === "EMPRESA"
        ? {
            eyebrow: "Central de operações",
            title: "Visão geral da empresa",
            text: "Gerencie a frota e acompanhe as solicitações recentes.",
          }
        : {
            eyebrow: "Análise e contratos",
            title: "Visão financeira",
            text: "Acompanhe as solicitações encaminhadas para análise institucional.",
          };
  const relevant = rentals;
  return (
    <>
      <PageTitle
        {...config}
        action={
          role === "CLIENTE" ? (
            <Button icon="arrow" onClick={() => go("catalog")}>
              Explorar veículos
            </Button>
          ) : undefined
        }
      />
      <div className="stats-grid">
        {role === "EMPRESA" && (
          <StatCard
            label="Automóveis"
            value={vehicles.length}
            note="Veículos cadastrados"
            accent="sage"
          />
        )}
        <StatCard
          label={role === "CLIENTE" ? "Total de pedidos" : "Recebidos"}
          value={relevant.length}

        />
        <StatCard
          label="Pendentes"
          value={relevant.filter((r) => ["Solicitado", "Em análise"].includes(r.status)).length}
          note="Aguardando avaliação"
          accent="pink"
        />
        <StatCard
          label="Aprovados"
          value={relevant.filter((r) => r.status === "Aprovado").length}
          note="Processos concluídos"
          accent="sage"
        />
        <StatCard
          label="Recusados"
          value={relevant.filter((r) => r.status === "Recusado").length}
          note="Consulte os detalhes"
          accent="gray"
        />
      </div>
      <section className="panel recent-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Atualizações</p>
            <h2>Solicitações recentes</h2>
          </div>
          <button
            className="text-link"
            onClick={() =>
              go(
                role === "CLIENTE"
                  ? "rentals"
                  : role === "EMPRESA"
                    ? "company-rentals"
                    : "bank-analysis",
              )
            }
          >
            Ver todas <Icon name="arrow" size={16} />
          </button>
        </div>
        <RentalTable
          rentals={relevant.slice(0, 4)}
          vehicles={vehicles}
          onView={(id) => {
            selectRental(id);
            go(
              role === "CLIENTE"
                ? "rental-detail"
                : role === "EMPRESA"
                  ? "company-review"
                  : "bank-analysis",
            );
          }}
        />
      </section>
    </>
  );
}

function RentalTable({
  rentals,
  vehicles,
  onView,
}: {
  rentals: Rental[];
  vehicles: Vehicle[];
  onView: (id: number) => void;
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Pedido</th>
            <th>Automóvel</th>
            <th>Cliente</th>
            <th>Período</th>
            <th>Status</th>
            <th>
              <span className="sr-only">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rentals.map((r) => {
            const v = vehicles.find((x) => x.id === r.vehicleId)!;
            return (
              <tr key={r.id}>
                <td>
                  <strong>#{r.id}</strong>
                </td>
                <td>
                  <div className="table-car">
                    <img src={v?.image} alt="" />
                    <span>
                      {v?.brand} {v?.model}
                      <small>{v?.registration}</small>
                    </span>
                  </div>
                </td>
                <td>{r.client}</td>
                <td>
                  {formatDate(r.start)} — {formatDate(r.end)}
                </td>
                <td>
                  <Badge status={r.status} />
                </td>
                <td>
                  <button
                    className="icon-button"
                    onClick={() => onView(r.id)}
                    aria-label={`Visualizar pedido ${r.id}`}
                  >
                    <Icon name="chevron" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Catalog({
  vehicles,
  select,
  go,
}: {
  vehicles: Vehicle[];
  select: (id: number) => void;
  go: (r: Route) => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = vehicles.filter((v) =>
    `${v.brand} ${v.model}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <PageTitle
        eyebrow="Seleção Vélora"
        title="Explore automóveis"
        text="Encontre o modelo ideal e consulte todos os detalhes antes de solicitar."
      />
      <div className="search-bar">
        <Icon name="search" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por marca ou modelo"
          aria-label="Buscar automóveis"
        />
        <span>{filtered.length} resultados</span>
      </div>
      <div className="vehicle-grid app-cards">
        {filtered.map((v) => (
          <VehicleCard
            key={v.id}
            vehicle={v}
            onView={() => {
              select(v.id);
              go("vehicle");
            }}
          />
        ))}
      </div>
      {!filtered.length && (
        <EmptyState
          title="Nenhum automóvel encontrado"
          text="Tente buscar por outra marca ou modelo."
        />
      )}
      <p className="demo-note">
        A disponibilidade para o período solicitado é confirmada na avaliação do pedido.
      </p>
    </>
  );
}

function VehicleDetail({
  vehicle,
  go,
  role,
}: {
  vehicle: Vehicle;
  go: (r: Route) => void;
  role: Role | null;
}) {
  return (
    <>
      <button className="back-link in-app" onClick={() => go(role ? "catalog" : "home")}>
        ← Voltar ao catálogo
      </button>
      <div className="detail-hero">
        <div className="detail-image">
          <img src={vehicle.image} alt={`${vehicle.brand} ${vehicle.model}`} />
          <Badge status={vehicle.status} />
        </div>
        <div className="detail-copy">
          <p className="eyebrow">
            {vehicle.brand} · {vehicle.year}
          </p>
          <h1>{vehicle.model}</h1>
          <p>
            Design preciso, presença marcante e uma experiência criada para transformar cada
            percurso.
          </p>
          <div className="spec-grid">
            <div>
              <span>Matrícula</span>
              <strong>{vehicle.registration}</strong>
            </div>
            <div>
              <span>Placa</span>
              <strong>{vehicle.plate}</strong>
            </div>
            <div>
              <span>Ano</span>
              <strong>{vehicle.year}</strong>
            </div>
            <div>
              <span>Propriedade</span>
              <strong>Definida no contrato</strong>
            </div>
          </div>
          {vehicle.status === "Disponível" ? (
            <Button icon="arrow" onClick={() => (role === "CLIENTE" ? go("request") : go("login"))}>
              Solicitar aluguel
            </Button>
          ) : (
            <Button disabled>Indisponível no momento</Button>
          )}
          <small className="demo-note">
            Imagem ilustrativa.
          </small>
        </div>
      </div>
    </>
  );
}

class PerfilIncompleto extends Error {
  constructor() {
    super("Complete seu cadastro em Meu perfil antes de solicitar o aluguel.");
  }
}

function RentalRequest({
  vehicle,
  go,
  addRental,
  rental,
  vehicles,
  back,
}: {
  vehicle: Vehicle;
  go: (r: Route) => void;
  addRental: (automovelId: number, start: string, end: string) => Promise<void>;
  rental?: Rental;
  vehicles: Vehicle[];
  back: Route;
}) {
  const [today] = useState(() => new Intl.DateTimeFormat("sv-SE").format(new Date()));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [perfilIncompleto, setPerfilIncompleto] = useState(false);
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const start = String(data.get("inicio"));
    const end = String(data.get("fim"));
    if (end < start) return setError("A data de término deve ser igual ou posterior à data de início.");
    setError("");
    setPerfilIncompleto(false);
    setSaving(true);
    try { await addRental(Number(data.get("automovel") ?? vehicle.id), start, end); }
    catch (erro) {
      setError(mensagemErro(erro));
      setPerfilIncompleto(erro instanceof PerfilIncompleto);
    }
    finally { setSaving(false); }
  };
  return (
    <>
      <PageTitle
        eyebrow="Nova solicitação"
        title={rental ? "Editar período" : "Defina seu período"}
        text="Revise o automóvel e informe as datas desejadas para enviar o pedido."
      />
      <div className="request-layout">
        <form className="panel form-panel" onSubmit={submit}>
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Etapa 1 de 1</p>
              <h2>Período do aluguel</h2>
            </div>
          </div>
          {error && <div className="alert error" role="alert">{error}</div>}
          {perfilIncompleto && <Button variant="secondary" onClick={() => go("profile")}>
            Abrir Meu perfil
          </Button>}
          {rental && <Field label="Automóvel" name="automovel"><select name="automovel" defaultValue={vehicle.id}>
            {vehicles.map(v => <option key={v.id} value={v.id}>{v.brand} {v.model} · {v.registration}</option>)}
          </select></Field>}
          <div className="two-columns">
            <Field label="Data de início" name="inicio" defaultValue={rental?.start} type="date" required min={today} />
            <Field label="Data de término" name="fim" defaultValue={rental?.end} type="date" required min={today} />
          </div>
          <div className="info-box">
            <Icon name="shield" />
            <p>
              <strong>Análise necessária</strong>
              <span>
                O envio não garante aprovação. A disponibilidade e os dados do contratante serão
                analisados.
              </span>
            </p>
          </div>
          <div className="form-actions">
            <Button variant="ghost" onClick={() => go(back)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} icon="arrow">
              {rental ? "Salvar alterações" : "Confirmar solicitação"}
            </Button>
          </div>
        </form>
        <aside className="summary-card">
          <img src={vehicle.image} alt="" />
          <div>
            <p className="eyebrow">Seu automóvel</p>
            <h3>
              {vehicle.brand} {vehicle.model}
            </h3>
            <dl>
              <div>
                <dt>Ano</dt>
                <dd>{vehicle.year}</dd>
              </div>
              <div>
                <dt>Identificação</dt>
                <dd>{vehicle.registration}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>
                  <Badge status={vehicle.status} />
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </>
  );
}

function Confirmation({ go, id }: { go: (r: Route) => void; id: number }) {
  return (
    <div className="confirmation panel">
      <div className="success-mark">
        <Icon name="check" size={36} />
      </div>
      <p className="eyebrow">Solicitação enviada</p>
      <h1>
        Seu próximo caminho
        <br />
        começa aqui.
      </h1>
      <p>
        Recebemos o pedido <strong>#{id}</strong>. Você poderá acompanhar cada atualização na área
        Meus aluguéis.
      </p>
      <div className="button-row">
        <Button icon="arrow" onClick={() => go("rentals")}>
          Acompanhar pedido
        </Button>
        <Button variant="secondary" onClick={() => go("catalog")}>
          Voltar ao catálogo
        </Button>
      </div>
    </div>
  );
}

function RentalList({
  rentals,
  vehicles,
  go,
  selectRental,
}: {
  rentals: Rental[];
  vehicles: Vehicle[];
  go: (r: Route) => void;
  selectRental: (id: number) => void;
}) {
  const mine = rentals;
  return (
    <>
      <PageTitle
        eyebrow="Seus pedidos"
        title="Meus aluguéis"
        text="Acompanhe análises, consulte detalhes e gerencie solicitações permitidas."
        action={
          <Button icon="plus" onClick={() => go("catalog")}>
            Novo pedido
          </Button>
        }
      />
      <section className="panel">
        <RentalTable
          rentals={mine}
          vehicles={vehicles}
          onView={(id) => {
            selectRental(id);
            go("rental-detail");
          }}
        />
      </section>
    </>
  );
}

const statusSteps: RentalStatus[] = ["Solicitado", "Em análise", "Aprovado"];

function RentalDetail({
  rental,
  vehicle,
  go,
  cancel,
  edit,
}: {
  rental: Rental;
  vehicle: Vehicle;
  go: (r: Route) => void;
  cancel: () => void;
  edit: () => void;
}) {
  const currentIndex = statusSteps.indexOf(rental.status);
  const terminal = ["Recusado", "Cancelado"].includes(rental.status);
  return (
    <>
      <button className="back-link in-app" onClick={() => go("rentals")}>
        ← Voltar aos aluguéis
      </button>
      <PageTitle
        eyebrow={`Pedido #${rental.id}`}
        title={`${vehicle.brand} ${vehicle.model}`}
        text={`Solicitado em ${formatDate(rental.createdAt)}`}
        action={<Badge status={rental.status} />}
      />
      <section className="panel timeline-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Acompanhamento</p>
            <h2>Status do pedido</h2>
          </div>
        </div>
        <div className="timeline">
          {statusSteps.map((s, i) => (
            <div
              className={`timeline-step ${!terminal && i <= currentIndex ? "done" : ""}`}
              key={s}
            >
              <i>{!terminal && i <= currentIndex ? <Icon name="check" size={15} /> : i + 1}</i>
              <div>
                <strong>{s}</strong>
                <span>
                  {i === 0
                    ? formatDate(rental.createdAt)
                    : i === currentIndex
                      ? "Status atual"
                      : "Aguardando"}
                </span>
              </div>
            </div>
          ))}
          {terminal && (
            <div className="timeline-step terminal">
              <i>!</i>
              <div>
                <strong>{rental.status}</strong>
                <span>Processo encerrado</span>
              </div>
            </div>
          )}
        </div>
        <div className="status-message">
          <Icon name="shield" />
          <p>
            <strong>
              {rental.status === "Aprovado"
                ? "Solicitação aprovada"
                : rental.status === "Recusado"
                  ? "Solicitação não aprovada"
                  : rental.status === "Cancelado"
                    ? "Solicitação cancelada"
                    : "Análise em andamento"}
            </strong>
            <span>
              {rental.status === "Aprovado"
                ? "O pedido foi aprovado. Consulte os próximos passos com a empresa."
                : rental.status === "Recusado"
                  ? "A instituição concluiu a análise. Entre em contato com a empresa para mais informações."
                  : rental.status === "Cancelado"
                    ? "Este pedido foi cancelado e não receberá novas atualizações."
                    : "Seus dados estão sendo verificados. Avisaremos quando houver uma atualização."}
            </span>
          </p>
        </div>
      </section>
      <section className="panel order-info">
        <div className="panel-heading">
          <h2>Resumo do pedido</h2>
        </div>
        <dl>
          <div>
            <dt>Automóvel</dt>
            <dd>
              {vehicle.brand} {vehicle.model}
            </dd>
          </div>
          <div>
            <dt>Período</dt>
            <dd>
              {formatDate(rental.start)} a {formatDate(rental.end)}
            </dd>
          </div>
          <div>
            <dt>Identificação</dt>
            <dd>{vehicle.registration}</dd>
          </div>
          <div>
            <dt>Cliente</dt>
            <dd>{rental.client}</dd>
          </div>
        </dl>
        {["Solicitado", "Em análise"].includes(rental.status) && (
          <div className="button-row">
            <Button variant="secondary" onClick={edit}>Editar pedido</Button>
            <Button variant="danger" onClick={cancel}>Cancelar solicitação</Button>
          </div>
        )}
      </section>
      {rental.dados.dataContrato && <section className="panel order-info">
        <div className="panel-heading"><h2>Contrato #{rental.id}</h2></div>
        <p>Formalizado em {formatDate(rental.dados.dataContrato)} por {rental.dados.agenteContrato || "agente autorizado"}</p>
        <p>Proprietário: {rental.dados.proprietario}</p>
        {rental.dados.valorCredito !== null && <p>Crédito de {moeda(rental.dados.valorCredito)} · {rental.dados.bancoCredito}</p>}
      </section>}
    </>
  );
}

function Profile() {
  const [saved, setSaved] = useState(false);
  const [perfil, setPerfil] = useState<PerfilCliente | null>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    api<PerfilCliente>("/meu-cliente").then(dados => {
      if (active) setPerfil(dados);
    }).catch(erro => {
      if (!active) return;
      if (erro instanceof ApiError && erro.status === 404) setPerfil(null);
      else setError(mensagemErro(erro));
    });
    return () => { active = false; };
  }, []);

  async function salvar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const campo = (key: string) => String(data.get(key) ?? "").trim();
    const empregadores = [1, 2, 3].flatMap(n => {
      const nome = campo("empregador" + n);
      const renda = campo("renda" + n);
      return nome || renda ? [{ nome, rendimento: renda ? Number(renda.replace(",", ".")) : NaN }] : [];
    });
    setSaved(false);
    if (empregadores.some(item => !item.nome || !Number.isFinite(item.rendimento) || item.rendimento < 0)) {
      setError("Informe o empregador e um rendimento válido para cada vínculo.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      setPerfil(await api<PerfilCliente>("/meu-cliente", perfil ? "PUT" : "POST", {
        nome: campo("nome"), cpf: campo("cpf").replace(/\D/g, ""), rg: campo("rg"),
        endereco: campo("endereco"), profissao: campo("profissao"), empregadores,
      }));
      setSaved(true);
    } catch (erro) { setError(mensagemErro(erro)); }
    finally { setBusy(false); window.scrollTo({ top: 0, behavior: "smooth" }); }
  }

  async function excluir() {
    if (!window.confirm("Excluir seu cadastro de cliente? Seu login continuará ativo.")) return;
    setBusy(true);
    setSaved(false);
    setError("");
    try {
      await api("/meu-cliente", "DELETE");
      setPerfil(null);
    } catch (erro) { setError(mensagemErro(erro)); }
    finally { setBusy(false); }
  }

  if (perfil === undefined) return <p role="status">{error || "Carregando perfil…"}</p>;
  return (
    <>
      <PageTitle
        eyebrow="Dados do contratante"
        title="Meu perfil"
        text="Mantenha suas informações atualizadas para agilizar a análise dos pedidos."
      />
      {saved && (
        <div className="alert success">
          <Icon name="check" />
          Dados atualizados com sucesso.
        </div>
      )}
      {error && <p className="alert neutral" role="alert">{error}</p>}
      <form className="panel profile-form" onSubmit={salvar} key={JSON.stringify(perfil)}>
        <div className="form-section">
          <div>
            <span>01</span>
            <h2>Dados pessoais</h2>
          </div>
          <div className="form-grid">
            <Field label="Nome completo" name="nome" defaultValue={perfil?.nome} required />
            <Field label="CPF" name="cpf" defaultValue={perfil?.cpf} required />
            <Field label="RG" name="rg" defaultValue={perfil?.rg} required />
            <Field label="Profissão" name="profissao" defaultValue={perfil?.profissao} required />
            <div className="span-2">
              <Field
                label="Endereço"
                name="endereco"
                defaultValue={perfil?.endereco}
                required
              />
            </div>
          </div>
        </div>
        <div className="form-section">
          <div>
            <span>02</span>
            <h2>Vínculos e rendimentos</h2>
            <p>Cadastre até três vínculos empregatícios.</p>
          </div>
          <div className="employer-list">
            {[1, 2, 3].map((n, i) => (
              <div className="employer" key={n}>
                <strong>Vínculo {n}</strong>
                <div className="two-columns">
                  <Field
                    label="Entidade empregadora"
                    name={`empregador${n}`}
                    defaultValue={perfil?.empregadores?.[i]?.nome}
                    placeholder="Nome da empresa"
                  />
                  <Field
                    label="Rendimento mensal"
                    name={`renda${n}`}
                    defaultValue={perfil?.empregadores?.[i]?.rendimento?.toString()}
                    placeholder="0,00"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="form-actions">
          <Button type="submit" disabled={busy}>Salvar alterações</Button>
          {perfil && <Button variant="danger" disabled={busy} onClick={excluir}>Excluir cadastro</Button>}
        </div>
      </form>
    </>
  );
}

function CompanyVehicles({
  vehicles,
  onDelete,
  go,
  select,
}: {
  vehicles: Vehicle[];
  onDelete: (id: number) => Promise<void>;
  go: (r: Route) => void;
  select: (id: number) => void;
}) {
  const [query, setQuery] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const filtered = vehicles.filter((v) =>
    `${v.brand} ${v.model} ${v.plate}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <PageTitle
        eyebrow="Gestão de frota"
        title="Automóveis"
        text="Cadastre, edite e acompanhe os veículos da operação."
        action={
          <Button
            icon="plus"
            onClick={() => {
              select(0);
              go("vehicle-form");
            }}
          >
            Adicionar automóvel
          </Button>
        }
      />
      <div className="search-bar">
        <Icon name="search" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por marca, modelo ou placa"
        />
        <span>{filtered.length} veículos</span>
      </div>
      <section className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Automóvel</th>
                <th>Matrícula</th>
                <th>Ano</th>
                <th>Placa</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id}>
                  <td>
                    <div className="table-car">
                      <img src={v.image} alt="" />
                      <strong>
                        {v.brand} {v.model}
                      </strong>
                    </div>
                  </td>
                  <td>{v.registration}</td>
                  <td>{v.year}</td>
                  <td>{v.plate}</td>
                  <td>
                    <Badge status={v.status} />
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        onClick={() => {
                          select(v.id);
                          go("vehicle-form");
                        }}
                        aria-label="Editar"
                      >
                        <Icon name="edit" />
                      </button>
                      <button
                        className="danger-icon"
                        onClick={() => setDeleteId(v.id)}
                        aria-label="Excluir"
                      >
                        <Icon name="trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {deleteId !== null && (
        <Modal
          title="Excluir automóvel?"
          text="Deseja remover este automóvel do catálogo?"
          onClose={() => setDeleteId(null)}
          action={
            <Button
              variant="danger"
              onClick={async () => {
                try { await onDelete(deleteId); setDeleteId(null); }
                catch (erro) { window.alert(mensagemErro(erro)); }
              }}
            >
              Excluir automóvel
            </Button>
          }
        />
      )}
    </>
  );
}

function VehicleForm({
  vehicle,
  onSave,
  go,
}: {
  vehicle?: Vehicle;
  onSave: (v: Vehicle) => Promise<void>;
  go: (r: Route) => void;
}) {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    setSaving(true);
    setError("");
    try { await onSave({
      id: vehicle?.id ?? 0,
      brand: String(d.get("marca")),
      model: String(d.get("modelo")),
      year: Number(d.get("ano")),
      registration: String(d.get("matricula")),
      plate: String(d.get("placa")),
      image: vehicle?.image || photos.car3,
      status: vehicle?.status || "Disponível",
    });
    go("company-vehicles");
    } catch (erro) { setError(mensagemErro(erro)); }
    finally { setSaving(false); }
  };
  return (
    <>
      <button className="back-link in-app" onClick={() => go("company-vehicles")}>
        ← Voltar para automóveis
      </button>
      <PageTitle
        eyebrow="Gestão de frota"
        title={vehicle ? "Editar automóvel" : "Novo automóvel"}
        text="Preencha somente os dados previstos no cadastro da operação."
      />
      {error && <p className="alert neutral" role="alert">{error}</p>}
      <form className="panel form-panel wide-form" onSubmit={submit}>
        <div className="form-grid">
          <Field
            label="Matrícula"
            name="matricula"
            defaultValue={vehicle?.registration}
            placeholder="AUT-00000"
            required
          />
          <Field
            label="Ano"
            name="ano"
            type="number"
            defaultValue={String(vehicle?.year || "")}
            placeholder="2026"
            required
          />
          <Field
            label="Marca"
            name="marca"
            defaultValue={vehicle?.brand}
            placeholder="Marca"
            required
          />
          <Field
            label="Modelo"
            name="modelo"
            defaultValue={vehicle?.model}
            placeholder="Modelo"
            required
          />
          <Field
            label="Placa"
            name="placa"
            defaultValue={vehicle?.plate}
            placeholder="ABC-1D23"
            required
          />
        </div>
        <div className="info-box">
          <Icon name="car" />
          <p>
            <strong>Imagem do catálogo</strong>
            <span>
              O envio de mídia depende de endpoint específico ainda não confirmado. Novos veículos
              recebem uma imagem demonstrativa.
            </span>
          </p>
        </div>
        <div className="form-actions">
          <Button variant="ghost" onClick={() => go("company-vehicles")}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>{vehicle ? "Salvar alterações" : "Cadastrar automóvel"}</Button>
        </div>
      </form>
    </>
  );
}

function RequestsPage({
  rentals,
  vehicles,
  go,
  select,
}: {
  rentals: Rental[];
  vehicles: Vehicle[];
  go: (r: Route) => void;
  select: (id: number) => void;
}) {
  return (
    <>
      <PageTitle
        eyebrow="Operações"
        title="Solicitações de aluguel"
        text="Consulte os pedidos recebidos e avalie as ações disponíveis."
      />
      <section className="panel">
        <RentalTable
          rentals={rentals}
          vehicles={vehicles}
          onView={(id) => {
            select(id);
            go("company-review");
          }}
        />
      </section>
    </>
  );
}

function Review({
  rental,
  vehicle,
  role,
  update,
  go,
}: {
  rental: Rental;
  vehicle: Vehicle;
  role: "EMPRESA" | "BANCO";
  update: (s: RentalStatus, observacao: string) => Promise<void>;
  go: (r: Route) => void;
}) {
  const [confirm, setConfirm] = useState<RentalStatus | null>(null);
  const [feedback, setFeedback] = useState("");
  const [observacao, setObservacao] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const apply = async () => {
    if (!confirm) return;
    setSaving(true);
    setError("");
    try {
      await update(confirm, observacao);
      setFeedback("Parecer registrado com sucesso.");
    } catch (erro) { setError(mensagemErro(erro)); }
    finally { setConfirm(null); setSaving(false); }
  };
  return (
    <>
      <button
        className="back-link in-app"
        onClick={() => go(role === "EMPRESA" ? "company-rentals" : "bank-analysis")}
      >
        ← Voltar às solicitações
      </button>
      <PageTitle
        eyebrow={`${role === "BANCO" ? "Análise financeira" : "Avaliação"} · Pedido #${rental.id}`}
        title={`${vehicle.brand} ${vehicle.model}`}
        action={<Badge status={rental.status} />}
      />
      {error && <p className="alert neutral" role="alert">{error}</p>}
      {feedback && (
        <div className="alert success">
          <Icon name="check" />
          {feedback}
        </div>
      )}
      <div className="review-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Contratante</p>
              <h2>{rental.client}</h2>
            </div>
          </div>
          <div className="data-grid">
            <div>
              <span>CPF</span>
              <strong>{rental.dados.cliente.cpf}</strong>
            </div>
            <div>
              <span>Profissão</span>
              <strong>{rental.dados.cliente.profissao}</strong>
            </div>
            {(rental.dados.cliente.empregadores ?? []).map((item, index) => (
              <div key={index}><span>{item.nome}</span><strong>{moeda(item.rendimento)}</strong></div>
            ))}
          </div>
          {rental.dados.agenteParecer && <p>Parecer de {rental.dados.agenteParecer}: {rental.dados.observacaoParecer || rental.status}</p>}
        </section>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Solicitação</p>
              <h2>Dados do pedido</h2>
            </div>
          </div>
          <div className="mini-vehicle">
            <img src={vehicle.image} alt="" />
            <div>
              <strong>
                {vehicle.brand} {vehicle.model}
              </strong>
              <span>
                {vehicle.registration} · {vehicle.year}
              </span>
            </div>
          </div>
          <dl className="review-dl">
            <div>
              <dt>Período</dt>
              <dd>
                {formatDate(rental.start)} a {formatDate(rental.end)}
              </dd>
            </div>
            <div>
              <dt>Solicitado em</dt>
              <dd>{formatDate(rental.createdAt)}</dd>
            </div>
            <div>
              <dt>Situação</dt>
              <dd>
                <Badge status={rental.status} />
              </dd>
            </div>
          </dl>
        </section>
      </div>
      {["Solicitado", "Em análise"].includes(rental.status) && (
        <div className="decision-bar">
          <div>
            <strong>Registrar decisão</strong>
            <Field label="Observação do parecer" name="parecer"><input name="parecer" maxLength={255} value={observacao} onChange={e => setObservacao(e.target.value)} /></Field>
          </div>
          <div>
            <Button variant="secondary" onClick={() => go("edit-request")}>Editar pedido</Button>
            <Button variant="danger" disabled={saving} onClick={() => setConfirm("Recusado")}>
              Recusar
            </Button>
            <Button disabled={saving} onClick={() => setConfirm("Aprovado")}>Aprovar pedido</Button>
          </div>
        </div>
      )}
      {confirm && (
        <Modal
          title={`${confirm === "Aprovado" ? "Aprovar" : "Recusar"} pedido?`}
          text="Confirme a decisão. Conflitos ou impedimentos devem ser tratados pela API sem alteração silenciosa do status."
          onClose={() => setConfirm(null)}
          action={
            <Button variant={confirm === "Aprovado" ? "primary" : "danger"} onClick={apply}>
              Confirmar decisão
            </Button>
          }
        />
      )}
    </>
  );
}

function BankAnalysis({
  rentals,
  vehicles,
  go,
  select,
}: {
  rentals: Rental[];
  vehicles: Vehicle[];
  go: (r: Route) => void;
  select: (id: number) => void;
}) {
  return (
    <>
      <PageTitle
        eyebrow="Risco e crédito"
        title="Análise financeira"
        text="Consulte os pedidos encaminhados à instituição e avalie conforme as permissões disponíveis."
      />
      <div className="alert neutral">
        <Icon name="shield" />Confira os dados do contratante antes de registrar o parecer.
      </div>
      <section className="panel">
        <RentalTable
          rentals={rentals.filter((r) => r.status !== "Cancelado")}
          vehicles={vehicles}
          onView={(id) => {
            select(id);
            go("bank-analysis");
          }}
        />
      </section>
      <p className="demo-note">Selecione a seta em um pedido para abrir seus dados de análise.</p>
    </>
  );
}

function Contracts({ rentals, role, atualizar }: {
  rentals: Rental[];
  role: Role;
  atualizar: (id: number, action: "contrato" | "credito", body: unknown) => Promise<void>;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>, id: number, action: "contrato" | "credito") {
    e.preventDefault();
    const dados = new FormData(e.currentTarget);
    setError("");
    setBusy(true);
    try {
      await atualizar(id, action, action === "contrato"
        ? { tipo: dados.get("tipo"), proprietario: dados.get("proprietario") }
        : { valor: Number(dados.get("valor")) });
    } catch (erro) { setError(mensagemErro(erro)); }
    finally { setBusy(false); }
  }

  const aprovados = rentals.filter(r => r.status === "Aprovado");
  return <>
    <PageTitle eyebrow="Instrumentos vinculados" title="Contratos"
      text="Formalize pedidos aprovados e consulte o crédito associado." />
    {error && <p className="alert neutral" role="alert">{error}</p>}
    {!aprovados.length && <EmptyState title="Nenhum pedido aprovado" text="Os pedidos aprovados aparecerão aqui." />}
    <div className="contracts-grid">
      {aprovados.map(({ id, dados, client, start, end }) => (
        <article className="panel contract-card" key={id}>
          <div className="contract-icon"><Icon name="file" /></div>
          <div>
            <Badge status="Aprovado" />
            <h3>{dados.dataContrato ? "Contrato" : "Pedido"} #{id}</h3>
            <p>{client} · {dados.automovel.marca} {dados.automovel.modelo}</p>
            <p>{formatDate(start)} a {formatDate(end)}</p>
            {dados.dataContrato ? <>
              <p>Formalizado em {formatDate(dados.dataContrato)} por {dados.agenteContrato || "agente autorizado"}</p>
              <p>Proprietário: {dados.proprietario} ({dados.tipoProprietario})</p>
              {dados.valorCredito !== null ? <p>Crédito de {moeda(dados.valorCredito)} · {dados.bancoCredito}</p>
                : role === "BANCO" && (
                  <form onSubmit={e => void submit(e, id, "credito")}>
                    <label>Valor do crédito <input name="valor" type="number" min="0.01" step="0.01" required /></label>
                    <Button type="submit" disabled={busy}>Registrar crédito</Button>
                  </form>
                )}
            </> : (
              <form onSubmit={e => void submit(e, id, "contrato")}>
                <label>Tipo de proprietário <select name="tipo">
                  <option value="CLIENTE">Cliente contratante</option>
                  <option value="EMPRESA">Empresa</option>
                  <option value="BANCO">Banco</option>
                </select></label>
                <Field label="Usuário do proprietário (empresa ou banco)" name="proprietario" />
                <Button type="submit" disabled={busy}>Formalizar contrato</Button>
              </form>
            )}
          </div>
        </article>
      ))}
    </div>
  </>;
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty-state">
      <div>
        <Icon name="file" />
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function Modal({
  title,
  text,
  onClose,
  action,
}: {
  title: string;
  text: string;
  onClose: () => void;
  action: ReactNode;
}) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Fechar">
          <Icon name="close" />
        </button>
        <div className="modal-icon">
          <Icon name="shield" />
        </div>
        <h2 id="modal-title">{title}</h2>
        <p>{text}</p>
        <div className="modal-actions">
          <Button variant="ghost" onClick={onClose}>
            Voltar
          </Button>
          {action}
        </div>
      </div>
    </div>
  );
}

const rotasExtras: Record<Role, Route[]> = {
  CLIENTE: ["vehicle", "request", "edit-request", "confirmation", "rental-detail"],
  EMPRESA: ["vehicle", "vehicle-form", "company-review", "edit-request"],
  BANCO: ["vehicle", "edit-request"],
};

const rotasComPedidos: Route[] = [
  "client-dashboard", "company-dashboard", "bank-dashboard",
  "rentals", "rental-detail", "confirmation", "edit-request",
  "company-rentals", "company-review", "bank-analysis", "contracts",
];

export default function App() {
  const [route, setRoute] = useState<Route>(() => (location.hash.slice(1) || "home") as Route);
  const [sessao, setSessao] = useState<{ role: Role; usuario: string } | null>(null);
  const [restaurandoSessao, setRestaurandoSessao] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [vehicleId, setVehicleId] = useState(0);
  const [rentalId, setRentalId] = useState(0);
  const [loadError, setLoadError] = useState("");
  const [vehicleError, setVehicleError] = useState("");
  const role = sessao?.role;
  const base = role === "CLIENTE" ? "/meus-alugueis" : "/alugueis";
  const exibePedidos = rotasComPedidos.includes(route);

  function go(next: Route) {
    setRoute(next);
    location.hash = next;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    const sync = () => setRoute((location.hash.slice(1) || "home") as Route);
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    let active = true;
    api<UsuarioLogado>("/auth/me")
      .then(profile => {
        if (active) setSessao({ role: profile.perfil, usuario: profile.login });
      })
      .catch(() => {})
      .finally(() => { if (active) setRestaurandoSessao(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!sessao) return;
    let active = true;
    automovelService.listar()
      .then(dados => { if (active) setVehicles(dados.map(converterAutomovel)); })
      .catch(erro => { if (active) setVehicleError(mensagemErro(erro)); });
    return () => { active = false; };
  }, [sessao]);

  useEffect(() => {
    if (!sessao || !exibePedidos) return;
    let active = true;
    async function carregarPedidos() {
      try {
        return await api<AluguelAPI[]>(base);
      } catch (erro) {
        if (role === "CLIENTE" && erro instanceof ApiError && erro.status === 400) {
          try {
            await api<PerfilCliente>("/meu-cliente");
          } catch (erroPerfil) {
            if (erroPerfil instanceof ApiError && erroPerfil.status === 404) return [];
          }
        }
        throw erro;
      }
    }
    carregarPedidos()
      .then(dados => {
        if (!active) return;
        setRentals(dados.map(converterAluguel).sort((a, b) => b.id - a.id));
        setLoadError("");
      })
      .catch(erro => { if (active) setLoadError("Não foi possível carregar os pedidos. " + mensagemErro(erro)); });
    return () => { active = false; };
  }, [sessao, base, role, route, exibePedidos]);

  function limparDados() {
    setVehicles([]);
    setRentals([]);
    setVehicleId(0);
    setRentalId(0);
    setLoadError("");
    setVehicleError("");
  }

  function login(role: Role, usuario: string) {
    limparDados();
    setSessao({ role, usuario });
    go(navByRole[role][0].route);
  }

  async function logout() {
    try {
      await api("/auth/sair", "POST");
    } catch (erro) {
      window.alert(mensagemErro(erro));
      return;
    }
    setSessao(null);
    limparDados();
    go("home");
  }

  if (route === "home") return <Home go={go} vehicles={vehicles} chooseVehicle={setVehicleId} />;
  if (restaurandoSessao) return <p role="status">Verificando sua sessão…</p>;
  if (route === "login" || route === "signup" || !sessao || !role)
    return <AuthLayout mode={route === "signup" ? "signup" : "login"} go={go} onLogin={login} />;

  const permitida = navByRole[role].some(item => item.route === route) || rotasExtras[role].includes(route);
  const currentVehicle = vehicles.find(v => v.id === vehicleId);
  const currentRental = rentals.find(r => r.id === rentalId);
  const rentalVehicle = currentRental && converterAutomovel(currentRental.dados.automovel);
  const detalhesAgente = role === "EMPRESA" ? "company-review" : "bank-analysis";

  async function atualizarAluguel(path: string, method: string, body?: unknown) {
    const novo = converterAluguel(await api<AluguelAPI>(path, method, body));
    setRentals(prev => [novo, ...prev.filter(item => item.id !== novo.id)].sort((a, b) => b.id - a.id));
    return novo;
  }

  let content: ReactNode;
  if (permitida) switch (route) {
    case "profile":
      content = <Profile />;
      break;
    case "catalog":
      content = <Catalog vehicles={vehicles} select={setVehicleId} go={go} />;
      break;
    case "vehicle":
      if (currentVehicle) content = <VehicleDetail vehicle={currentVehicle} go={go} role={role} />;
      break;
    case "request":
    case "edit-request": {
      const edit = route === "edit-request" ? currentRental : undefined;
      const vehicle = route === "request" ? currentVehicle : edit && rentalVehicle;
      if (vehicle) content = <RentalRequest key={route} vehicle={vehicle} rental={edit} vehicles={vehicles} go={go}
        back={edit ? role === "CLIENTE" ? "rental-detail" : detalhesAgente : "vehicle"}
        addRental={async (automovelId, start, end) => {
          if (!edit && role === "CLIENTE") {
            try {
              await api<PerfilCliente>("/meu-cliente");
            } catch (erro) {
              if (erro instanceof ApiError && erro.status === 404) throw new PerfilIncompleto();
              throw erro;
            }
          }
          const dados = { automovelId, dataInicio: start, dataFim: end };
          const novo = await atualizarAluguel(edit ? base + "/" + edit.id : base, edit ? "PUT" : "POST", dados);
          setRentalId(novo.id);
          go(edit ? role === "CLIENTE" ? "rental-detail" : detalhesAgente : "confirmation");
        }} />;
      break;
    }
    case "confirmation":
      if (currentRental) content = <Confirmation go={go} id={currentRental.id} />;
      break;
    case "rentals":
      content = <RentalList rentals={rentals} vehicles={vehicles} go={go} selectRental={setRentalId} />;
      break;
    case "rental-detail":
      if (currentRental && rentalVehicle) content = <RentalDetail rental={currentRental} vehicle={rentalVehicle}
        go={go} edit={() => go("edit-request")} cancel={async () => {
          if (!window.confirm("Cancelar este pedido de aluguel?")) return;
          try { await atualizarAluguel(base + "/" + currentRental.id + "/cancelamento", "PATCH"); }
          catch (erro) { window.alert(mensagemErro(erro)); }
        }} />;
      break;
    case "company-vehicles":
      content = <CompanyVehicles vehicles={vehicles} go={go} select={setVehicleId} onDelete={async id => {
        await automovelService.excluir(id);
        setVehicles(prev => prev.filter(v => v.id !== id));
      }} />;
      break;
    case "vehicle-form":
      content = <VehicleForm vehicle={currentVehicle} go={go} onSave={async v => {
        const dados = { matricula: v.registration, marca: v.brand, modelo: v.model, ano: v.year, placa: v.plate };
        const salvo = v.id ? await automovelService.atualizar(v.id, dados)
          : await automovelService.cadastrar(dados);
        setVehicles(prev => [converterAutomovel(salvo), ...prev.filter(item => item.id !== salvo.id)]);
      }} />;
      break;
    case "company-rentals":
      content = <RequestsPage rentals={rentals} vehicles={vehicles} go={go} select={setRentalId} />;
      break;
    case "company-review":
    case "bank-analysis":
      if (currentRental && rentalVehicle && role !== "CLIENTE") {
        content = <Review key={currentRental.id} rental={currentRental} vehicle={rentalVehicle} role={role}
          update={async (status, observacao) => {
            const query = new URLSearchParams({ status: status === "Aprovado" ? "APROVADO" : "RECUSADO", observacao });
            try {
              await atualizarAluguel(base + "/" + currentRental.id + "/status?" + query, "PATCH");
            } catch (erro) {
              if (!(erro instanceof ApiError) || erro.status !== 409) throw erro;

              const atualizados = await api<AluguelAPI[]>(base).catch(() => null);
              if (!atualizados) throw erro;
              setRentals(atualizados.map(converterAluguel).sort((a, b) => b.id - a.id));
              const pedido = atualizados.find(item => item.id === currentRental.id);
              if (!pedido) throw erro;
              if (pedido.status !== "PENDENTE") {
                throw new Error(`O pedido #${pedido.id} já está com o status ${converterAluguel(pedido).status.toLowerCase()}.`);
              }
              const reserva = status === "Aprovado" && atualizados.find(item =>
                item.id !== pedido.id && item.status === "APROVADO" &&
                item.automovel.id === pedido.automovel.id &&
                item.dataInicio <= pedido.dataFim && item.dataFim >= pedido.dataInicio
              );
              if (reserva) {
                throw new Error(`O veículo já está reservado pelo pedido #${reserva.id}, de ${formatDate(reserva.dataInicio)} a ${formatDate(reserva.dataFim)}. Edite o pedido e escolha outro período.`);
              }
              throw erro;
            }
          }}
          go={next => { if (next === "bank-analysis") setRentalId(0); go(next); }} />;
      } else if (route === "bank-analysis") {
        content = <BankAnalysis rentals={rentals} vehicles={vehicles} go={go} select={setRentalId} />;
      }
      break;
    case "contracts":
      content = <Contracts rentals={rentals} role={role}
        atualizar={async (id, action, body) => { await atualizarAluguel(base + "/" + id + "/" + action, "POST", body); }} />;
      break;
  }

  return (
    <AppShell usuarioLogado={sessao.usuario} role={role} route={route}
      go={next => { if (next === "bank-analysis") setRentalId(0); go(next); }} logout={logout}>
      {exibePedidos && loadError && <p className="alert neutral" role="alert">{loadError}</p>}
      {vehicleError && <p className="alert neutral" role="alert">{vehicleError}</p>}
      {content ?? <Dashboard role={role} usuarioLogado={sessao.usuario} rentals={rentals}
        vehicles={vehicles} go={go} selectRental={setRentalId} />}
    </AppShell>
  );
}
