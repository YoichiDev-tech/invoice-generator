import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { signIn, signUp } from "../features/auth/api/authApi";
import { useAuth } from "../features/auth/hooks/useAuth";
import Logo from "../components/common/Logo";

type Mode = "signIn" | "signUp";

export default function LoginPage() {
  const { session } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Already signed in? Skip straight to the app
  if (session) {
    navigate("/create", { replace: true });
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === "signUp") {
        const data = await signUp(email, password);
        // If email confirmation is required, Supabase returns a user but no session yet
        if (!data.session) {
          setInfoMessage("Account created. Check your email to confirm before signing in.");
        } else {
          navigate("/create", { replace: true });
        }
      } else {
        await signIn(email, password);
        navigate("/create", { replace: true });
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page auth-page">
      <div className="card auth-card">
        <div className="auth-header">
          <Logo size={56} />
          <h1 className="section-title">{mode === "signIn" ? "Log in" : "Create an account"}</h1>
          <p className="auth-subtitle">
            {mode === "signIn"
              ? "Sign in to create and manage your invoices."
              : "Set up an account to start creating invoices."}
          </p>
        </div>

        <form className="space-y" onSubmit={handleSubmit}>
          <div className="field">
            <label className="label">Email</label>
            <input
              type="email"
              required
              className="input"
              value={email}
              placeholder="you@company.com"
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="label">Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="input"
              value={password}
              placeholder="At least 6 characters"
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {errorMessage && (
            <div className="form-alert" role="alert">
              {errorMessage}
            </div>
          )}

          {infoMessage && <div className="form-info">{infoMessage}</div>}

          <button type="submit" className="btn btn-primary auth-submit" disabled={isSubmitting}>
            {isSubmitting ? "Please wait…" : mode === "signIn" ? "Log in" : "Sign up"}
          </button>
        </form>

        <button
          type="button"
          className="auth-toggle"
          onClick={() => {
            setMode(mode === "signIn" ? "signUp" : "signIn");
            setErrorMessage(null);
            setInfoMessage(null);
          }}
        >
          {mode === "signIn" ? "Need an account? Sign up" : "Already have an account? Log in"}
        </button>
      </div>
    </div>
  );
}