@echo off
color 0A
echo ==========================================
echo 🚀 BOXING BACKEND - CONFIGURACAO FLEXIVEL
echo ==========================================
echo.

:MENU
echo Escolha uma opcao de configuracao:
echo.
echo [1] Desenvolvimento Local (H2 - Banco em Memoria)
echo [2] Desenvolvimento Local (MySQL)
echo [3] Producao Simulada (MySQL com Variaveis Seguras)
echo [4] Testar Configuracao Atual
echo [5] Sair
echo.
set /p choice="Digite sua opcao (1-5): "

if "%choice%"=="1" goto DEV_H2
if "%choice%"=="2" goto DEV_MYSQL
if "%choice%"=="3" goto PROD_MYSQL
if "%choice%"=="4" goto TEST_CONFIG
if "%choice%"=="5" goto EXIT
goto MENU

:DEV_H2
echo.
echo ==========================================
echo 🧪 CONFIGURACAO: Desenvolvimento com H2
echo ==========================================
set DB_URL=jdbc:h2:mem:boxing_dev
set DB_USERNAME=sa
set DB_PASSWORD=
set DB_DRIVER=org.h2.Driver
set JPA_DDL_AUTO=create-drop
set JPA_SHOW_SQL=true
set SERVER_PORT=8080
echo ✅ H2 configurado! Banco em memoria sera criado automaticamente.
goto START_APP

:DEV_MYSQL
echo.
echo ==========================================
echo 🗄️  CONFIGURACAO: Desenvolvimento com MySQL
echo ==========================================
set DB_URL=jdbc:mysql://localhost:3306/boxing_db?createDatabaseIfNotExist=true^&useSSL=false^&allowPublicKeyRetrieval=true
set DB_USERNAME=root
set DB_PASSWORD=
set DB_DRIVER=com.mysql.cj.jdbc.Driver
set JPA_DDL_AUTO=create-drop
set JPA_SHOW_SQL=true
set SERVER_PORT=8080
echo ✅ MySQL local configurado! Certifique-se que o MySQL esta rodando.
goto START_APP

:PROD_MYSQL
echo.
echo ==========================================
echo 🏭 CONFIGURACAO: Producao Simulada
echo ==========================================
set DB_URL=jdbc:mysql://localhost:3306/boxing_prod?createDatabaseIfNotExist=true^&useSSL=false^&allowPublicKeyRetrieval=true
set DB_USERNAME=boxing_user
set DB_PASSWORD=senha_super_segura_123
set DB_DRIVER=com.mysql.cj.jdbc.Driver
set JPA_DDL_AUTO=update
set JPA_SHOW_SQL=false
set SERVER_PORT=8080
echo ✅ Configuracao de producao aplicada!
echo ⚠️  NOTA: Em producao real, use variaveis de ambiente do sistema!
goto START_APP

:TEST_CONFIG
echo.
echo ==========================================
echo 🔍 CONFIGURACAO ATUAL:
echo ==========================================
echo DB_URL = %DB_URL%
echo DB_USERNAME = %DB_USERNAME%
echo DB_PASSWORD = [%DB_PASSWORD%]
echo DB_DRIVER = %DB_DRIVER%
echo JPA_DDL_AUTO = %JPA_DDL_AUTO%
echo JPA_SHOW_SQL = %JPA_SHOW_SQL%
echo SERVER_PORT = %SERVER_PORT%
echo.
if "%DB_URL%"=="" (
    echo ❌ Nenhuma configuracao encontrada!
    echo Use uma das opcoes do menu para configurar.
) else (
    echo ✅ Configuracao encontrada!
)
echo.
pause
goto MENU

:START_APP
echo.
echo ==========================================
echo 🚀 INICIANDO APLICACAO...
echo ==========================================
echo.
echo Configuracao aplicada:
echo 📍 URL: %DB_URL%
echo 👤 Usuario: %DB_USERNAME%
echo 🗄️  Driver: %DB_DRIVER%
echo 🔧 DDL Auto: %JPA_DDL_AUTO%
echo 🐛 Show SQL: %JPA_SHOW_SQL%
echo 🌐 Porta: %SERVER_PORT%
echo.
echo Aguarde enquanto a aplicacao inicia...
echo.

timeout /t 3

mvn spring-boot:run -Dspring-boot.run.profiles=dev

pause
goto MENU

:EXIT
echo.
echo ==========================================
echo 👋 Ate logo!
echo ==========================================
exit /b 0
