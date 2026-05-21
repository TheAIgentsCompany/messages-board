import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, getSession, clearSession } from "../supabase.js";

// ── SVG Icons ─────────────────────────────

function IconReply() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 17 4 12 9 7" />
      <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
    </svg>
  );
}

function IconCopy() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function IconNewConv() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

function IconSend() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function IconBack() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconGroup() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconGlobe() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function IconReplyAll() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="7 17 2 12 7 7" />
      <polyline points="12 17 7 12 12 7" />
      <path d="M22 18v-2a4 4 0 0 0-4-4H7" />
    </svg>
  );
}

// ── Helpers ────────────────────────────────

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ── Component ──────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const session = getSession();
  const [convs, setConvs] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  const [tab, setTab] = useState("direct");
  const [publicMsgs, setPublicMsgs] = useState([]);
  const [showNewConv, setShowNewConv] = useState(false);
  const [newConvPseudo, setNewConvPseudo] = useState("");
  const [error, setError] = useState("");
  const [replyTo, setReplyTo] = useState(null);   // { id, pseudo, message }
  const [publicReplyTo, setPublicReplyTo] = useState(null);
  const msgEndRef = useRef(null);

  useEffect(() => {
    if (!session) { navigate("/login", { replace: true }); return; }
    loadConvs();
    loadPublic();
  }, []);

  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, publicMsgs]);

  async function loadConvs() {
    const { data, error } = await supabase
      .from("conversation_members")
      .select("conversation_id, conversations!inner(id, type, name, created_at)")
      .eq("user_id", session.id);

    if (error || !data?.length) { setConvs([]); return; }

    const ids = data.map((r) => r.conversation_id);

    // Fetch member counts
    const { data: counts } = await supabase
      .from("conversation_members")
      .select("conversation_id")
      .in("conversation_id", ids);

    // Fetch member pseudos for direct conversations
    const { data: members } = await supabase
      .from("conversation_members")
      .select("conversation_id, user_id, users!inner(pseudo)")
      .in("conversation_id", ids)
      .neq("user_id", session.id);

    // Build member name map
    const memberNames = {};
    for (const m of members || []) {
      if (!memberNames[m.conversation_id]) memberNames[m.conversation_id] = [];
      memberNames[m.conversation_id].push(m.users.pseudo);
    }

    // Fetch latest messages per conversation
    const { data: msgs } = await supabase
      .from("conversation_messages")
      .select("conversation_id, content, created_at, sender_id, users!inner(pseudo)")
      .in("conversation_id", ids)
      .order("created_at", { ascending: false });

    // Fetch actual member counts per conversation
    const countMap = {};
    for (const c of counts || []) {
      countMap[c.conversation_id] = (countMap[c.conversation_id] || 0) + 1;
    }

    // Get latest message per conversation
    const latest = {};
    for (const m of msgs || []) {
      if (!latest[m.conversation_id]) latest[m.conversation_id] = m;
    }

    setConvs(data.map((r) => {
      const c = r.conversations;
      const last = latest[c.id];
      const convNames = memberNames[c.id] || [];
      let name = c.name;
      if (!name && c.type === "direct") {
        name = convNames[0] || "Direct";
      } else if (!name) {
        name = c.type === "direct" ? "Direct" : "Group";
      }
      return {
        id: c.id, type: c.type, name,
        last_msg: last?.content?.slice(0, 60), last_at: last?.created_at,
        last_pseudo: last?.users?.pseudo,
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
    setReplyTo(null);
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
      .insert({
        conversation_id: activeConv.id,
        sender_id: session.id,
        content: msgInput.trim(),
        ...(replyTo ? { parent_id: replyTo.id } : {}),
      })
      .select("id, sender_id, content, created_at, users!inner(pseudo)")
      .single();
    if (!error && data) {
      setMessages((prev) => [...prev, {
        id: data.id, sender_id: data.sender_id,
        pseudo: data.users.pseudo, content: data.content, created_at: data.created_at,
      }]);
      setMsgInput("");
      setReplyTo(null);
      loadConvs();
    }
  }

  async function sendPublicMsg() {
    if (!msgInput.trim()) return;
    const { data, error } = await supabase
      .from("messages")
      .insert({
        pseudo: session.pseudo,
        message: msgInput.trim(),
        ...(publicReplyTo ? { parent_id: publicReplyTo.id } : {}),
      })
      .select("id, pseudo, message, parent_id, created_at")
      .single();
    if (!error && data) {
      // Re-fetch all public messages to keep ordering correct
      loadPublic();
      setMsgInput("");
      setPublicReplyTo(null);
    }
  }

  async function startNewConv() {
    if (!newConvPseudo.trim()) return;
    setError("");
    const { data: target } = await supabase.from("users").select("id").eq("pseudo", newConvPseudo.trim()).maybeSingle();
    if (!target) { setError("User not found"); return; }

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

  // ── Build threaded public messages ─────

  const publicThreaded = (() => {
    const roots = [];
    const replies = {};
    for (const m of publicMsgs) {
      if (m.parent_id) {
        if (!replies[m.parent_id]) replies[m.parent_id] = [];
        replies[m.parent_id].push(m);
      } else {
        roots.push(m);
      }
    }
    // Sort replies by created_at ascending within each thread
    for (const k of Object.keys(replies)) {
      replies[k].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }
    return { roots, replies };
  })();

  if (!session) return null;

  return (
    <div className="dash-layout">
      <aside className="dash-sidebar">
        <div className="sidebar-header">
          <h2>Messages</h2>
          <button className="btn-icon" onClick={() => setShowNewConv(true)} title="New conversation">
            <IconNewConv />
          </button>
        </div>
        <div className="sidebar-tabs">
          <button className={`tab ${tab === "direct" ? "active" : ""}`}
            onClick={() => { setTab("direct"); setActiveConv(null); setReplyTo(null); }}>
            <span className="tab-icon"><IconUser /></span> DMs
          </button>
          <button className={`tab ${tab === "public" ? "active" : ""}`}
            onClick={() => { setTab("public"); setActiveConv(null); setPublicReplyTo(null); }}>
            <span className="tab-icon"><IconGlobe /></span> Public
          </button>
        </div>
        <div className="conv-list">
          {tab === "direct" && convs.length === 0 && <div className="empty-state-sm">No conversations yet</div>}
          {tab === "direct" && convs.map((c) => (
            <div key={c.id} className={`conv-item ${activeConv?.id === c.id ? "active" : ""}`} onClick={() => openConv(c)}>
              <div className="conv-icon">{c.type === "direct" ? <IconUser /> : <IconGroup />}</div>
              <div className="conv-info">
                <div className="conv-name">{c.name}</div>
                <div className="conv-preview">
                  {c.last_pseudo ? <span className="preview-pseudo">{c.last_pseudo}: </span> : ""}
                  {c.last_msg || <span className="preview-empty">—</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="sidebar-user" onClick={handleLogout}>
          <span className="user-avatar">{session.pseudo?.[0]?.toUpperCase()}</span>
          <span className="user-name">{session.pseudo}</span>
          <span className="logout-icon-btn"><IconLogout /></span>
        </div>
      </aside>

      <main className="dash-main">
        {tab === "public" ? (
          <div className="conv-view">
            <div className="conv-header">
              <h2>Public Message Board</h2>
              <span className="badge">{publicMsgs.length}</span>
            </div>

            {/* Public reply indicator */}
            {publicReplyTo && (
              <div className="reply-indicator">
                <span className="reply-icon"><IconReplyAll /></span>
                <span className="reply-label">Replying to <strong>{publicReplyTo.pseudo}</strong></span>
                <span className="reply-text-preview">"{publicReplyTo.message.slice(0, 50)}{publicReplyTo.message.length > 50 ? "…" : ""}"</span>
                <button className="reply-cancel" onClick={() => setPublicReplyTo(null)} title="Cancel reply">
                  <IconClose />
                </button>
              </div>
            )}

            <div className="msg-list">
              {publicMsgs.length === 0 ? <div className="empty-state">No public messages yet</div> : (
                publicThreaded.roots.map((root) => (
                  <div key={root.id} className="msg-thread">
                    <div className="msg-bubble public">
                      <div className="msg-meta">
                        <span className="msg-author">{root.pseudo}</span>
                        <span className="msg-time">{formatTime(root.created_at)}</span>
                      </div>
                      <div className="msg-text">{root.message}</div>
                      <div className="msg-actions">
                        <button className="msg-action-btn" onClick={() => setPublicReplyTo(root)} title="Reply">
                          <IconReply />
                        </button>
                      </div>
                    </div>
                    {/* Thread replies */}
                    {publicThreaded.replies[root.id] && (
                      <div className="thread-replies">
                        {publicThreaded.replies[root.id].map((reply) => (
                          <div key={reply.id} className="msg-bubble public reply">
                            <div className="thread-line" />
                            <div className="reply-content">
                              <div className="msg-meta">
                                <span className="msg-author">{reply.pseudo}</span>
                                <span className="msg-time">{formatTime(reply.created_at)}</span>
                              </div>
                              <div className="msg-text">{reply.message}</div>
                              <div className="msg-actions">
                                <button className="msg-action-btn" onClick={() => setPublicReplyTo(reply)} title="Reply">
                                  <IconReply />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={msgEndRef} />
            </div>

            <div className="msg-input-area">
              <input
                type="text"
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendPublicMsg()}
                placeholder={publicReplyTo ? "Write a reply…" : "Write a public message…"}
              />
              <button className="btn btn-primary btn-send" onClick={sendPublicMsg} disabled={!msgInput.trim()}>
                <IconSend />
              </button>
            </div>
          </div>
        ) : activeConv ? (
          <div className="conv-view">
            <div className="conv-header">
              <button className="back-btn" onClick={() => setActiveConv(null)}><IconBack /></button>
              <h2>{activeConv.name || "Conversation"}</h2>
            </div>

            {/* DM reply indicator */}
            {replyTo && (
              <div className="reply-indicator">
                <span className="reply-icon"><IconReplyAll /></span>
                <span className="reply-label">Replying to <strong>{replyTo.pseudo}</strong></span>
                <span className="reply-text-preview">"{replyTo.content.slice(0, 50)}{replyTo.content.length > 50 ? "…" : ""}"</span>
                <button className="reply-cancel" onClick={() => setReplyTo(null)} title="Cancel reply">
                  <IconClose />
                </button>
              </div>
            )}

            <div className="msg-list">
              {messages.length === 0 ? <div className="empty-state">No messages yet</div> : (
                messages.map((m) => (
                  <div className={`msg-bubble ${m.sender_id === session.id ? "mine" : ""}`} key={m.id}>
                    <div className="msg-meta">
                      <span className="msg-author">{m.sender_id === session.id ? "You" : m.pseudo}</span>
                      <span className="msg-time">{formatTime(m.created_at)}</span>
                    </div>
                    <div className="msg-text">{m.content}</div>
                    <div className="msg-actions">
                      <button className="msg-action-btn" onClick={() => setReplyTo(m)} title="Reply">
                        <IconReply />
                      </button>
                    </div>
                  </div>
                ))
              )}
              <div ref={msgEndRef} />
            </div>
            <div className="msg-input-area">
              <input
                type="text"
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMsg()}
                placeholder={replyTo ? "Write a reply…" : "Type a message…"}
              />
              <button className="btn btn-primary btn-send" onClick={sendMsg} disabled={!msgInput.trim()}>
                <IconSend />
              </button>
            </div>
          </div>
        ) : (
          <div className="conv-view">
            <div className="conv-header"><h2>Select a conversation</h2></div>
            <div className="empty-state" style={{ marginTop: 60 }}>
              <p>Choose a conversation from the sidebar or start a new one</p>
              <button className="btn btn-primary" style={{ marginTop: 16, width: "auto" }} onClick={() => setShowNewConv(true)}>
                <IconNewConv /> New Conversation
              </button>
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
