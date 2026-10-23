# ==============================================================================
# ARSelNel Supabase Windows PowerShell Backup Script
# Comprehensive pre-migration backup for PostgreSQL data and Storage media.
#
# Usage:
#   .\scripts\backup_supabase.ps1 [-SupabaseUrl "https://xxx.supabase.co"] [-ApiKey "ey..."] [-OutputDir "backups\pre_migration"]
#
# Note:
#   Secrets passed as parameters or environment variables are NOT logged or echoed.
# ==============================================================================

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$SupabaseUrl = $env:SUPABASE_URL,

    [Parameter(Mandatory=$false)]
    [string]$ApiKey = $env:SUPABASE_SERVICE_ROLE_KEY,

    [Parameter(Mandatory=$false)]
    [string]$OutputDir = ""
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " ARSelNel Supabase Migration Backup (PowerShell Specialist)" -ForegroundColor Cyan
Write-Host " Mode: READ-ONLY AUDIT & BACKUP" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Set default output directory if not provided
if (-not $OutputDir) {
    $Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $OutputDir = Join-Path $PSScriptRoot "..\backups\arselnel_backup_$Timestamp"
}

# Ensure directory exists
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$OutputDirFull = (Resolve-Path $OutputDir).Path
Write-Host "Backup Destination Directory: $OutputDirFull" -ForegroundColor Yellow

# Fallback to reading URL & anon key from assets/js/supabase-client.js if not supplied
if (-not $SupabaseUrl -or -not $ApiKey) {
    $ClientConfigFile = Join-Path $PSScriptRoot "..\assets\js\supabase-client.js"
    if (Test-Path $ClientConfigFile) {
        $ConfigContent = Get-Content $ClientConfigFile -Raw
        if (-not $SupabaseUrl -and $ConfigContent -match "url:\s*['""](https://[^'""]+)['""]") {
            $SupabaseUrl = $Matches[1]
        }
        if (-not $ApiKey -and $ConfigContent -match "(?:publishableKey|anonKey|key):\s*['""]([^'""]+)['""]") {
            $ApiKey = $Matches[1]
        }
    }
}

if (-not $SupabaseUrl -or -not $ApiKey) {
    Write-Error "Supabase URL and API Key could not be located. Provide them via -SupabaseUrl and -ApiKey."
}

Write-Host "Target Supabase Host: $SupabaseUrl" -ForegroundColor Green
Write-Host "API Key Authenticated: [PRESENT, REDACTED FOR SECURITY]" -ForegroundColor Green

# Run Node.js backup engine
$NodeScript = Join-Path $PSScriptRoot "backup_supabase.js"
Write-Host "`nExecuting automated table and binary storage backup..." -ForegroundColor Cyan

& node $NodeScript --url "$SupabaseUrl" --key "$ApiKey" --out "$OutputDirFull"

# Verification Step
$ManifestFile = Join-Path $OutputDirFull "backup_manifest.json"
if (-not (Test-Path $ManifestFile)) {
    Write-Error "BACKUP VERIFICATION FAILED: Manifest file was not created!"
}

$ManifestContent = Get-Content $ManifestFile -Raw | ConvertFrom-Json

Write-Host "`n================ VERIFICATION SUMMARY ================" -ForegroundColor Cyan
Write-Host "Manifest Status : $($ManifestContent.status)" -ForegroundColor $(if ($ManifestContent.status -like "*SUCCESS*") { "Green" } else { "Yellow" })
Write-Host "Tables Backed Up: $($ManifestContent.totalTablesBackedUp)" -ForegroundColor Green
Write-Host "Storage Files   : $($ManifestContent.totalStorageFilesBackedUp)" -ForegroundColor Green

# Check each table backup file
$DbDir = Join-Path $OutputDirFull "database"
$EmptyFiles = @()
Get-ChildItem -Path $DbDir -Filter "*.json" | ForEach-Object {
    if ($_.Length -eq 0) {
        $EmptyFiles += $_.Name
    } else {
        Write-Host "  [OK] $($_.Name) ($($_.Length) bytes)" -ForegroundColor Gray
    }
}

if ($EmptyFiles.Count -gt 0) {
    Write-Error "CRITICAL: The following backup files are empty: $($EmptyFiles -join ', ')"
} else {
    Write-Host "`nALL BACKUP FILES VERIFIED NON-EMPTY AND PRESENT." -ForegroundColor Green
    Write-Host "Backup Location: $OutputDirFull" -ForegroundColor Green
}
Write-Host "==========================================================" -ForegroundColor Cyan
