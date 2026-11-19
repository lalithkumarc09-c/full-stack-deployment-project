<#
.SYNOPSIS
  Zero-dependency Local HTTP Web Server for NovaCommerce SPA Capstone
#>
param(
  [int]$Port = 8080
)

$rootDir = $PSScriptRoot
if (-not $rootDir) { $rootDir = Get-Location }

$mimeMap = @{
  '.html' = 'text/html; charset=utf-8'
  '.htm'  = 'text/html; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.js'   = 'application/javascript; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.svg'  = 'image/svg+xml'
  '.png'  = 'image/png'
  '.jpg'  = 'image/jpeg'
  '.jpeg' = 'image/jpeg'
  '.ico'  = 'image/x-icon'
  '.txt'  = 'text/plain; charset=utf-8'
}

$listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $Port)
try {
  $listener.Start()
  Write-Host ""
  Write-Host "==========================================================" -ForegroundColor Cyan
  Write-Host "  NovaCommerce Local Development Server" -ForegroundColor Green
  Write-Host "  URL: http://localhost:$Port" -ForegroundColor Yellow
  Write-Host "  Press Ctrl+C to terminate server" -ForegroundColor Gray
  Write-Host "==========================================================" -ForegroundColor Cyan
  Write-Host ""

  # Automatically launch default browser
  Start-Process "http://localhost:$Port"

  while ($true) {
    $client = $listener.AcceptTcpClient()
    $stream = $client.GetStream()
    $reader = New-Object System.IO.StreamReader($stream)

    $requestLine = $reader.ReadLine()
    if ($requestLine) {
      $parts = $requestLine.Split(' ')
      if ($parts.Length -ge 2) {
        $rawPath = $parts[1].Split('?')[0].TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($rawPath) -or $rawPath -eq '/') {
          $rawPath = 'index.html'
        }

        # Normalize relative path
        $localPath = [System.IO.Path]::Combine($rootDir, $rawPath.Replace('/', '\'))

        # SPA Fallback: if not found, serve index.html
        if (-not (Test-Path $localPath) -or (Get-Item $localPath) -is [System.IO.DirectoryInfo]) {
          $localPath = [System.IO.Path]::Combine($rootDir, 'index.html')
        }

        if (Test-Path $localPath) {
          $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
          $mime = if ($mimeMap.ContainsKey($ext)) { $mimeMap[$ext] } else { 'application/octet-stream' }
          $bytes = [System.IO.File]::ReadAllBytes($localPath)

          $header = "HTTP/1.1 200 OK`r`n" +
                    "Content-Type: $mime`r`n" +
                    "Content-Length: $($bytes.Length)`r`n" +
                    "Access-Control-Allow-Origin: *`r`n" +
                    "Connection: close`r`n`r`n"
          
          $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
          $stream.Write($headerBytes, 0, $headerBytes.Length)
          $stream.Write($bytes, 0, $bytes.Length)
        } else {
          $notFound = "HTTP/1.1 404 Not Found`r`nContent-Length: 0`r`nConnection: close`r`n`r`n"
          $nfBytes = [System.Text.Encoding]::ASCII.GetBytes($notFound)
          $stream.Write($nfBytes, 0, $nfBytes.Length)
        }
      }
    }

    $stream.Flush()
    $stream.Close()
    $client.Close()
  }
}
finally {
  $listener.Stop()
  Write-Host "Server stopped." -ForegroundColor Yellow
}
