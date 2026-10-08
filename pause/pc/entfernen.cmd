@echo off
title Yggdrasil - Pausen-Erinnerung am PC entfernen
echo Entferne alle Aufgaben "Yggdrasil Pause ..." ...
set N=0
for %%H in (00 01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22 23) do (
  for %%M in (00 05 10 15 20 25 30 35 40 45 50 55) do (
    schtasks /delete /tn "Yggdrasil Pause %%H%%M" /f >nul 2>&1 && echo   entfernt: %%H:%%M && set /a N+=1
  )
)
echo Fertig, %N% Aufgaben entfernt.
pause
