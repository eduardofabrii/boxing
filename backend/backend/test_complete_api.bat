@echo off
echo ===========================================
echo TESTE COMPLETO DAS APIS - BOXING BACKEND
echo ===========================================
echo Data: %date% %time%

echo.
echo 1. HEALTH CHECK...
curl -X GET "http://localhost:8080/api/auth/health"

echo.
echo.
echo 2. CADASTRO DE USUARIO 1...
curl -X POST "http://localhost:8080/api/auth/register" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"João Silva\",\"email\":\"joao@teste.com\",\"password\":\"123456\"}"

echo.
echo.
echo 3. CADASTRO DE USUARIO 2...
curl -X POST "http://localhost:8080/api/auth/register" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Maria Santos\",\"email\":\"maria@teste.com\",\"password\":\"senha123\"}"

echo.
echo.
echo 4. LOGIN COM USUARIO 1...
curl -X POST "http://localhost:8080/api/auth/login" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"joao@teste.com\",\"password\":\"123456\"}"

echo.
echo.
echo 5. LOGIN COM USUARIO 2...
curl -X POST "http://localhost:8080/api/auth/login" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"maria@teste.com\",\"password\":\"senha123\"}"

echo.
echo.
echo 6. LISTAGEM DE TODOS OS USUARIOS...
curl -X GET "http://localhost:8080/api/auth/users"

echo.
echo.
echo 7. BUSCAR USUARIO POR ID (ID=1)...
curl -X GET "http://localhost:8080/api/auth/user/1"

echo.
echo.
echo 8. BUSCAR USUARIO POR ID (ID=2)...
curl -X GET "http://localhost:8080/api/auth/user/2"

echo.
echo.
echo 9. TESTE DE ERRO - EMAIL DUPLICADO...
curl -X POST "http://localhost:8080/api/auth/register" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Teste Duplicado\",\"email\":\"joao@teste.com\",\"password\":\"123456\"}"

echo.
echo.
echo 10. TESTE DE ERRO - LOGIN INVALIDO...
curl -X POST "http://localhost:8080/api/auth/login" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"joao@teste.com\",\"password\":\"senhaerrada\"}"

echo.
echo.
echo 11. TESTE DE ERRO - USUARIO NAO ENCONTRADO...
curl -X GET "http://localhost:8080/api/auth/user/999"

echo.
echo.
echo ===========================================
echo TODOS OS TESTES CONCLUIDOS!
echo ===========================================
pause
