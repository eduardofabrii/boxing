@echo off
echo ==========================================
echo CONFIGURACAO PRODUCAO - BOXING BACKEND
echo ==========================================

echo.
echo ⚠️  CONFIGURACAO DE PRODUCAO
echo    Configure as variaveis de ambiente antes de executar!

echo.
echo Exemplo de configuracao para producao:
echo.
echo set DB_URL=jdbc:mysql://seu-servidor:3306/boxing_db
echo set DB_USERNAME=seu_usuario
echo set DB_PASSWORD=sua_senha_segura
echo set JPA_DDL_AUTO=update
echo set JPA_SHOW_SQL=false
echo set SERVER_PORT=8080

echo.
echo ==========================================
echo VERIFICANDO VARIAVEIS OBRIGATORIAS...
echo ==========================================

if "%DB_URL%"=="" (
    echo ❌ ERRO: DB_URL nao configurada!
    echo Configure: set DB_URL=jdbc:mysql://servidor:3306/banco
    pause
    exit /b 1
)

if "%DB_USERNAME%"=="" (
    echo ❌ ERRO: DB_USERNAME nao configurada!
    echo Configure: set DB_USERNAME=seu_usuario
    pause
    exit /b 1
)

echo ✅ DB_URL: %DB_URL%
echo ✅ DB_USERNAME: %DB_USERNAME%
echo ✅ DB_PASSWORD: [CONFIGURADA]

echo.
echo ==========================================
echo INICIANDO EM MODO PRODUCAO...
echo ==========================================

mvn clean package -DskipTests
java -jar target\backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod

pause
