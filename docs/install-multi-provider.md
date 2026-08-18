# Install the multi-provider branch

These instructions are suitable for a person or an LLM setting up Smart Rename
on another machine.

## Install

Requires Herdr 0.7.0+ and Bun 1.1.34+.

```sh
herdr plugin install ChocoTonic/herdr-tab-smart-rename \
  --ref feat/windows-multi-provider-models -y
herdr plugin action invoke configure-ai --plugin tab-smart-rename
```

On Windows, install Bun with `winget install --id Oven-sh.Bun --exact`. The
plugin launcher also checks WinGet's stable Bun link, so restarting an existing
Herdr server is not required. Use this PowerShell-compatible install command:

```powershell
herdr plugin install ChocoTonic/herdr-tab-smart-rename --ref feat/windows-multi-provider-models -y
herdr plugin action invoke configure-ai --plugin tab-smart-rename
```

The second command opens Herdr's private plugin configuration file:

Run `herdr plugin config-dir tab-smart-rename` to print the exact directory.
The default is `~/.config/herdr/plugins/config/tab-smart-rename` on Unix and
`%APPDATA%\herdr\plugins\config\tab-smart-rename` on Windows. The file name is
`provider.env`.

For DeepSeek as the primary provider, set:

```dotenv
DEEPSEEK_API_KEY=<deepseek-api-key>
SMART_RENAME_PROVIDER=deepseek
SMART_RENAME_TIMEOUT_MS=45000
```

The built-in DeepSeek profile supplies `https://api.deepseek.com` and
`deepseek-v4-flash`. Add `OPENAI_API_KEY=<openai-api-key>` to the same file if
OpenAI should also be available as another selection. Credentials belong only
in this private config file; do not add them to the cloned plugin repository.

## Validate and start

```sh
herdr plugin action invoke check-ai --plugin tab-smart-rename
herdr plugin action invoke start --plugin tab-smart-rename
herdr plugin action invoke status --plugin tab-smart-rename
```

`check-ai` should report `deepseek/deepseek-v4-flash`. Herdr actions run
asynchronously, so inspect failures with:

```sh
herdr plugin log list --plugin tab-smart-rename --limit 10
```

The DeepSeek profile disables thinking mode for these short JSON naming
requests, keeping responses within the configured timeout.

The provider file is reloaded before every model request. Switching later only
requires changing `SMART_RENAME_PROVIDER` to `openai`, `anthropic`, `claude`, or
`deepseek`; restart is unnecessary.
