@echo off
chcp 65001 >nul
title Pujant Àlgebra a GitHub (fanyballesteros/algebra)...
set PATH=%LOCALAPPDATA%\Programs\MinGit\cmd;%LOCALAPPDATA%\Programs\MinGit\mingw64\bin;%PATH%

echo ===================================================================
echo   📐 PUJADA DEL WEB SITES D'ÀLGEBRA A GITHUB
echo   Repositori: https://github.com/fanyballesteros/algebra.git
echo ===================================================================
echo.
echo Si se t'obre una finestra del navegador, inicia sessió amb el teu compte
echo de GitHub 'fanyballesteros' per autoritzar la pujada.
echo.

git push -u origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo ===================================================================
    echo  ✨ EXCEL·LENT! TOT EL CODI S'HA PUJAT AMB ÈXIT AL TEU GITHUB!
    echo ===================================================================
    echo.
    echo Ara només cal que activis GitHub Pages:
    echo 1. Obre: https://github.com/fanyballesteros/algebra/settings/pages
    echo 2. A 'Branch', tria 'main' i carpeta '/ (root)'
    echo 3. Clica 'Save'. En 1 minut la web estarà en línia a:
    echo    https://fanyballesteros.github.io/algebra/
    echo ===================================================================
) else (
    echo ⚠️ Hi ha hagut un problema amb l'autenticació o la connexió.
)

echo.
pause
