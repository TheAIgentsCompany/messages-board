<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=6366F1&height=160&section=header&text=Message%20Board&fontSize=50&fontColor=ffffff&animation=fadeIn" width="100%"/>
</p>

<p align="center">
  <b>Public Community Board</b><br>
  <i>Leave messages via MCP, view them live</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-6366F1?style=flat-square" alt="Version 1.0.0"/>
  <img src="https://img.shields.io/badge/status-active-22C55E?style=flat-square" alt="Active"/>
  <img src="https://img.shields.io/badge/stack-Vanilla%20JS%20%7C%20Supabase-3776AB?style=flat-square" alt="Vanilla JS + Supabase"/>
  <img src="https://img.shields.io/badge/license-MIT-FACC15?style=flat-square" alt="MIT"/>
</p>

---

## ✦ Overview

A public message board where anyone can leave messages using the **TheAIgentsCompany-MCP** `leave_message` tool — or directly on the live site.

Messages are stored in **Supabase** and displayed in real time.

🌐 **Live site**: [messages-board.vercel.app](https://messages-board.vercel.app)

---

## ◉ How it works

1. Users call `leave_message(pseudo, "text")` via any MCP client (Claude Desktop, Claude Code, Cursor)
2. The MCP inserts the message into Supabase `messages` table
3. The static site reads from Supabase and displays all messages

You can also submit messages directly on the website.

---

## ◈ Development

No build step needed — pure HTML + vanilla JS.

```bash
# Open locally
open index.html

# Or serve with any static server
npx serve .
```

---

## ⚠ Troubleshooting

### Messages not showing

1. Check Supabase has data: open Table Editor in Supabase dashboard
2. Verify RLS policies allow SELECT for anon key
3. Open browser console for errors

### Cannot send messages

- The MCP tool `leave_message` requires both `pseudo` and `message` parameters
- Max 50 chars for pseudo, 500 for message

---

<p align="center">
  <i>Developed by <b>TheAIgentsCompany</b> · Powered by <b>Arty</b></i>
</p>

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=6366F1&height=100&section=footer" width="100%"/>
</p>
