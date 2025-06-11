# 🔧 GUIA COMPLETO DE VARIÁVEIS DE AMBIENTE
## Boxing Backend - Spring Boot

### 📋 **VARIÁVEIS OBRIGATÓRIAS**

| Variável | Descrição | Exemplo | Padrão |
|----------|-----------|---------|--------|
| `DB_URL` | URL completa do banco de dados | `jdbc:mysql://localhost:3306/boxing_db` | MySQL local |
| `DB_USERNAME` | Usuário do banco de dados | `root` ou `boxing_user` | `root` |
| `DB_PASSWORD` | Senha do banco de dados | `minha_senha_123` | *(vazio)* |
| `DB_DRIVER` | Driver JDBC do banco | `com.mysql.cj.jdbc.Driver` | MySQL Driver |

### 🎛️ **VARIÁVEIS OPCIONAIS**

| Variável | Descrição | Valores | Padrão |
|----------|-----------|---------|--------|
| `JPA_DDL_AUTO` | Estratégia do Hibernate | `create-drop`, `update`, `validate` | `create-drop` |
| `JPA_SHOW_SQL` | Mostrar SQL no console | `true`, `false` | `true` |
| `JPA_FORMAT_SQL` | Formatar SQL no console | `true`, `false` | `true` |
| `SERVER_PORT` | Porta do servidor | `8080`, `3000`, etc. | `8080` |

---

## 🚀 **EXEMPLOS DE CONFIGURAÇÃO**

### 1️⃣ **Desenvolvimento Local com H2**
```batch
set DB_URL=jdbc:h2:mem:boxing_dev
set DB_USERNAME=sa
set DB_PASSWORD=
set DB_DRIVER=org.h2.Driver
set JPA_DDL_AUTO=create-drop
set JPA_SHOW_SQL=true
```

### 2️⃣ **Desenvolvimento Local com MySQL**
```batch
set DB_URL=jdbc:mysql://localhost:3306/boxing_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true
set DB_USERNAME=root
set DB_PASSWORD=
set DB_DRIVER=com.mysql.cj.jdbc.Driver
set JPA_DDL_AUTO=create-drop
set JPA_SHOW_SQL=true
```

### 3️⃣ **Produção com MySQL Remoto**
```batch
set DB_URL=jdbc:mysql://servidor-producao.com:3306/boxing_db?useSSL=true
set DB_USERNAME=boxing_user
set DB_PASSWORD=senha_super_segura_123
set DB_DRIVER=com.mysql.cj.jdbc.Driver
set JPA_DDL_AUTO=update
set JPA_SHOW_SQL=false
set SERVER_PORT=8080
```

### 4️⃣ **Docker/Container**
```bash
# Linux/Docker
export DB_URL="jdbc:mysql://db-container:3306/boxing_db"
export DB_USERNAME="boxing_user"
export DB_PASSWORD="container_password"
export JPA_DDL_AUTO="update"
export JPA_SHOW_SQL="false"
```

---

## 🔐 **BOAS PRÁTICAS DE SEGURANÇA**

### ✅ **FAÇA:**
- Use variáveis de ambiente do sistema em produção
- Mantenha senhas em arquivos `.env` que não são commitados
- Use `JPA_SHOW_SQL=false` em produção
- Configure `JPA_DDL_AUTO=update` ou `validate` em produção

### ❌ **NÃO FAÇA:**
- Commitar senhas no código fonte
- Usar `create-drop` em produção (perde dados!)
- Deixar `JPA_SHOW_SQL=true` em produção (performance)
- Usar senhas fracas ou vazias em produção

---

## 📁 **ESTRUTURA DE ARQUIVOS**

```
backend/
├── .env.example                    # Documentação das variáveis
├── configure-and-run.bat          # Menu interativo de configuração
├── start-with-env.bat             # Script para desenvolvimento
├── start-production.bat           # Script para produção
├── test-env-vars.bat              # Teste das variáveis
└── src/main/resources/
    ├── application.properties       # Configuração principal
    ├── application-dev.properties   # Perfil de desenvolvimento
    └── application-prod.properties  # Perfil de produção
```

---

## 🧪 **COMO TESTAR**

### **Teste Rápido:**
```batch
# Execute o menu interativo
configure-and-run.bat

# Ou teste direto
test-env-vars.bat
```

### **Verificar Configuração Atual:**
```batch
echo DB_URL=%DB_URL%
echo DB_USERNAME=%DB_USERNAME%
echo DB_PASSWORD=%DB_PASSWORD%
```

---

## 🆘 **SOLUÇÃO DE PROBLEMAS**

### **Erro: "Could not connect to database"**
✅ Verifique se `DB_URL`, `DB_USERNAME` e `DB_PASSWORD` estão corretos
✅ Certifique-se que o banco está rodando
✅ Teste a conexão com outro cliente (MySQL Workbench, etc.)

### **Erro: "Table doesn't exist"**
✅ Use `JPA_DDL_AUTO=create-drop` para recriar tabelas
✅ Ou execute manualmente: `CREATE DATABASE boxing_db;`

### **Aplicação não inicia na porta correta**
✅ Configure `SERVER_PORT=8080` (ou outra porta)
✅ Verifique se a porta não está em uso: `netstat -an | findstr :8080`

### **SQL não aparece no console**
✅ Configure `JPA_SHOW_SQL=true`
✅ Configure `JPA_FORMAT_SQL=true` para melhor formatação

---

## 🔄 **SINTAXE DAS VARIÁVEIS NO application.properties**

```properties
# Sintaxe: ${VARIAVEL:valor_padrao}
spring.datasource.url=${DB_URL:jdbc:mysql://localhost:3306/boxing_db}
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD:}

# Se DB_URL estiver definida, usa o valor da variável
# Se não estiver definida, usa o valor padrão após os ":"
```

---

**🎯 Agora você tem controle total sobre a configuração do banco de dados através de variáveis de ambiente!**
