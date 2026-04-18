# Contentful MCP Server

This MCP (Model Context Protocol) server allows LLMs (like Claude via Claude Desktop, Cursor, or other MCP clients) to interact directly with your Contentful space. 

Specifically, it provides tools to:
1. **Draft Content:** Create a new `landingPage` entry in Contentful.
2. **Publish Content:** Publish an existing/drafted entry. 

Both actions return a URL (`?preview=true` for drafts, and the clean URL for published pages) that you can immediately open to test your Next.js application.

## Prerequisites

1. **Python 3.12+**
2. **`uv`** (Python toolchain manager, although `pip` works too)
3. **Contentful Management Token (CMA)**

### Obtaining a Contentful Management Token (CMA)
Unlike your Delivery/Preview access tokens, a Management Token is required for an application to *create* and *modify* content.
1. Log into your Contentful web app.
2. Go to **Settings > API keys**.
3. Select the **Content management tokens** tab.
4. Click **Generate personal token**.
5. Name it something like "MCP Server", and copy the generated token immediately. It will start with `CFPAT-`.

## Configuration

This server relies on Environment Variables to authenticate with Contentful. Set these variables in whatever client you use to run the MCP (or your terminal environment).

```env
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_ENVIRONMENT=master
CONTENTFUL_MANAGEMENT_TOKEN=CFPAT-xxxxxxxxxxxxxxxxx
```

**(Optional) Base URL Configuration:**
By default, the server assumes your Next.js frontend is running at `http://localhost:3000`. To change the base URL for the generated preview/published links, set `WEBAPP_BASE_URL`:
```env
WEBAPP_BASE_URL=https://your-staging-site.com
```

## Running the Server Locally

Since this server uses standard `stdio` to communicate via MCP, you don't typically run it just by executing the Python script. It is meant to be invoked by an MCP Client.

However, to test the script runs properly without a UI client, you can use:
```bash
uv run main.py
```
*(If it just hangs waiting for input, it means it's working properly and waiting for JSON-RPC messages from an MCP client).*

## Development & Testing

To actively develop and test this MCP server, you'll need the core dependencies and a testing environment.

### Dependent Libraries Context
Our project uses two main dependencies (defined in `pyproject.toml`):
- **`mcp` (`mcp>=1.0.0`)**: The official Model Context Protocol SDK by Anthropics. It provides you with the `@mcp.tool()` decorators (via `FastMCP`) which automatically format your Python functions into the standardized JSON-RPC schema that AI clients recognize.
- **`requests` (`requests>=2.31.0`)**: A simple HTTP library used to interact directly with the Contentful Management API (CMA). It handles the POST/PUT requests to Contentful's REST endpoints.

### Step-by-Step Local Setup

1. **Install Dependencies:**
   ```bash
   uv sync
   ```
   **Purpose:** The `sync` command reads `pyproject.toml` and creates an isolated `.venv` environment, installing the required packages (`mcp`, `requests`) inside it. This prevents system-wide library conflicts.

2. **Run the Next.js target server (Optional but recommended):**
   ```bash
   cd ../webapp
   npm run dev
   ```
   **Purpose:** Starting `dev` in your webapp folder runs the local frontend at `http://localhost:3000`. This ensures that when the MCP server returns a preview/published link, you can immediately test it in your browser.

3. **Start the MCP Inspector (for tool testing):**
   ```bash
   # Make sure you are in the mcp directory
   # Export your variables, e.g., in PowerShell:
   # $env:CONTENTFUL_SPACE_ID="your_space"
   # $env:CONTENTFUL_MANAGEMENT_TOKEN="CFPAT-xxx"
   uv run mcp dev main.py
   ```
   **Purpose:** The `mcp dev main.py` command launches the **MCP Inspector**, an interactive web UI provided by the `mcp[cli]` toolkit. It runs a local debugging page (usually at `http://localhost:5173`) where you can manually type arguments (`slug`, `content`) and execute your Contentful tools without needing Claude Desktop open.

## Using this MCP Server

### In Claude Desktop app
Edit your `claude_desktop_config.json` file (typically located at `%APPDATA%\Claude\claude_desktop_config.json` on Windows or `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS).

Add the following under `mcpServers`:

```json
{
  "mcpServers": {
    "contentful": {
      "command": "uv",
      "args": [
        "run",
        "--directory",
        "d:/SourceCode/contentful-mcp/mcp",
        "main.py"
      ],
      "env": {
        "CONTENTFUL_SPACE_ID": "your_space_id",
        "CONTENTFUL_ENVIRONMENT": "master",
        "CONTENTFUL_MANAGEMENT_TOKEN": "CFPAT-xxxxxxxxxxxx"
      }
    }
  }
}
```

### In Cursor
1. Go to **Settings -> Features -> MCP**.
2. Click **Add New MCP Server**.
3. Make it a `command` type.
4. Set the command to: `uv run --directory d:/SourceCode/contentful-mcp/mcp main.py`
5. Note: Cursor currently does not have a native way to inject env variables into the MCP command natively in the UI yet, so you may need to author a wrapper script `.bat` or `.sh` that first exports the variables, then calls `uv run main.py`.

## Available Tools

1. `draft_landing_page(slug, content)`: Supply a URL slug and HTML/Text content. It interacts with the CMA to draft the item and prints out Next.js the preview link.
2. `publish_landing_page(entry_id, version, slug)`: Once you have an `entry_id` and a `version` (returned from drafting), you can execute this tool to officially publish it to delivery APIs. Displays the finalized frontend URL.
