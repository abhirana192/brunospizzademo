import { FormEvent, useState } from "react";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { useToast } from "../context/ToastContext";
import { ApiClientError } from "../api/client";

const glassInput =
  "w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-white/40 focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/10 transition";

export function AuthModal({ onClose, onAuthenticated }: { onClose: () => void; onAuthenticated?: () => void }) {
  const { login, signup } = useCustomerAuth();
  const { showToast } = useToast();
  const [mode, setMode] = useState<"login" | "signup">("login");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function switchMode(next: "login" | "signup") {
    setMode(next);
    setFormError(null);
    setFieldErrors({});
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    try {
      if (mode === "login") {
        await login(email, password);
        showToast(`Welcome back!`);
      } else {
        await signup({ firstName, lastName, email, password, phone });
        showToast(`Welcome, ${firstName}!`);
      }
      onAuthenticated?.();
      onClose();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setFormError(err.message);
        if (err.details) {
          const fe: Record<string, string> = {};
          for (const d of err.details) fe[d.path] = d.message;
          setFieldErrors(fe);
        }
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onWheel={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
    >
      <div className="absolute inset-0 bg-charcoal-950/70 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        data-lenis-prevent
        className="relative w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/15 shadow-premium max-h-[92vh] overflow-y-auto no-scrollbar animate-fadeUp"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full bg-white/10 border border-white/20 text-white text-sm flex items-center justify-center hover:bg-white/20 transition"
        >
          ✕
        </button>

        <div className="px-7 sm:px-9 pb-7 sm:pb-9 pt-14 sm:pt-16">
          <div className="flex rounded-full bg-white/10 border border-white/10 p-1">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`flex-1 rounded-full py-2 text-sm font-bold transition ${
                mode === "login" ? "bg-white text-charcoal-900" : "text-white/60 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={`flex-1 rounded-full py-2 text-sm font-bold transition ${
                mode === "signup" ? "bg-white text-charcoal-900" : "text-white/60 hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>

          <h2 id="auth-modal-title" className="font-display text-2xl font-bold text-white mt-6">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-white/60 mt-1 text-sm">
            {mode === "login" ? "Sign in to order faster next time." : "Sign up to save your info for next time."}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-1.5" htmlFor="auth-first-name">
                      First name
                    </label>
                    <input
                      id="auth-first-name"
                      className={glassInput}
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                    {fieldErrors.firstName && <p className="text-xs text-amber-300 mt-1">{fieldErrors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-1.5" htmlFor="auth-last-name">
                      Last name
                    </label>
                    <input
                      id="auth-last-name"
                      className={glassInput}
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                    {fieldErrors.lastName && <p className="text-xs text-amber-300 mt-1">{fieldErrors.lastName}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-1.5" htmlFor="auth-phone">
                    Phone number
                  </label>
                  <input
                    id="auth-phone"
                    type="tel"
                    className={glassInput}
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  {fieldErrors.phone && <p className="text-xs text-amber-300 mt-1">{fieldErrors.phone}</p>}
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-1.5" htmlFor="auth-email">
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                className={glassInput}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {fieldErrors.email && <p className="text-xs text-amber-300 mt-1">{fieldErrors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-1.5" htmlFor="auth-password">
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                className={glassInput}
                required
                minLength={mode === "signup" ? 8 : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {fieldErrors.password && <p className="text-xs text-amber-300 mt-1">{fieldErrors.password}</p>}
            </div>

            {formError && <p className="text-sm text-amber-300 font-medium">{formError}</p>}

            <button type="submit" disabled={submitting} className="btn-primary w-full text-base py-3.5">
              {submitting ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
