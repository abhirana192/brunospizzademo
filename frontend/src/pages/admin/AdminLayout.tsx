import { Navigate, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Logo } from "../../components/Logo";

export function AdminLayout() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-charcoal-400">Loading…</div>;
  }
  if (!user) return <Navigate to="/admin/login" replace />;

  return (
    <div className="min-h-screen bg-cream-100">
      <header className="bg-charcoal-900 text-cream-50">
        <div className="section flex items-center justify-between h-16">
          <Logo className="[&_span]:text-cream-50 scale-90" />
          <nav className="flex items-center gap-1">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) => `px-4 py-2 rounded-full text-sm font-semibold ${isActive ? "bg-white/15" : "hover:bg-white/10"}`}
            >
              Orders
            </NavLink>
            <NavLink
              to="/admin/menu"
              className={({ isActive }) => `px-4 py-2 rounded-full text-sm font-semibold ${isActive ? "bg-white/15" : "hover:bg-white/10"}`}
            >
              Menu Management
            </NavLink>
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden sm:inline text-charcoal-300">{user.name}</span>
            <button onClick={() => logout()} className="btn-ghost !text-cream-50 hover:!bg-white/10 !px-3 !py-1.5 text-sm">
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="section py-8">
        <Outlet />
      </main>
    </div>
  );
}
