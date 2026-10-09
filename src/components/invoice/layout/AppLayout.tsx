import type { ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import { signOut } from "../../../features/auth/api/AuthApi";

interface AppLayoutProps { children: ReactNode; title: string; description?: string; }

const navigation = [
  { to: "/dashboard", label: "Overview", icon: "◫" },
  { to: "/invoices", label: "Invoices", icon: "▤" },
  { to: "/clients", label: "Clients", icon: "♙" },
  { to: "/create", label: "Create invoice", icon: "+" },
  { to: "/settings", label: "Settings", icon: "⚙" },
];

export default function AppLayout({ children, title, description }: AppLayoutProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <div className="workspace-shell">
      <aside className="workspace-sidebar">
        <NavLink to="/dashboard" className="workspace-brand" aria-label="Invoice Generator home"><span className="workspace-brand-mark">i.</span><span>folio<span className="workspace-brand-dot">.</span></span></NavLink>
        <div className="workspace-nav-label">WORKSPACE</div>
        <nav className="workspace-nav" aria-label="Workspace navigation">
          {navigation.map((item) => <NavLink key={item.to} to={item.to} className={({ isActive }) => "workspace-nav-link" + (isActive || (item.to === "/invoices" && location.pathname.startsWith("/invoices/")) ? " is-active" : "")}><span className="workspace-nav-icon" aria-hidden="true">{item.icon}</span><span>{item.label}</span>{item.to === "/create" && <span className="workspace-nav-shortcut">New</span>}</NavLink>)}
        </nav>
        <div className="workspace-sidebar-bottom">
          <div className="workspace-user"><div className="workspace-avatar">{(user?.email?.[0] ?? "Y").toUpperCase()}</div><div className="min-w-0"><p className="truncate text-xs font-semibold text-white">{user?.email ?? "Your workspace"}</p><p className="mt-1 text-[10px] text-slate-400">Personal workspace</p></div></div>
          <button className="workspace-signout" onClick={() => void handleSignOut()}>Sign out <span aria-hidden="true">↗</span></button>
        </div>
      </aside>
      <div className="workspace-main">
        <header className="workspace-topbar">
          <div><p className="workspace-breadcrumb">WORKSPACE <span>/</span> {title.toUpperCase()}</p><h1>{title}</h1>{description && <p className="workspace-description">{description}</p>}</div>
          <div className="workspace-topbar-right"><span className="workspace-status-dot" /> <span>Autosave-ready workspace</span></div>
        </header>
        <main className="workspace-content">{children}</main>
      </div>
    </div>
  );
}
