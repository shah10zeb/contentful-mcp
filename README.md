# Contentful MCP Server & Localized Webapp Monorepo

This monorepo contains a unique architecture that pairs a local **Model Context Protocol (MCP)** server with a headless **Next.js Web Application**, working in tandem to rapidly generate, draft, preview, and publish content to **Contentful**.

## 🚀 Overview

The purpose of this project is to allow LLMs (like Claude via Claude Desktop, or Cursor) to act as an automated developer and content creator that can:
1. Receive instructions from you to build a landing page.
2. **Draft** the layout, styling, and text content directly to Contentful via the MCP Server.
3. Automatically return a local preview link so you can view it in the **Next.js Webapp** instantly.
4. **Publish** the data securely to live endpoints once approved.

### Sub-Projects

- **`mcp/`**: A Python-based server implementing the official Anthropics MCP SDK. It uses the Contentful Management API (CMA) to read, draft, and publish items in your space.
- **`webapp/`**: A lightweight Next.js 16 application that strips away standard boilerplate layouts and consumes HTML/CSS structured payloads directly via Contentful's GraphQL Delivery/Preview APIs. Features complete internationalized routing mapping (e.g. `domain/[lang]/[slug]`).

---

## 📐 System Architecture

The following outlines how the components interact in standard operations:

**1. AI Client Ecosystem**
- **LLM Context (Claude Desktop / Cursor):** The user instructs the AI via a prompt (e.g. "Create a landing page"). The AI communicates directly with the Python-based MCP server via standard over-the-wire Model Context Protocol (stdio).

**2. Monorepo Services & Contentful Hooks**
- **MCP Server (Python/FastMCP):** Acts as the bridge. It receives the layout and text requests from the AI, translates them, and posts them directly into the **Contentful Management API (CMA)** as draft entries.
- **Contentful Cloud:** Internally synchronizes the new draft data between the Management API (CMA) and the Delivery/Preview API (CDA) so it's instantly available globally.

**3. Preview & Presentation**
- **User Browser:** The MCP server computes and prints out a local preview link (e.g., `?preview=true`), which the developer clicks.
- **Next.js WebApp (React/App Router):** The lightweight frontend detects the user's route, executes a cache-busted GraphQL request to the **Contentful Delivery/Preview API (CDA)**, pulling exactly the HTML and CSS payloads the AI drafted, and presents it to the user.

---

## ⚙️ How It Works In Practice

1. **User Request**: You ask your LLM in Cursor or Claude to *"Create an about-us page with a blue theme using the MCP tool"*.
2. **MCP Tool Execution**: The AI uses the exposed MCP tool `draft_landing_page(slug, content)`. The server translates this into an API payload targeting the Contentful CMA.
3. **Drafted Data**: Contentful creates the draft entry and the MCP server returns a local preview link, pointing to the Next.js target server (e.g., `http://localhost:3000/en/about-us?preview=true`).
4. **Webapp Rendering**: You click the preview link. The Next Webapp catches the `?preview=true` flag, skips standard caching (`revalidate: 0`), interrogates Contentful's GraphQL endpoint using the Preview API token, and seamlessly hydrates the localized route with exactly what the AI built.

---

## 🛠 Getting Started

To get the ecosystem running simultaneously:

### 1. Set Up the Webapp
Navigate to the Webapp directory, configure your `.env.local` keys, and run the developer server.
```bash
cd webapp
npm install
npm run dev
```
*(For detailed setup, see `webapp/README.md`)*

### 2. Set Up the MCP Server
Navigate to the MCP directory, sync Python dependencies, and attach it to your client (Claude or Cursor).
```bash
cd mcp
uv sync
```
*(For full instructions on attaching to Claude/Cursor or testing locally via Inspector, see `mcp/README.md`)*
