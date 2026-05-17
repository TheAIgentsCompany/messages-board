const SUPABASE_URL = "https://gvkljtwhsulzdpsapaau.supabase.co";
const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2a2xqdHdoc3VsemRwc2FwYWF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NjU5MTQsImV4cCI6MjA2MzA0MTkxNH0.X86ep8qcQ4bp6nPMxW9v4HJCnHWBq7k8oYgKfN2vR88";

/* ── Helpers ─────────────────────────────────────────────── */

function escapeHtml(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

function getInitials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2)
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ── Render ──────────────────────────────────────────────── */

const app = document.getElementById("app");

function render() {
  app.innerHTML = `
    <!-- Header -->
    <header class="bg-linear-to-r from-indigo-500 to-purple-500 px-5 py-12 text-center relative overflow-hidden">
      <div class="absolute inset-0 opacity-[0.07]"
        style="background-image: url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")">
      </div>
      <div class="relative z-10">
        <h1 class="text-white text-3xl sm:text-4xl font-bold tracking-tight">💬 Message Board</h1>
        <p class="text-white/80 mt-2 text-sm sm:text-base">Leave a message for the community</p>
      </div>
    </header>

    <!-- Container -->
    <main class="max-w-2xl w-full mx-auto px-5 py-8 flex-1">
      <!-- Form Card -->
      <div class="bg-[#161922] border border-[#22262e] rounded-xl p-5 sm:p-6 mb-8">
        <h2 class="text-indigo-300 font-semibold text-sm sm:text-base mb-4 flex items-center gap-2">
          <span>✏️</span> Leave a message
        </h2>
        <div class="mb-3">
          <label class="text-[#7a8290] text-xs block mb-1" for="pseudo">Your name or nickname</label>
          <input
            id="pseudo" type="text" maxlength="50" placeholder="e.g. Alex, Dev42, ..."
            class="w-full bg-[#0a0c10] border border-[#22262e] rounded-lg px-3.5 py-2.5 text-sm text-[#e8eaed] placeholder-[#7a8290] outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <div class="mb-3">
          <label class="text-[#7a8290] text-xs block mb-1" for="message">Message</label>
          <textarea
            id="message" maxlength="500" rows="3" placeholder="Write your message..."
            class="w-full bg-[#0a0c10] border border-[#22262e] rounded-lg px-3.5 py-2.5 text-sm text-[#e8eaed] placeholder-[#7a8290] outline-none focus:border-indigo-500 transition-colors resize-y"
          ></textarea>
        </div>
        <div class="flex items-center justify-between mt-2">
          <span class="text-[#7a8290] text-xs"><span id="charCount">0</span>/500</span>
          <button
            id="sendBtn" onclick="window.sendMessage()"
            class="bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            Send
          </button>
        </div>
      </div>

      <!-- Messages Section -->
      <div class="flex items-center gap-2 mb-4">
        <h2 class="text-indigo-300 font-semibold text-sm sm:text-base">💬 Messages</h2>
        <span id="countBadge" class="bg-indigo-500 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full">0</span>
      </div>
      <div id="messagesList">
        ${[1,2,3].map(() => `
          <div class="bg-[#161922] rounded-xl mb-3 overflow-hidden">
            <div class="bg-linear-to-r from-[#161922] via-[#22262e] to-[#161922] bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] h-[88px]"></div>
          </div>
        `).join("")}
      </div>
    </main>

    <!-- Footer -->
    <footer class="text-center py-6 text-[#7a8290] text-xs border-t border-[#22262e]">
      Powered by <a href="https://github.com/TheAIgentsCompany/TheAIgentsCompany-MCP" class="text-indigo-400 hover:underline">TheAIgentsCompany-MCP</a>
      · <a href="https://github.com/TheAIgentsCompany/messages-board" class="text-indigo-400 hover:underline">GitHub</a>
    </footer>
  `;
}

/* ── Messages ────────────────────────────────────────────── */

async function loadMessages() {
  const list = document.getElementById("messagesList");
  const badge = document.getElementById("countBadge");
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/messages?select=id,pseudo,message,created_at&order=created_at.desc&limit=100`,
      { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` } }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const msgs = await res.json();
    badge.textContent = msgs.length;

    if (msgs.length === 0) {
      list.innerHTML = `
        <div class="text-center py-16 border-2 border-dashed border-[#22262e] rounded-xl">
          <div class="text-4xl mb-3">📭</div>
          <p class="text-[#7a8290] text-sm">No messages yet</p>
          <p class="text-[#7a8290] text-xs mt-1">Use the MCP tool <strong class="text-[#e8eaed]">leave_message</strong> to be the first!</p>
        </div>`;
      return;
    }

    list.innerHTML = msgs
      .map(
        (m) => `
      <div class="bg-[#161922] border border-[#22262e] rounded-xl p-4 sm:p-5 mb-3 hover:border-[#2d3142] transition-colors">
        <div class="flex items-center justify-between mb-2">
          <span class="flex items-center gap-2 text-indigo-300 text-sm font-semibold">
            <span class="w-6 h-6 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold">${escapeHtml(getInitials(m.pseudo))}</span>
            ${escapeHtml(m.pseudo)}
          </span>
          <span class="text-[#7a8290] text-[11px]">${formatDate(m.created_at)}</span>
        </div>
        <div class="text-[#cbd5e1] text-sm leading-relaxed break-words">${escapeHtml(m.message)}</div>
      </div>`
      )
      .join("");
  } catch (e) {
    list.innerHTML = `
      <div class="text-center py-16 border-2 border-dashed border-[#22262e] rounded-xl">
        <div class="text-4xl mb-3">⚠️</div>
        <p class="text-[#7a8290] text-sm">Could not load messages</p>
        <p class="text-[#7a8290] text-xs mt-1">${e.message}</p>
      </div>`;
  }
}

/* ── Send ────────────────────────────────────────────────── */

window.sendMessage = async function () {
  const pseudo = document.getElementById("pseudo").value.trim();
  const message = document.getElementById("message").value.trim();
  const btn = document.getElementById("sendBtn");

  if (!pseudo || !message) return showToast("Please fill in both fields", true);
  btn.disabled = true;
  btn.textContent = "Sending...";

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${SUPABASE_ANON}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ pseudo, message }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    document.getElementById("pseudo").value = "";
    document.getElementById("message").value = "";
    document.getElementById("charCount").textContent = "0";
    showToast("✅ Message sent!");
    loadMessages();
  } catch {
    showToast("Failed to send. Try again.", true);
  }
  btn.disabled = false;
  btn.textContent = "Send";
};

/* ── Toast ───────────────────────────────────────────────── */

function showToast(text, isError = false) {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    t.className =
      "fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#161922] border border-green-500 rounded-lg px-5 py-3 text-green-500 text-sm shadow-lg opacity-0 translate-y-5 transition-all duration-300 pointer-events-none z-50";
    document.body.appendChild(t);
  }
  t.textContent = text;
  t.className = t.className.replace("opacity-0", "opacity-100").replace("translate-y-5", "translate-y-0");
  t.className += isError ? " border-red-500 text-red-500" : " border-green-500 text-green-500";
  setTimeout(() => {
    t.className = t.className.replace("opacity-100", "opacity-0").replace("translate-y-0", "translate-y-5");
  }, 3000);
}

/* ── Events ──────────────────────────────────────────────── */

document.addEventListener("input", (e) => {
  if (e.target.id === "message") {
    document.getElementById("charCount").textContent = e.target.value.length;
  }
});

/* ── Init ────────────────────────────────────────────────── */

render();
loadMessages();
