$ErrorActionPreference = "Stop"

$bunCommand = Get-Command bun.exe -ErrorAction SilentlyContinue | Select-Object -First 1
$bunPath = if ($bunCommand) { $bunCommand.Source } else { $null }

if (-not $bunPath -and $env:LOCALAPPDATA) {
  $wingetBun = Join-Path $env:LOCALAPPDATA "Microsoft\WinGet\Links\bun.exe"
  if (Test-Path -LiteralPath $wingetBun -PathType Leaf) {
    $bunPath = $wingetBun
  }
}

if (-not $bunPath) {
  Write-Error "Smart Rename: Bun not found; install Bun or add it to the Herdr server PATH"
  exit 127
}

& $bunPath @args
exit $LASTEXITCODE
