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

### 🌟 **NOVA FUNCIONALIDADE: Variáveis de Ambiente**

O projeto agora suporta configuração via **variáveis de ambiente** para maior flexibilidade e segurança!

#### **Configuração Padrão:**
```properties
DB_URL=jdbc:mysql://localhost:3306/boxing_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true
DB_USERNAME=root
DB_PASSWORD=
```

#### **Variáveis de Ambiente Disponíveis:**
- `DB_URL` - URL do banco de dados
- `DB_USERNAME` - Usuário do banco
- `DB_PASSWORD` - Senha do banco
- `DB_DRIVER` - Driver do banco
- `JPA_DDL_AUTO` - Estratégia do Hibernate (create-drop, update, validate)
- `JPA_SHOW_SQL` - Mostrar SQL no console (true/false)
- `SERVER_PORT` - Porta do servidor (padrão: 8080)

### 📁 **Arquivos de Exemplo:**
- `.env.example` - Documentação completa das variáveis
- `start-with-env.bat` - Script para desenvolvimento
- `start-production.bat` - Script para produção

O banco `boxing_db` será criado automaticamente se não existir.

## 🛠️ Como Executar

### 🚀 **Opção 1: Scripts Automáticos (RECOMENDADO)**

#### **Desenvolvimento:**
```bash
start-with-env.bat
```
Configura automaticamente as variáveis e inicia com H2/MySQL.

#### **Produção:**
```bash
# Configure as variáveis primeiro:
set DB_URL=jdbc:mysql://servidor:3306/boxing_db
set DB_USERNAME=usuario
set DB_PASSWORD=senha

# Execute:
start-production.bat
```

### 🔧 **Opção 2: Manual com H2 (Banco em Memória)**
```bash
cd backend/backend
mvn clean compile
mvn spring-boot:run --spring.profiles.active=dev
```

### 🗄️ **Opção 3: Manual com MySQL**
```bash
# Configure as variáveis de ambiente:
set DB_URL=jdbc:mysql://localhost:3306/boxing_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true
set DB_USERNAME=root
set DB_PASSWORD=

# Execute:
cd backend/backend
mvn clean compile
mvn spring-boot:run --spring.profiles.active=prod
```

### 📦 **Opção 4: Usando JAR**
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
