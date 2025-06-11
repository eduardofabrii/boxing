# Backend Boxing - Sistema de Autenticação

Este é um backend Spring Boot para sistema de cadastro e login de usuários.

## 🚀 Tecnologias Utilizadas

- **Spring Boot 3.5.0**
- **Spring Data JPA** - Para acesso ao banco de dados
- **Spring Security** - Para autenticação e segurança
- **MySQL** - Banco de dados
- **Maven** - Gerenciamento de dependências

## 📋 Pré-requisitos

- Java 21
- Maven 3.6+
- MySQL Server
- Root MySQL sem senha (conforme solicitado)

## 🔧 Configuração do Banco de Dados

O projeto está configurado para conectar no MySQL com as seguintes configurações:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/boxing_db?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=
```

O banco `boxing_db` será criado automaticamente se não existir.

## 🛠️ Como Executar

### Opção 1: Com H2 (Banco em Memória - Recomendado para testes)
```bash
cd backend/backend
mvn clean compile
mvn spring-boot:run --spring.profiles.active=dev
```

### Opção 2: Com MySQL (Produção)
1. **Inicie o MySQL Server**
2. **Execute:**
   ```bash
   cd backend/backend
   mvn clean compile
   mvn spring-boot:run --spring.profiles.active=prod
   ```

### Opção 3: Usando JAR
```bash
mvn clean package -DskipTests
java -jar target\backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev
```

### ⚠️ Solução de Problemas

**Se aparecer erro "Process terminated with exit code: 1":**
1. **MySQL não está rodando** - Use o perfil `dev` com H2:
   ```bash
   mvn spring-boot:run --spring.profiles.active=dev
   ```
2. **Porta 8080 ocupada** - Mude a porta:
   ```bash
   mvn spring-boot:run --server.port=8081
   ```

4. **A aplicação estará disponível em:**
   ```
   http://localhost:8080
   ```

## 📡 Endpoints da API

### 1. Health Check
```http
GET /api/auth/health
```

### 2. Cadastro de Usuário
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "123456"
}
```

### 3. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "joao@email.com",
  "password": "123456"
}
```

### 4. Buscar Usuário por ID
```http
GET /api/auth/user/{id}
```

## 🧪 Testando as APIs

Execute o arquivo `test_api.bat` para testar todas as funcionalidades:

```bash
test_api.bat
```

Ou use curl manualmente:

### Exemplo de Cadastro:
```bash
curl -X POST "http://localhost:8080/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"João Silva\",\"email\":\"joao@email.com\",\"password\":\"123456\"}"
```

### Exemplo de Login:
```bash
curl -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"joao@email.com\",\"password\":\"123456\"}"
```

## 📊 Estrutura do Projeto

```
src/main/java/com/boxing/backend/
├── config/
│   └── SecurityConfig.java          # Configuração de segurança
├── controller/
│   └── AuthController.java          # Controller de autenticação
├── domain/
│   └── User.java                    # Entidade User
├── dto/
│   ├── AuthResponseDTO.java         # DTO de resposta de auth
│   ├── LoginRequestDTO.java         # DTO de requisição de login
│   ├── RegisterRequestDTO.java      # DTO de requisição de cadastro
│   └── UserResponseDTO.java         # DTO de resposta do usuário
├── exception/
│   └── EmailAlreadyExistsException.java # Exceção personalizada
├── repository/
│   └── UserRepository.java          # Repository JPA
├── service/
│   └── UserService.java             # Service com lógica de negócio
└── BackendApplication.java          # Classe principal
```

## ✅ Funcionalidades Implementadas

- [x] Cadastro de usuário com validação
- [x] Login com verificação de credenciais
- [x] Criptografia de senhas com BCrypt
- [x] Validação de dados de entrada
- [x] Prevenção de emails duplicados
- [x] Configuração do MySQL
- [x] CORS configurado
- [x] API RESTful com JSON

## 🛡️ Segurança

- Senhas são criptografadas usando BCrypt
- CORS configurado para permitir requisições do frontend
- Validação de entrada em todos os endpoints
- Tratamento de exceções personalizado

## 📝 Retornos da API

### Sucesso no Cadastro:
```json
{
  "message": "Usuário cadastrado com sucesso!",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@email.com",
    "createdAt": "2025-06-10T15:30:00"
  },
  "success": true
}
```

### Sucesso no Login:
```json
{
  "message": "Login realizado com sucesso!",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@email.com",
    "createdAt": "2025-06-10T15:30:00"
  },
  "success": true
}
```

### Erro (Email já existe):
```json
{
  "message": "Email já está em uso",
  "user": null,
  "success": false
}
```
