# Script to replace fetch with apiFetch

$files = @(
    "frontend\src\components\ProjectList.tsx",
    "frontend\src\components\ProjectProgressList.tsx",
    "frontend\src\components\TeamManagementSidebar.tsx",
    "frontend\src\components\TaskBoard.tsx",
    "frontend\src\components\UpcomingDeadlines.tsx",
    "frontend\src\pages\TeamsPage.tsx",
    "frontend\src\pages\CalendarPage.tsx",
    "frontend\src\components\settings\ProfileSettings.tsx",
    "frontend\src\components\settings\SecuritySettings.tsx",
    "frontend\src\components\settings\DataPrivacySettings.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        
        # Replace fetch calls
        $content = $content -replace "await fetch\('/api", "await apiFetch('/api"
        $content = $content -replace "fetch\('/api", "apiFetch('/api"
        
        # Add import if not present  
        if ($content -notmatch "apiFetch") {
            $lines = $content -split "`n"
            $importAdded = $false
            for ($i = 0; $i -lt $lines.Count; $i++) {
                if ($lines[$i] -match "^import.*from.*react" -and -not $importAdded) {
                    $lines[$i] = $lines[$i] + "`nimport { apiFetch } from '../config/apiFetch';"
                    $importAdded = $true
                    break
                }
            }
            $content = $lines -join "`n"
        }
        
        Set-Content $file $content -NoNewline
        Write-Host "✅ Updated: $file"
    } else {
        Write-Host "❌ Not found: $file"
    }
}

Write-Host "`n🎉 Done!"
