@echo off
echo ==========================================
echo CONFIGURADOR DE SENHA MYSQL
echo ==========================================
echo.
echo Este script ajuda a configurar a senha do MySQL
echo para o projeto Boxing Backend.
echo.
set /p senha="Digite a senha do MySQL (root): "

echo.
echo Testando conexão com MySQL...
mysql -u root -p%senha% -e "SELECT 1;" >nul 2>&1
if %errorlevel% == 0 (
    echo ✓ Conexão bem-sucedida!
    echo.
    echo Criando banco boxing...
    mysql -u root -p%senha% -e "CREATE DATABASE IF NOT EXISTS boxing CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    echo ✓ Banco boxing criado/verificado
    echo.
    echo Configurando application.properties...
    
    rem Criar arquivo temporário com nova configuração
    echo spring.application.name=backend > temp_config.txt
    echo. >> temp_config.txt
    echo # ^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^= >> temp_config.txt
    echo # CONFIGURAÇÃO MYSQL ^(ÚNICA^) >> temp_config.txt
    echo # ^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^= >> temp_config.txt
    echo. >> temp_config.txt
    echo # Configuração do banco MySQL >> temp_config.txt
    echo spring.datasource.url=jdbc:mysql://localhost:3306/boxing?createDatabaseIfNotExist=true^&useSSL=false^&serverTimezone=UTC^&allowPublicKeyRetrieval=true >> temp_config.txt
    echo spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver >> temp_config.txt
    echo spring.datasource.username=root >> temp_config.txt
    echo spring.datasource.password=%senha% >> temp_config.txt
    echo. >> temp_config.txt
    echo # Pool de conexões >> temp_config.txt
    echo spring.datasource.hikari.maximum-pool-size=10 >> temp_config.txt
    echo spring.datasource.hikari.minimum-idle=5 >> temp_config.txt
    echo spring.datasource.hikari.connection-timeout=30000 >> temp_config.txt
    echo. >> temp_config.txt
    echo # Configuração do JPA/Hibernate para MySQL >> temp_config.txt
    echo spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect >> temp_config.txt
    echo spring.jpa.hibernate.ddl-auto=create-drop >> temp_config.txt
    echo spring.jpa.show-sql=true >> temp_config.txt
    echo spring.jpa.properties.hibernate.format_sql=true >> temp_config.txt
    echo spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect >> temp_config.txt
    echo. >> temp_config.txt
    echo # Configuração de encoding UTF-8 >> temp_config.txt
    echo spring.jpa.properties.hibernate.connection.characterEncoding=utf8 >> temp_config.txt
    echo spring.jpa.properties.hibernate.connection.CharSet=utf8 >> temp_config.txt
    echo spring.jpa.properties.hibernate.connection.useUnicode=true >> temp_config.txt
    echo. >> temp_config.txt
    echo # Configuração do servidor >> temp_config.txt
    echo server.port=8080 >> temp_config.txt
    echo. >> temp_config.txt
    echo # JWT Secret Key >> temp_config.txt
    echo jwt.secret=mySecretKeyThatIsLongEnoughForHS256AlgorithmSecurity123456789 >> temp_config.txt
    echo jwt.expiration=86400000 >> temp_config.txt
    
    rem Substituir arquivo original
    move temp_config.txt src\main\resources\application.properties > nul
    
    echo ✓ Arquivo application.properties configurado com sua senha
    echo.
    echo ==========================================
    echo CONFIGURAÇÃO CONCLUÍDA!
    echo ==========================================
    echo Agora você pode executar o projeto:
    echo   mvn spring-boot:run
    echo.
    echo Ou usar o script:
    echo   run-backend.bat
    echo ==========================================
) else (
    echo ✗ Falha na conexão. Verifique a senha do MySQL.
    echo.
    echo Senhas comuns para testar:
    echo - root
    echo - mysql
    echo - admin
    echo - 123456
    echo - (senha vazia)
    echo.
    echo Se não souber a senha, reinstale o MySQL ou redefina a senha.
)
echo.
pause
