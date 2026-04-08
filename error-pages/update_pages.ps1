$PagesDir = Join-Path $PSScriptRoot "html_files"

Get-ChildItem -Path $PagesDir -File | Where-Object { $_.Name -ne ".gitkeep" } | ForEach-Object {
    Write-Host "Uploading $($_.Name)..."
    npx wrangler kv key put --binding=error_pages --remote $_.Name --path $_.FullName
}

Write-Host "Done."
