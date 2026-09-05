param([int]$Port = 8000)
$root = $PSScriptRoot
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serving $root at http://localhost:$Port/ (concurrent)"

$mime = @{
  ".html"="text/html"; ".css"="text/css"; ".js"="application/javascript";
  ".json"="application/json"; ".svg"="image/svg+xml"; ".png"="image/png";
  ".jpg"="image/jpeg"; ".webp"="image/webp"; ".ico"="image/x-icon"; ".php"="text/plain"; ".mp4"="video/mp4"
}

$runspacePool = [runspacefactory]::CreateRunspacePool(1, 16)
$runspacePool.Open()

function Handle-Request($ctx, $root, $mime) {
  $req = $ctx.Request
  $res = $ctx.Response
  try {
    $path = $req.Url.LocalPath
    if ($path -eq "/") { $path = "/index.html" }
    $filePath = Join-Path $root ($path.TrimStart("/") -replace "/", "\")
    if (Test-Path $filePath -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($filePath)
      $ct = $mime[$ext]
      if (-not $ct) { $ct = "application/octet-stream" }
      $res.ContentType = $ct
      $res.Headers.Add("Cache-Control", "no-cache")
      $fs = [System.IO.File]::OpenRead($filePath)
      $res.ContentLength64 = $fs.Length
      $fs.CopyTo($res.OutputStream)
      $fs.Close()
    } else {
      $res.StatusCode = 404
      $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $path")
      $res.OutputStream.Write($msg, 0, $msg.Length)
    }
  } catch {
  } finally {
    try { $res.OutputStream.Close() } catch {}
  }
}

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $ps = [powershell]::Create()
  $ps.RunspacePool = $runspacePool
  [void]$ps.AddScript(${function:Handle-Request}).AddArgument($ctx).AddArgument($root).AddArgument($mime)
  $ps.BeginInvoke() | Out-Null
}
