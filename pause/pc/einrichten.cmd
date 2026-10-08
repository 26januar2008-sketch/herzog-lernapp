@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion
title Yggdrasil - Pausen-Erinnerung am PC einrichten

rem ============================================================
rem  Yggdrasil - Pausen-Erinnerung am PC
rem  Legt Aufgaben in der Windows-Aufgabenplanung an. Werktags
rem  oeffnet sich zu den Zeiten unten die App als eigenes Fenster.
rem  Zeiten aendern: Zeile ZEITEN anpassen, Datei neu ausfuehren.
rem ============================================================

set "URL=https://26januar2008-sketch.github.io/herzog-lernapp/pause/"
set "ZEITEN=10:00 12:00 14:30 16:30"
set "TAGE=MON,TUE,WED,THU,FRI"

rem Chrome finden
set "CHROME="
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" set "CHROME=%LocalAppData%\Google\Chrome\Application\chrome.exe"
if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" if "!CHROME!"=="" set "CHROME=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" if "!CHROME!"=="" set "CHROME=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"

if "!CHROME!"=="" (
  echo Kein Chrome oder Edge gefunden. Dann oeffnet sich die App im Standard-Browser.
  set "BEFEHL=cmd /c start \"\" \"%URL%\""
) else (
  echo Browser: !CHROME!
  set "BEFEHL=\"!CHROME!\" --app=%URL% --window-size=460,900"
)

echo.
echo Alte Yggdrasil-Aufgaben entfernen ...
for %%Z in (%ZEITEN%) do (
  set "T=%%Z"
  set "T=!T::=!"
  schtasks /delete /tn "Yggdrasil Pause !T!" /f >nul 2>&1
)

echo Neue Aufgaben anlegen ...
set FEHLER=0
for %%Z in (%ZEITEN%) do (
  set "T=%%Z"
  set "T=!T::=!"
  schtasks /create /tn "Yggdrasil Pause !T!" /tr "!BEFEHL!" /sc weekly /d %TAGE% /st %%Z /f >nul
  if errorlevel 1 (
    echo   FEHLER bei %%Z
    set FEHLER=1
  ) else (
    echo   %%Z  angelegt
  )
)

echo.
if "%FEHLER%"=="0" (
  echo Fertig. Werktags um %ZEITEN% Uhr oeffnet sich Yggdrasil.
  echo Zum Testen: Aufgabenplanung oeffnen ^(taskschd.msc^), Aufgabe "Yggdrasil Pause 1000" rechtsklicken, Ausfuehren.
) else (
  echo Mindestens eine Aufgabe konnte nicht angelegt werden.
  echo Bitte diese Datei mit Rechtsklick "Als Administrator ausfuehren" starten.
)
echo.
pause
