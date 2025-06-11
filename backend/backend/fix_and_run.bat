@echo off
echo ===========================================
echo SOLUCIONANDO ERRO DO SPRING BOOT
echo ===========================================

echo.
echo 1. Parando processos na porta 8080...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080') do taskkill /f /pid %%a >nul 2>&1

echo.
echo 2. Limpando e compilando projeto...
call mvn clean compile

echo.
echo 3. Executando com H2 (banco em memoria)...
echo Acesse: http://localhost:8080/api/auth/health
echo.
call mvn spring-boot:run -Dspring.profiles.active=dev

pause
