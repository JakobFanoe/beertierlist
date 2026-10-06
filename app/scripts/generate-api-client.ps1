[CmdletBinding()]
param(
  [string]$ApiBaseUrl = $env:REACT_APP_API_BASE_URL
)

$ErrorActionPreference = 'Stop'
if ([string]::IsNullOrWhiteSpace($ApiBaseUrl)) {
  throw 'Set REACT_APP_API_BASE_URL or pass -ApiBaseUrl before generating the client.'
}

$backendRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..\..\services.beertierlist'))
$configPath = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\nswag.json'))

Push-Location $backendRoot
try {
  & dotnet tool run nswag run $configPath "/variables:ApiBaseUrl=$ApiBaseUrl"
  if ($LASTEXITCODE -ne 0) {
    throw "NSwag client generation failed with exit code $LASTEXITCODE."
  }

  $clientPath = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\src\services\api\generatedClient.ts'))
  $clientSource = [System.IO.File]::ReadAllText($clientPath)
  if ($clientSource -notmatch 'constructor\(baseUrl\?: string, http\?:' -or
      $clientSource -notmatch 'this\.baseUrl = baseUrl \?\? "[^"]*";') {
    throw 'The generated client constructor no longer matches the expected NSwag output.'
  }

  $clientSource = $clientSource.Replace('constructor(baseUrl?: string, http?', 'constructor(baseUrl: string, http?')
  $clientSource = [System.Text.RegularExpressions.Regex]::Replace(
    $clientSource,
    'this\.baseUrl = baseUrl \?\? "[^"]*";',
    'this.baseUrl = baseUrl;',
    1
  )
  [System.IO.File]::WriteAllText($clientPath, $clientSource, [System.Text.UTF8Encoding]::new($false))
}
finally {
  Pop-Location
}
