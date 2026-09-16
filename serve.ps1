# Local quiz server — uses built-in Windows PowerShell (no Python/Go install needed).
$ErrorActionPreference = "Stop"
$Root = (Resolve-Path (Split-Path -Parent $MyInvocation.MyCommand.Path)).Path
$BindHost = "127.0.0.1"
$Port = 8765
$BaseUrl = "http://${BindHost}:${Port}/quiz/"

function Get-MimeType([string]$Path) {
    switch ([IO.Path]::GetExtension($Path).ToLower()) {
        ".html" { return "text/html; charset=utf-8" }
        ".css"  { return "text/css" }
        ".js"   { return "application/javascript" }
        ".json" { return "application/json" }
        ".mp3"  { return "audio/mpeg" }
        default { return "application/octet-stream" }
    }
}

function Parse-Range([string]$Header, [long]$Size) {
    if (-not $Header -or -not $Header.StartsWith("bytes=")) { return $null }
    $spec = $Header.Substring(6).Split(",")[0].Trim()
    $parts = $spec.Split("-", 2)
    $left = $parts[0]
    $right = if ($parts.Length -gt 1) { $parts[1] } else { "" }
    try {
        if ($left -and $right) {
            $start = [long]$left
            $end = [long]$right
        } elseif ($left) {
            $start = [long]$left
            $end = $Size - 1
        } elseif ($right) {
            $start = [Math]::Max(0, $Size - [long]$right)
            $end = $Size - 1
        } else {
            return $null
        }
    } catch {
        return $null
    }
    if ($start -lt 0 -or $start -ge $Size) { return "bad" }
    $end = [Math]::Min($end, $Size - 1)
    if ($end -lt $start) { return "bad" }
    return @{ Start = $start; End = $end }
}

function Send-File($Context, [string]$FullPath) {
    $req = $Context.Request
    $res = $Context.Response
    $size = (Get-Item -LiteralPath $FullPath).Length
    $range = Parse-Range $req.Headers["Range"] $size

    if ($range -eq "bad") {
        $res.StatusCode = 416
        $res.Close()
        return
    }

    $start = 0
    $length = $size
    if ($range) {
        $start = $range.Start
        $length = $range.End - $range.Start + 1
        $res.StatusCode = 206
        $res.AddHeader("Content-Range", "bytes $start-$($range.End)/$size")
    } else {
        $res.StatusCode = 200
    }

    $res.ContentType = Get-MimeType $FullPath
    $res.ContentLength64 = $length
    $res.AddHeader("Accept-Ranges", "bytes")

    $buffer = New-Object byte[] 65536
    $stream = [IO.File]::OpenRead($FullPath)
    try {
        [void]$stream.Seek($start, [IO.SeekOrigin]::Begin)
        $remaining = $length
        $output = $res.OutputStream
        while ($remaining -gt 0) {
            $read = $stream.Read($buffer, 0, [Math]::Min($buffer.Length, $remaining))
            if ($read -le 0) { break }
            $output.Write($buffer, 0, $read)
            $remaining -= $read
        }
    } finally {
        $stream.Close()
    }
    $res.Close()
}

function Handle-Request($Context) {
    $path = [System.Uri]::UnescapeDataString($Context.Request.Url.AbsolutePath)
    $path = $path.TrimStart("/").Replace("/", [IO.Path]::DirectorySeparatorChar)
    if ([string]::IsNullOrWhiteSpace($path)) { $path = "quiz/index.html" }
    if ($path.EndsWith([IO.Path]::DirectorySeparatorChar)) { $path += "index.html" }

    $full = [IO.Path]::GetFullPath((Join-Path $Root $path))
    if (-not $full.StartsWith($Root, [StringComparison]::OrdinalIgnoreCase)) {
        $Context.Response.StatusCode = 403
        $Context.Response.Close()
        return
    }
    if (-not (Test-Path -LiteralPath $full -PathType Leaf)) {
        $Context.Response.StatusCode = 404
        $Context.Response.Close()
        return
    }
    Send-File $Context $full
}

Write-Host "Quiz: $BaseUrl"
Write-Host "Press Ctrl+C to stop."

Start-Job -ScriptBlock {
    param($Url)
    Start-Sleep -Milliseconds 500
    Start-Process $Url
} -ArgumentList $BaseUrl | Out-Null

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://${BindHost}:${Port}/")
$listener.Start()

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        try {
            Handle-Request $context
        } catch {
            try {
                $context.Response.StatusCode = 500
                $context.Response.Close()
            } catch {}
        }
    }
} finally {
    $listener.Stop()
}
