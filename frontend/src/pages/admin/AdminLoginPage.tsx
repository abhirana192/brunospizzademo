import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Logo } from "../../components/Logo";
import { useAuth } from "../../context/AuthContext";
import { ApiClientError } from "../../api/client";

export function AdminLoginPage() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/admin" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      navigate("/admin");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Unable to sign in right now.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-charcoal-900 flex items-center justify-center px-5">
      <Helmet>
        <title>Staff Login — Bruno's Deli & Pizza</title>
      </Helmet>
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Logo className="[&_span]:text-cream-50" />
        </div>
        <form onSubmit={handleSubmit} className="card bg-cream-50 p-7 space-y-4">
          <h1 className="font-display font-bold text-xl text-center">Staff Login</h1>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" className="input" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input id="password" type="password" className="input" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </div>
          {error && <p className="text-sm text-burgundy-600">{error}</p>}
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
