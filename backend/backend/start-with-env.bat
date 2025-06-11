@echo off
echo ==========================================
echo CONFIGURACAO DE VARIAVEIS DE AMBIENTE
echo BOXING BACKEND - BANCO DE DADOS
echo ==========================================

echo.
echo Configurando variaveis de ambiente para o banco de dados...

REM Configuracoes de Desenvolvimento (MySQL Local)
set DB_URL=jdbc:mysql://localhost:3306/boxing_db?createDatabaseIfNotExist=true^&useSSL=false^&allowPublicKeyRetrieval=true
set DB_USERNAME=root
set DB_PASSWORD=
set DB_DRIVER=com.mysql.cj.jdbc.Driver

REM Configuracoes JPA
set JPA_DDL_AUTO=create-drop
set JPA_SHOW_SQL=true
set JPA_FORMAT_SQL=true

REM Configuracoes do Servidor
set SERVER_PORT=8080

REM Configuracoes de Log
set LOG_LEVEL_SECURITY=DEBUG
set LOG_LEVEL_HIBERNATE=INFO
set LOG_LEVEL_APP=DEBUG

echo.
echo ✅ Variaveis configuradas:
echo    DB_URL=%DB_URL%
echo    DB_USERNAME=%DB_USERNAME%
echo    DB_PASSWORD=[HIDDEN]
echo    JPA_DDL_AUTO=%JPA_DDL_AUTO%
echo    SERVER_PORT=%SERVER_PORT%

echo.
echo ==========================================
echo INICIANDO APLICACAO...
echo ==========================================

mvn spring-boot:run -Dspring-boot.run.profiles=dev

pause
