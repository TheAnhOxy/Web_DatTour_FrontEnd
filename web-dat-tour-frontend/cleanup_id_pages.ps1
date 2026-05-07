$files = @(
    'app\tours\[id]\page.tsx',
    'app\booking\[id]\page.tsx'
)

foreach ($rel in $files) {
    $path = Join-Path (Get-Location) $rel
    if (-not (Test-Path -LiteralPath $path)) {
        Write-Host "Not found: $path"
        continue
    }

    $content = [System.IO.File]::ReadAllText($path)

    # Remove header
    $content = [regex]::Replace($content, '(?s)\r?\n?\s*<header\b[^>]*>.*?</header>', '')

    # Remove footer
    $content = [regex]::Replace($content, '(?s)\r?\n?\s*<footer\b[^>]*>.*?</footer>', '')

    # Remove <div className="page-wrapper">
    $content = $content -replace '<div className="page-wrapper">', '<>'

    # Replace the last </div> before ); with </>
    $content = [regex]::Replace($content, '(?m)(\s*</div>)(\s*\n\s*\);\s*\n\s*\})', "`n    </>`$2")

    [System.IO.File]::WriteAllText($path, $content)
    Write-Host "Processed: $rel"
}
Write-Host "Done!"
