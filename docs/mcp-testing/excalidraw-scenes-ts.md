# MCP Test: excalidraw-scenes-ts

### Prompt
"Use the `excalidraw-scenes-ts` MCP to list `.excalidraw` files in `examples/`, then read the first file and extract all text labels from it."

### Result WITH MCP (enabled)
- Tools called: `list_scenes(dir="examples")`, `read_scene(path="<first-scene>.excalidraw")`, `extract_text(path="<first-scene>.excalidraw")`
- Output summary: The agent returned a concrete list of scene files, parsed a real scene JSON document, and extracted actual text labels from scene elements in one flow.

### Result WITHOUT MCP (disabled: true, or removed from .cursor/mcp.json)
- Tools available: only generic workspace tools (search/read/edit/shell), no scene-aware MCP tools.
- Output summary: The agent had to manually locate candidate files, open raw JSON, and craft ad-hoc extraction logic in chat. The result was slower and easier to get wrong when scene schema details changed.

### Conclusion
`excalidraw-scenes-ts` provides schema-aware, task-focused primitives that reduce prompt complexity and failure modes. The MCP materially improves reliability by enforcing scoped file access and exposing purpose-built tools/resources instead of relying on repeated manual parsing steps.
