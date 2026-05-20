import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, getSession, clearSession } from "../supabase.js";

export default function Dashboard() {
  const navigate = useNavigate();
  const session = getSession();
  const [convs, setConvs] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  const [tab, setTab] = useState("direct"); // direct | public
  const [publicMsgs, setPublicMsgs] = useState([]);
  const [showNewConv, setShowNewConv] = useState(false);
  const [newConvPseudo, setNewConvPseudo] = useState("");
  const [error, setError] = useState("");
  const msgEndRef = useRef(null);

  useEffect(() => {
    if (!session) { navigate("/login", { replace: true }); return; }
    loadConvs();
    loadPublic();
  }, []);

  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function loadConvs() {
    const { data, error } = await supabase
      .from("conversation_members")
      .select("conversation_id, conversations!inner(id, type, name, created_at)")
      .eq("user_id", session.id);

    if (error || !data?.length) { setConvs([]); return; }

    const ids = data.map((r) => r.conversation_id);

    const { data: msgs } = await supabase
      .from("conversation_messages")
      .select("conversation_id, content, created_at, sender_id, users!inner(pseudo)")
      .in("conversation_id", ids)
      .order("created_at", { ascending: false });

    const { data: counts } = await supabase
      .from("conversation_members")
      .select("conversation_id")
      .in("conversation_id", ids);

    const latest = {};
    for (const m of msgs || []) {
      if (!latest[m.conversation_id]) latest[m.conversation_id] = m;
    }
    const countMap = {};
    for (const c of counts || []) {
      countMap[c.conversation_id] = (countMap[c.conversation_id] || 0) + 1;
    }

    setConvs(data.map((r) => {
      const c = r.conversations;
      const last = latest[c.id];
      return {
        id: c.id, type: c.type, name: c.name || (c.type === "direct" ? "Direct" : "Group"),
        last_msg: last?.content?.slice(0, 60), last_at: last?.created_at,
        members: countMap[c.id] || 1,
      };
    }));
  }

  async function loadPublic() {
    const { data } = await supabase
      .from("messages")
      .select("id, pseudo, message, parent_id, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setPublicMsgs(data);
  }

  async function openConv(conv) {
    setActiveConv(conv);
    setTab("direct");
    const { data } = await supabase
      .from("conversation_messages")
      .select("id, sender_id, content, created_at, users!inner(pseudo)")
      .eq("conversation_id", conv.id)
      .order("created_at", { ascending: true });
    setMessages((data || []).map((m) => ({
      id: m.id, sender_id: m.sender_id,
      pseudo: m.users.pseudo, content: m.content, created_at: m.created_at,
    })));
  }

  async function sendMsg() {
    if (!msgInput.trim() || !activeConv) return;
    const { data, error } = await supabase
      .from("conversation_messages")
      .insert({ conversation_id: activeConv.id, sender_id: session.id, content: msgInput.trim() })
      .select("id, sender_id, content, created_at, users!inner(pseudo)")
      .single();
    if (!error && data) {
      setMessages((prev) => [...prev, { id: data.id, sender_id: data.sender_id, pseudo: data.users.pseudo, content: data.content, created_at: data.created_at }]);
      setMsgInput("");
      loadConvs();
    }
  }

  async function startNewConv() {
    if (!newConvPseudo.trim()) return;
    setError("");
    const { data: target } = await supabase.from("users").select("id").eq("pseudo", newConvPseudo.trim()).maybeSingle();
    if (!target) { setError("User not found"); return; }

    // Check if conversation already exists
    const { data: myConvs } = await supabase.from("conversation_members").select("conversation_id").eq("user_id", session.id);
    const myIds = (myConvs || []).map((r) => r.conversation_id);
    if (myIds.length > 0) {
      const { data: existing } = await supabase
        .from("conversation_members")
        .select("conversation_id, conversations!inner(type)")
        .in("conversation_id", myIds)
        .eq("user_id", target.id)
        .eq("conversations.type", "direct")
        .maybeSingle();
      if (existing) {
        const conv = convs.find((c) => c.id === existing.conversation_id);
        if (conv) { openConv(conv); setShowNewConv(false); setNewConvPseudo(""); return; }
      }
    }

    // Create new
    const { data: conv, error: ce } = await supabase.from("conversations").insert({ type: "direct" }).select("id").single();
    if (ce) { setError(ce.message); return; }
    await supabase.from("conversation_members").insert([
      { conversation_id: conv.id, user_id: session.id },
      { conversation_id: conv.id, user_id: target.id },
    ]);
    setShowNewConv(false); setNewConvPseudo("");
    loadConvs();
  }

  function handleLogout() { clearSession(); navigate("/login", { replace: true }); }

  if (!session) return null;

  return (
    <div className="dash-layout">
      <aside className="dash-sidebar">
        <div className="sidebar-header">
          <h2>💬 Messages</h2>
          <button className="btn-icon" onClick={() => setShowNewConv(true)} title="New conversation">✏️</button>
        </div>
        <div className="sidebar-tabs">
          <button className={`tab ${tab === "direct" ? "active" : ""}`} onClick={() => { setTab("direct"); setActiveConv(null); }}>💬 DMs</button>
          <button className={`tab ${tab === "public" ? "active" : ""}`} onClick={() => { setTab("public"); setActiveConv(null); }}>🌍 Public</button>
        </div>
        <div className="conv-list">
          {tab === "direct" && convs.length === 0 && <div className="empty-state-sm">No conversations yet</div>}
          {tab === "direct" && convs.map((c) => (
            <div key={c.id} className={`conv-item ${activeConv?.id === c.id ? "active" : ""}`} onClick={() => openConv(c)}>
              <div className="conv-icon">{c.type === "direct" ? "👤" : "👥"}</div>
              <div className="conv-info">
                <div className="conv-name">{c.name || c.id.slice(0, 8)}</div>
                <div className="conv-preview">{c.last_msg || "—"}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="sidebar-user" onClick={handleLogout}>
          <span className="user-avatar">{session.pseudo?.[0]?.toUpperCase()}</span>
          <span className="user-name">{session.pseudo}</span>
          <span className="logout-icon">↪</span>
        </div>
      </aside>

      <main className="dash-main">
        {tab === "public" ? (
          <div className="conv-view">
            <div className="conv-header"><h2>🌍 Public Message Board</h2><span className="badge">{publicMsgs.length}</span></div>
            <div className="msg-list">
              {publicMsgs.length === 0 ? <div className="empty-state">No public messages yet</div> : (
                publicMsgs.map((m) => (
                  <div className="msg-bubble public" key={m.id}>
                    <div className="msg-meta"><span className="msg-author">{m.pseudo}</span><span className="msg-time">{new Date(m.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span></div>
                    <div className="msg-text">{m.message}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : activeConv ? (
          <div className="conv-view">
            <div className="conv-header">
              <button className="back-btn" onClick={() => setActiveConv(null)}>←</button>
              <h2>{activeConv.name || "Conversation"}</h2>
            </div>
            <div className="msg-list">
              {messages.length === 0 ? <div className="empty-state">No messages yet</div> : (
                messages.map((m) => (
                  <div className={`msg-bubble ${m.sender_id === session.id ? "mine" : ""}`} key={m.id}>
                    <div className="msg-meta">
                      <span className="msg-author">{m.sender_id === session.id ? "You" : m.pseudo}</span>
                      <span className="msg-time">{new Date(m.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <div className="msg-text">{m.content}</div>
                  </div>
                ))
              )}
              <div ref={msgEndRef} />
            </div>
            <div className="msg-input-area">
              <input type="text" value={msgInput} onChange={(e) => setMsgInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMsg()} placeholder="Type a message…" />
              <button className="btn btn-primary" onClick={sendMsg} disabled={!msgInput.trim()}>Send</button>
            </div>
          </div>
        ) : (
          <div className="conv-view">
            <div className="conv-header"><h2>Select a conversation</h2></div>
            <div className="empty-state" style={{ marginTop: 60 }}>
              <p>Choose a conversation from the sidebar or start a new one</p>
              <button className="btn btn-primary" style={{ marginTop: 16, width: "auto" }} onClick={() => setShowNewConv(true)}>✏️ New Conversation</button>
            </div>
          </div>
        )}
      </main>

      {showNewConv && (
        <div className="modal-overlay" onClick={() => setShowNewConv(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>New Conversation</h2>
            {error && <div className="msg msg-error">{error}</div>}
            <div className="form-group">
              <label>Pseudo of the person</label>
              <input type="text" value={newConvPseudo} onChange={(e) => setNewConvPseudo(e.target.value)} placeholder="e.g. arty" autoFocus />
            </div>
            <button className="btn btn-primary" onClick={startNewConv}>Start</button>
            <button className="btn btn-outline" style={{ marginTop: 8 }} onClick={() => setShowNewConv(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
