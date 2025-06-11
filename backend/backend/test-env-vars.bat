@echo off
echo ==========================================
echo TESTE DAS VARIAVEIS DE AMBIENTE
echo BOXING BACKEND
echo ==========================================

echo.
echo 🧪 TESTANDO CONFIGURACAO COM H2 (Banco em Memoria)

REM Configurar variaveis para H2
set DB_URL=jdbc:h2:mem:boxing_test
set DB_USERNAME=sa
set DB_PASSWORD=
set DB_DRIVER=org.h2.Driver
set JPA_DDL_AUTO=create-drop
set JPA_SHOW_SQL=true
set SERVER_PORT=8080

echo.
echo ✅ Variaveis configuradas:
echo    DB_URL = %DB_URL%
echo    DB_USERNAME = %DB_USERNAME%
echo    DB_DRIVER = %DB_DRIVER%
echo    JPA_DDL_AUTO = %JPA_DDL_AUTO%
echo    SERVER_PORT = %SERVER_PORT%

echo.
echo 🚀 Iniciando aplicacao com variaveis de ambiente...
echo    (A aplicacao deve usar as variaveis configuradas)

timeout /t 3

mvn spring-boot:run -Dspring-boot.run.profiles=dev

pause
