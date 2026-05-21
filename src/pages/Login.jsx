import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginApi, setSession } from "../supabase.js";

function IconMessageSquare() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export default function Login() {
  const [pseudo, setPseudo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const data = await loginApi(pseudo, password);
      if (data.error) { setError(data.error); return; }
      setSession(data);
      navigate("/", { replace: true });
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  }

  return (
    <div className="page">
      <div className="card animate-in">
        <div className="auth-brand">
          <div className="auth-brand-svg"><IconMessageSquare /></div>
          Messages
        </div>

        <h1>Sign In</h1>
        <p className="subtitle">Sign in to access your conversations</p>

        {error && <div className="msg msg-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Pseudo</label>
            <input type="text" value={pseudo} onChange={(e) => setPseudo(e.target.value)} placeholder="Your pseudo" autoFocus required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <IconLock /> {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="footer-link">
          Don't have an account? <a href="https://auth.theaigentscompany.xyz/register">Register on auth.theaigentscompany.xyz</a>
        </p>
      </div>

      <footer className="footer">
        <sub>Developed by <b><a href="https://github.com/TheAIgentsCompany">TheAIgentsCompany</a></b> · Powered by <b><a href="https://github.com/ArtyETH06">Arty</a></b></sub>
      </footer>
    </div>
  );
}
