# 📊 Plataforma de Maturidade BPM

## 📋 Sumário

* [🎯 Descrição](#-descrição)
* [🏗️ Arquitetura do Projeto](#️-arquitetura-do-projeto)
* [📦 Pré-requisitos](#-pré-requisitos)
* [🛠️ Preparando o Ambiente](#️-preparando-o-ambiente)
   * [💻 Windows](#-windows)
   * [🐧 Linux](#-linux)
   * [🍎 MacOS](#-macos)
* [🐘 Configurando o Banco de Dados](#-configurando-o-banco-de-dados)
* [🚀 Instruções de Uso](#-instruções-de-uso)
   * [▶️ Rodando o Backend](#️-rodando-o-backend)
   * [▶️ Rodando o Frontend](#️-rodando-o-frontend)
* [🔑 Acessando o Sistema](#-acessando-o-sistema)
* [👥 Equipe Envolvida](#-equipe-envolvida)

## 🎯 Descrição

Este projeto tem como objetivo apoiar o diagnóstico e o acompanhamento da **maturidade em BPM (Business Process Management)** de uma organização, permitindo mapear processos, registrar fichas **As Is** e **To Be**, aplicar diagnósticos de princípios de BPM, acompanhar indicadores (KPIs), gerar alertas de acompanhamento e consolidar tudo em dashboards gerenciais.

O sistema é dividido em duas aplicações:

* 🔧 **Backend** (`plataforma-maturidade-backend`): API REST desenvolvida em **Java 17** com **Spring Boot 3**, responsável pelas regras de negócio, autenticação (JWT) e persistência dos dados em **PostgreSQL**.
* 🎨 **Frontend** (`plataforma-maturidade-frontend`): Interface web desenvolvida em **React** com **Vite**, responsável pela interação com o usuário (login, diagnósticos, dashboards, relatórios em PDF, etc).

## 🏗️ Arquitetura do Projeto

```
maturidade_bpm-rel-frontend-ui-refresh/
├── plataforma-maturidade-backend/     # API REST (Java + Spring Boot)
│   ├── src/main/java/...
│   ├── src/main/resources/application.yaml
│   └── pom.xml
└── plataforma-maturidade-frontend/    # Interface Web (React + Vite)
    ├── src/
    ├── index.html
    └── package.json
```

## 📦 Pré-requisitos

* ☕ **Java (JDK)** versão 17 ou superior;
* 🛠️ **Apache Maven** 3.8+ (o projeto já inclui o Maven Wrapper `mvnw`, então instalar o Maven manualmente é opcional);
* 🟢 **Node.js** versão 18 ou superior (recomendado 20+) e **npm**;
* 🐘 **PostgreSQL** versão 14 ou superior.

## 🛠️ Preparando o Ambiente

### 💻 Windows

1. **Instalando o JDK**
   * Baixe e instale a versão 17+ do JDK no [site da Oracle](https://www.oracle.com/br/java/technologies/downloads/) ou use o [Adoptium Temurin](https://adoptium.net/).

2. **Instalando o Node.js**
   * Baixe e instale o [Node.js LTS](https://nodejs.org/pt) (já vem com o npm).

3. **Instalando o PostgreSQL**
   * Baixe e instale o [PostgreSQL para Windows](https://www.postgresql.org/download/windows/).
   * Durante a instalação, defina uma senha para o usuário `postgres` (anote-a, ela será usada na configuração do backend).

4. **Configurando o Visual Studio Code (opcional, recomendado)**
   * Instale o [Visual Studio Code](https://code.visualstudio.com/docs/setup/windows).
   * Adicione o [Extension Pack for Java](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-pack).

   💡 **Observação:** este pacote já inclui suporte ao Maven, dispensando instalação manual se você usar o VS Code.

### 🐧 Linux

📌 **Foco no Ubuntu:** as instruções abaixo são específicas para a distribuição Ubuntu. Se você utiliza outra distribuição:

* Consulte a documentação oficial do seu sistema;
* Adapte os comandos conforme necessário (ex: trocando `apt` por `dnf`, `pacman`, etc).

1. **Instalando o JDK**
   ```bash
   sudo apt update
   sudo apt install openjdk-17-jdk -y
   java -version
   ```

2. **Instalando o Node.js** (via [nvm](https://github.com/nvm-sh/nvm), recomendado)
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   source ~/.bashrc
   nvm install --lts
   node -v
   ```

3. **Instalando o PostgreSQL**
   ```bash
   sudo apt install postgresql postgresql-contrib -y
   sudo systemctl enable --now postgresql
   ```

4. **Configurando o VS Code (opcional)**
   * Instale o [VS Code para Linux](https://code.visualstudio.com/docs/setup/linux).
   * Adicione o [Extension Pack for Java](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-pack).

### 🍎 MacOS

1. **Instalando o JDK**
   ```bash
   brew install openjdk@17
   ```

2. **Instalando o Node.js**
   ```bash
   brew install node
   ```

3. **Instalando o PostgreSQL**
   ```bash
   brew install postgresql@14
   brew services start postgresql@14
   ```

4. **Configurando o VS Code (opcional)**
   * Instale o [VS Code para Mac](https://code.visualstudio.com/docs/setup/mac).
   * Adicione o [Extension Pack for Java](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-pack).

## 🐘 Configurando o Banco de Dados

O backend se conecta a um banco PostgreSQL chamado `maturidade_db`. As tabelas são criadas/atualizadas automaticamente pelo Hibernate (`ddl-auto: update`) na primeira execução — **não é necessário rodar scripts SQL manualmente**.

1. Acesse o `psql` (ou uma ferramenta gráfica como pgAdmin/DBeaver) e crie o banco:
   ```sql
   CREATE DATABASE maturidade_db;
   ```

2. As credenciais padrão de conexão ficam em `plataforma-maturidade-backend/src/main/resources/application.yaml`:
   ```yaml
   spring:
     datasource:
       url: jdbc:postgresql://localhost:5432/maturidade_db
       username: postgres
       password: 123
   ```

   ⚠️ Ajuste o `username` e `password` conforme o usuário/senha configurados na instalação do seu PostgreSQL. Caso seu PostgreSQL rode em outra porta/host, ajuste também a `url`.

## 🚀 Instruções de Uso

1. Clone o repositório:
   ```bash
   git clone <url-do-repositorio>
   ```
2. Ou baixe como `.zip` e descompacte o conteúdo.

O projeto possui duas partes que precisam ser executadas **simultaneamente**, cada uma em um terminal.

### ▶️ Rodando o Backend

1. Acesse a pasta do backend:
   ```bash
   cd plataforma-maturidade-backend
   ```
2. Confirme que o PostgreSQL está rodando e que o banco `maturidade_db` foi criado (veja a seção anterior).
3. Execute a aplicação usando o Maven Wrapper (não precisa ter o Maven instalado globalmente):

   * **Linux/MacOS:**
     ```bash
     ./mvnw spring-boot:run
     ```
   * **Windows:**
     ```bash
     mvnw.cmd spring-boot:run
     ```

   Alternativamente, abra o projeto no VS Code (ou IntelliJ) e execute a classe `MaturidadeApplication.java`.

4. A API estará disponível em: `http://localhost:8080`

### ▶️ Rodando o Frontend

1. Em um **novo terminal**, acesse a pasta do frontend:
   ```bash
   cd plataforma-maturidade-frontend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. A aplicação estará disponível em: `http://localhost:5173`

   💡 O frontend já está configurado para consumir a API em `http://localhost:8080/api` (arquivo `src/services/api.js`). Certifique-se de que o backend esteja rodando antes de usar o sistema.

## 🔑 Acessando o Sistema

Com backend e frontend rodando, abra `http://localhost:5173` no navegador. Como ainda não há usuários cadastrados na primeira execução, utilize a rota/tela de **cadastro** (`/api/auth/cadastro`) para criar o primeiro usuário e, em seguida, faça login normalmente pela tela inicial.

## Observação / Possível falha

Caso tenha erros ao rodar o back do projeto, execute o seguinte comando no terminal PowerShell (Execute como administrador):

netstat -ano | findstr :8080

Caso a porta esteja ocupada, será retornado a o número do processo que está ocupando. Então execute:

 

 taskkill /PID (número da porta) /F

 

E então tente executar o backend do projeto novamente.

 

Possível erro ao logar no sistema/ cadastrar processo:

 

Execute o comando no query do pgAdmin:

ALTER TABLE processos
ADD COLUMN IF NOT EXISTS priorizado boolean NOT NULL DEFAULT false;
