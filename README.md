<p align="center">
  <img src="assets/herdr-tab-smart-rename-banner.png" width="720" alt="Pixel wand renaming a terminal tab">
</p>

<h1 align="center">herdr-tab-smart-rename</h1>

<p align="center"><strong>Tabs that say what the work is.</strong></p>

Smart Rename turns numbered Herdr tabs into short task labels. Known processes get instant names such as `Run Tests`, `Dev Server`, and `View Logs`; ambiguous work uses an OpenAI-compatible model. Manual names always win.

## Demo

https://github.com/user-attachments/assets/c9d12c33-e458-4a29-986c-c403d64aff02

## Quick start

Requires Herdr 0.7.0+ and Bun 1.1.34+.

```sh
herdr plugin install iurysza/herdr-tab-smart-rename
herdr plugin action invoke configure-ai --plugin tab-smart-rename
herdr plugin action invoke check-ai --plugin tab-smart-rename
herdr plugin action invoke start --plugin tab-smart-rename
```

For the unpublished multi-provider branch, see
[Install the multi-provider branch](docs/install-multi-provider.md).

`configure-ai` opens `~/.config/herdr/plugins/config/tab-smart-rename/provider.env`. For the default OpenAI GPT-5.6 Luna setup, add:

```dotenv
OPENAI_API_KEY=...
```

Without a key, deterministic names still work.

## Keybindings

```toml
[[keys.command]]
key = "prefix+t"
type = "plugin_action"
command = "tab-smart-rename.rename-now"
description = "smart rename current tab"

[[keys.command]]
key = "prefix+alt+t"
type = "plugin_action"
command = "tab-smart-rename.rename-all"
description = "force smart rename all tabs"
```

Every explicit rename ends with a notification: renamed, not renamed, or failed. During a model-backed current-tab rename, a diamond pulse appears before its label.

## Actions

| Action | Effect |
| --- | --- |
| `rename-now` | Rename the current tab |
| `rename-all` | Rename every tab |
| `reset-tab` | Return the current tab to automatic naming |
| `reset-workspace` | Return the workspace to automatic naming |
| `configure-ai` | Edit provider settings |
| `configure-prompt` | Edit naming instructions |
| `check-ai` | Validate config without calling the provider |
| `start` / `stop` / `status` | Control the worker |

```sh
herdr plugin action invoke <action> --plugin tab-smart-rename
```

## Naming behavior

Smart Rename uses one dominant pane: focused agent, another active agent, focused command, then first pane. Supporting servers and logs never replace an active agent's task.

Labels use 2–4 Title Case words, stay under 30 characters, and describe the task—not its tool, model, or project. Weak evidence produces no rename. Manual labels remain locked until reset or explicit rename.

See the [naming policy](docs/naming-policy.md) for the full contract.

## Configuration

The generated [`provider.env.example`](provider.env.example) selects OpenAI. Its built-in profile supplies the endpoint, model, and reasoning defaults shown here:

```dotenv
SMART_RENAME_PROVIDER=openai
SMART_RENAME_BASE_URL=https://api.openai.com/v1
SMART_RENAME_MODEL=gpt-5.6-luna
SMART_RENAME_REASONING_EFFORT=medium
SMART_RENAME_TIMEOUT_MS=45000
```

Named OpenAI, Anthropic/Claude, and DeepSeek profiles include endpoint and model defaults. Pick one and add its normal key:

```dotenv
# Claude (native Anthropic Messages API)
SMART_RENAME_PROVIDER=anthropic
ANTHROPIC_API_KEY=...

# Or DeepSeek (OpenAI-compatible API)
SMART_RENAME_PROVIDER=deepseek
DEEPSEEK_API_KEY=...
```

`claude` is accepted as an alias for `anthropic`. Because older generated config files contain explicit OpenAI values, remove or update `SMART_RENAME_BASE_URL`, `SMART_RENAME_MODEL`, and `SMART_RENAME_REASONING_EFFORT` when switching an existing installation. New provider-specific defaults apply wherever those fields are absent.

For any other OpenAI-compatible service, set `SMART_RENAME_PROVIDER`, `SMART_RENAME_BASE_URL`, `SMART_RENAME_MODEL`, and `SMART_RENAME_API_KEY`. Kimi's `KIMI_API_KEY` is also recognized for the `kimi-code` provider. Config reloads before every model request.

### Custom prompt

The default system prompt is [`docs/naming-policy.md`](docs/naming-policy.md). Create a private editable copy with:

```sh
herdr plugin action invoke configure-prompt --plugin tab-smart-rename
```

It opens `~/.config/herdr/plugins/config/tab-smart-rename/naming-prompt.md`. A prompt can be this small:

```md
Name the current persistent task in 2–4 Title Case words.
Omit project, app, agent, and model names.
Return JSON only: {"tab":"Assess Python Migration","reason":"Current task."}
If unclear: {"tab":null,"reason":"no meaningful task"}
```

Set `SMART_RENAME_PROMPT_PATH` to use another file. Prompts reload per request; built-in JSON and label validation still applies.

## Privacy

Model requests contain bounded, sanitized evidence from the dominant pane. Pi panes may contribute short user-request excerpts; sibling panes contribute process summaries only. Smart Rename removes terminal formatting, common secret shapes, and the local home path before sending context.

Provider keys stay in Herdr's private plugin config and never enter Smart Rename state or logs.

## Troubleshooting

- Worker stopped: `herdr plugin action invoke start --plugin tab-smart-rename`
- Config invalid: run `configure-ai`, then `check-ai`.
- Authentication fails: ensure the key matches the configured endpoint and model; `check-ai` does not make an API request.
- Bun is outside Herdr's server `PATH`: runtime actions also check standard Bun and Homebrew locations.
- Manual label stays: use `reset-tab` or an explicit rename.
- Logs: `herdr plugin log list --plugin tab-smart-rename --limit 10`

## Documentation

- [Naming policy](docs/naming-policy.md)
- [Semantic map](ai-artifacts/SEMANTIC_MAP.md)
- [Architecture](ai-artifacts/ARCHITECTURE.md)
