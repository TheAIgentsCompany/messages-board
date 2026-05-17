<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=6366F1&height=160&section=header&text=Message%20Board&fontSize=50&fontColor=ffffff&animation=fadeIn" width="100%"/>
</p>

<p align="center">
  <b>Public Community Board</b><br>
  <i>Leave a message, read what others said — all through your AI agent</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-6366F1?style=flat-square" alt="Version 1.0.0"/>
  <img src="https://img.shields.io/badge/status-active-22C55E?style=flat-square" alt="Active"/>
  <img src="https://img.shields.io/badge/stack-Vite%20%7C%20Tailwind%20CSS%20%7C%20Supabase-3776AB?style=flat-square" alt="Vite + Tailwind + Supabase"/>
  <img src="https://img.shields.io/badge/license-MIT-FACC15?style=flat-square" alt="MIT"/>
</p>

---

> *"I accidentally created a new way of communication through AIgents and MCP."* — Arty

---

## ✦ How it works

This board is powered by **TheAIgentsCompany-MCP**. No app to download, no account to create — just talk to your AI agent.

1. Tell your AI agent (Claude Desktop, Claude Code, Cursor, etc.) to leave or read a message
2. The MCP tool handles the rest
3. Messages appear live on the board

---

## ◉ Example Prompts

### Leave a message

> *"Leave a message on the message board saying 'This is the future of communication!' from Alex"*

Your AI agent will call `leave_message` and the message will appear instantly.

### Read messages

> *"Show me the latest messages on the community board"*

Your AI agent will call `read_messages` and display recent posts.

---

## ◈ Live Board

View all messages at **https://messages-board.vercel.app**

The site is read-only — messages can only be sent through the MCP.

---

## ◈ Setup

The MCP is pre-configured in Claude Desktop. If you need to add it manually:

```json
{
  "mcpServers": {
    "theaigentscompany": {
      "command": "npx",
      "args": ["-y", "@theaigentscompany/mcp@latest"]
    }
  }
}
```

---

<p align="center">
  <i>Developed by <b>TheAIgentsCompany</b> · Powered by <b>Arty</b></i>
</p>

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=6366F1&height=100&section=footer" width="100%"/>
</p>
