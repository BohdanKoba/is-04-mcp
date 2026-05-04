#!/usr/bin/env node
/**
 * excalidraw-scenes — minimal MCP server for working with .excalidraw scene files.
 *
 * Tools:
 *   - list_scenes(dir):       list .excalidraw files under a directory
 *   - read_scene(path):       return parsed JSON of one scene
 *   - extract_text(path):     return all text-element strings from a scene
 *
 * Resource:
 *   - excalidraw://docs/dev-docs-readme — returns dev-docs/README.md
 *
 * Run:
 *   npm install && npm run build
 *   node dist/server.js
 *
 * Wire into Cursor: see ../../.cursor/mcp.json.example
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative, resolve } from "node:path";

const server = new McpServer({
  name: "excalidraw-scenes",
  version: "0.1.0",
});

const workspaceRoot = resolve(process.env.EXCALIDRAW_MCP_ROOT ?? process.cwd());
const allowedRoots = (process.env.EXCALIDRAW_SCENE_ROOTS ?? "examples,excalidraw-app")
  .split(",")
  .map((root) => resolve(workspaceRoot, root.trim()))
  .filter(Boolean);

const devDocsReadme = resolve(workspaceRoot, "dev-docs/README.md");

const isInside = (base: string, target: string) => {
  const rel = relative(base, target);
  return rel === "" || (!rel.startsWith("..") && !rel.includes(".."));
};

const resolveAndValidate = (userPath: string) => {
  const absolutePath = resolve(workspaceRoot, userPath);
  const allowed = allowedRoots.some((root) => isInside(root, absolutePath));
  if (!allowed) {
    throw new Error(
      `Path is outside allowed roots. Allowed: ${allowedRoots
        .map((root) => relative(workspaceRoot, root) || ".")
        .join(", ")}`,
    );
  }
  return absolutePath;
};

server.registerTool(
  "list_scenes",
  {
    title: "List Excalidraw scenes",
    description:
      "List .excalidraw files under a directory (path is relative to the repo root). Returns one path per line.",
    inputSchema: {
      dir: z
        .string()
        .describe("Directory to scan, e.g. 'examples' or 'excalidraw-app/data'"),
    },
  },
  async ({ dir }) => {
    const absolutePath = resolveAndValidate(dir);
    const stats = await stat(absolutePath).catch(() => null);
    if (!stats || !stats.isDirectory()) {
      return {
        content: [{ type: "text", text: `Directory not found: ${dir}` }],
        isError: true,
      };
    }
    const entries = await readdir(absolutePath, { withFileTypes: true });
    const scenes = entries
      .filter((e) => e.isFile() && e.name.endsWith(".excalidraw"))
      .map((e) => join(relative(workspaceRoot, absolutePath), e.name));
    return {
      content: [
        {
          type: "text",
          text: scenes.length ? scenes.join("\n") : `(no .excalidraw files in ${dir})`,
        },
      ],
    };
  },
);

server.registerTool(
  "read_scene",
  {
    title: "Read Excalidraw scene",
    description:
      "Return the parsed JSON of an .excalidraw file as a pretty-printed string.",
    inputSchema: {
      path: z.string().describe("Path to a .excalidraw file"),
    },
  },
  async ({ path }) => {
    const absolutePath = resolveAndValidate(path);
    const raw = await readFile(absolutePath, "utf8");
    const parsed = JSON.parse(raw);
    return {
      content: [{ type: "text", text: JSON.stringify(parsed, null, 2) }],
    };
  },
);

server.registerTool(
  "extract_text",
  {
    title: "Extract text from scene",
    description:
      "Return every string from text elements inside a .excalidraw file, one per line.",
    inputSchema: {
      path: z.string().describe("Path to a .excalidraw file"),
    },
  },
  async ({ path }) => {
    const absolutePath = resolveAndValidate(path);
    const raw = await readFile(absolutePath, "utf8");
    const scene = JSON.parse(raw) as { elements?: Array<{ type: string; text?: string }> };
    const texts = (scene.elements ?? [])
      .filter((el) => el.type === "text" && typeof el.text === "string")
      .map((el) => el.text as string);
    return {
      content: [{ type: "text", text: texts.length ? texts.join("\n") : "(no text)" }],
    };
  },
);

server.registerResource(
  "dev-docs-readme",
  "excalidraw://docs/dev-docs-readme",
  {
    title: "Excalidraw dev docs README",
    description: "Returns the contents of dev-docs/README.md from this workspace.",
    mimeType: "text/markdown",
  },
  async (uri) => {
    const text = await readFile(devDocsReadme, "utf8");
    return {
      contents: [{ uri: uri.href, mimeType: "text/markdown", text }],
    };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("excalidraw-scenes MCP listening on stdio");
