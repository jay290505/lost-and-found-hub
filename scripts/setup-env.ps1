<#
Interactive script to create .env.local (frontend) and backend/.env (backend-only secrets).
It also appends entries to .gitignore to avoid committing these files.

Usage: Open PowerShell in repo root and run:
  .\scripts\setup-env.ps1

This script will prompt for development environment values (API URL and app port).
It will then write .env.local and backend/.env.
#>

function Append-GitIgnoreEntry {
    param(
        [string]$entry
    )
    $gitignore = Join-Path (Get-Location) '.gitignore'
    if (-not (Test-Path $gitignore)) { New-Item -Path $gitignore -ItemType File -Force | Out-Null }
    $content = Get-Content $gitignore -Raw
    if ($content -notmatch [regex]::Escape($entry)) {
        Add-Content -Path $gitignore -Value "`n# local secret files`n$entry"
        Write-Host "Added $entry to .gitignore"
    } else {
        Write-Host "$entry already in .gitignore"
    }
}

Write-Host "This will create / update .env.local and backend/.env with development variables." -ForegroundColor Cyan

# Prompt for API base URL and optional Next dev port
$apiUrl = Read-Host "Enter NEXT_PUBLIC_API_URL (default: http://127.0.0.1:8000)"
if ([string]::IsNullOrWhiteSpace($apiUrl)) { $apiUrl = 'http://127.0.0.1:8000' }
$appPort = Read-Host "Enter NEXT_PUBLIC_APP_PORT (default: 9002)"
if ([string]::IsNullOrWhiteSpace($appPort)) { $appPort = '9002' }

$envLocalPath = Join-Path (Get-Location) '.env.local'
$envLocalContents = @()
$envLocalContents += "NEXT_PUBLIC_API_URL=$apiUrl"
$envLocalContents += "NEXT_PUBLIC_APP_PORT=$appPort"

Set-Content -Path $envLocalPath -Value ($envLocalContents -join "`n") -Force
Write-Host "Wrote $envLocalPath"

$backendEnvPath = Join-Path (Get-Location) 'backend' | ForEach-Object { Join-Path $_ '.env' }
$backendContents = @()
$backendContents += "API_BASE=$apiUrl"

Set-Content -Path $backendEnvPath -Value ($backendContents -join "`n") -Force
Write-Host "Wrote $backendEnvPath"

# Ensure these files are ignored by git
Append-GitIgnoreEntry '.env.local'
Append-GitIgnoreEntry '/backend/.env'

Write-Host "Done. .env.local created for frontend and backend/.env created for server-only settings." -ForegroundColor Green
Write-Host "Remember: do NOT commit these files. They are ignored by .gitignore now." -ForegroundColor Yellow
