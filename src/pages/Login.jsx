import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginApi, setSession } from "../supabase.js";

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
        <h1>Messages</h1>
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
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Signing in…" : "Sign In"}</button>
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
