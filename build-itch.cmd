@echo off
setlocal EnableExtensions

rem Package an existing game build as an itch.io-ready ZIP.
rem Usage: build-itch.cmd [build-folder] [output-zip]
rem Paths are resolved relative to this script.

set "SCRIPT_DIR=%~dp0"
pushd "%SCRIPT_DIR%" >nul || (
    echo [ERROR] Cannot open the project directory.
    exit /b 1
)

if /i "%~1"=="--help" goto :help
if /i "%~1"=="-h" goto :help

set "BUILD_DIR=%~1"
set "OUTPUT_ZIP=%~2"

rem When run without arguments, try common web-game export folders.
if not defined BUILD_DIR for %%D in (
    "dist"
    "build\web"
    "build\WebGL"
    "Builds\WebGL"
    "WebGLBuild"
    "export\web"
    "www"
    "build"
) do if not defined BUILD_DIR if exist "%%~D\" set "BUILD_DIR=%%~D"

if not defined BUILD_DIR (
    echo [ERROR] No game build folder was found.
    echo.
    echo Export/build the game first, then run:
    echo   build-itch.cmd "path\to\game-build"
    echo.
    echo Example:
    echo   build-itch.cmd "Builds\WebGL" "release\superidol-itch.zip"
    popd >nul
    exit /b 2
)

for %%I in ("%BUILD_DIR%") do set "BUILD_DIR=%%~fI"

if not exist "%BUILD_DIR%\" (
    echo [ERROR] Build folder does not exist: "%BUILD_DIR%"
    popd >nul
    exit /b 3
)

if not defined OUTPUT_ZIP (
    for %%I in ("%SCRIPT_DIR:~0,-1%") do set "GAME_NAME=%%~nxI"
    set "OUTPUT_ZIP=release\%GAME_NAME%-itch.zip"
)
for %%I in ("%OUTPUT_ZIP%") do set "OUTPUT_ZIP=%%~fI"

where powershell.exe >nul 2>&1 || (
    echo [ERROR] Windows PowerShell is required to create the ZIP.
    popd >nul
    exit /b 4
)

echo Packaging "%BUILD_DIR%"...
set "ITCH_SOURCE=%BUILD_DIR%"
set "ITCH_OUTPUT=%OUTPUT_ZIP%"

powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -Command ^
    "$ErrorActionPreference = 'Stop';" ^
    "Add-Type -AssemblyName System.IO.Compression.FileSystem;" ^
    "$source = [IO.Path]::GetFullPath($env:ITCH_SOURCE);" ^
    "$output = [IO.Path]::GetFullPath($env:ITCH_OUTPUT);" ^
    "$parent = [IO.Path]::GetDirectoryName($output);" ^
    "[IO.Directory]::CreateDirectory($parent) | Out-Null;" ^
    "$tempZip = Join-Path ([IO.Path]::GetTempPath()) (([IO.Path]::GetRandomFileName()) + '.zip');" ^
    "try {" ^
    "  [IO.Compression.ZipFile]::CreateFromDirectory($source, $tempZip, [IO.Compression.CompressionLevel]::Optimal, $false);" ^
    "  $archive = [IO.Compression.ZipFile]::OpenRead($tempZip);" ^
    "  try {" ^
    "    $files = @($archive.Entries | Where-Object { $_.Name });" ^
    "    $fileCount = $files.Count;" ^
    "    $hasRootIndex = @($files | Where-Object { $_.FullName -ieq 'index.html' }).Count -gt 0;" ^
    "  } finally { $archive.Dispose() }" ^
    "  [IO.File]::Copy($tempZip, $output, $true);" ^
    "  $size = (Get-Item -LiteralPath $output).Length;" ^
    "  Write-Host ('[OK] Created: ' + $output);" ^
    "  Write-Host ('[OK] Files: ' + $fileCount + '  Size: ' + $size + ' bytes');" ^
    "  if (-not $hasRootIndex) { Write-Warning 'No index.html at the ZIP root. This is fine for downloadable games; an itch.io HTML game requires it.' }" ^
    "} finally { if (Test-Path -LiteralPath $tempZip) { Remove-Item -LiteralPath $tempZip -Force } }"

if errorlevel 1 (
    echo [ERROR] Packaging failed.
    popd >nul
    exit /b 5
)

echo Upload this ZIP to the itch.io project page.
popd >nul
exit /b 0

:help
echo Usage: build-itch.cmd [build-folder] [output-zip]
echo.
echo With no arguments, the script searches common export folders and writes:
echo   release\superidol-itch.zip
echo.
echo For an itch.io HTML game, index.html must be at the build folder root.
popd >nul
exit /b 0
