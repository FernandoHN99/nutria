# 🍎 NutrIA - Contabilizador de Calorias Inteligente

NutrIA é um aplicativo inteligente para contabilização de calorias e acompanhamento nutricional. Ele conta com um chatbot integrado ao diário do usuário, que utiliza inteligência para compreender o perfil individual e ajudar a atingir metas diárias de forma eficiente.

## ⚙️ Funcionalidades

- **Diário Nutricional**: Registro de alimentos consumidos e controle de macros (proteínas, carboidratos e gorduras).
- **Diário de Evolução**: Registro diário para fotos e informações físicas (circunferência abdominal e peso).
- **Chatbot Inteligente**: Um assistente virtual que o ajuda a monitorar e preencher seu consumo diário.
- **Acompanhamento Personalizado**: O app permite configurar seu perfil e o entende, fornecendo respostas especializadas para atingir suas metas diárias.
- **Integração Simples**: Seu diário, informações e chatbot estão integrados em tempo real.

## 🧑🏻‍💻 Tecnologias Utilizadas

### Backend
- **[🔗 Node.js](https://nodejs.org/en)** com **[🔗 TypeScript](https://www.typescriptlang.org/)**
- **[🔗 TypeORM](https://typeorm.io/)** para o Mapeamento de Objetos Relacionais (ORM)
- **[🔗 Zod](https://zod.dev/)** para Validação de Schemas
- **[🔗 Supabase](https://supabase.com/)** como Banco de Dados
- **[🔗 OpenAI](https://openai.com/api/)** como Inteligência Artificial

### Frontend
- **[🔗 React Native](https://reactnative.dev/)** com **[🔗 TypeScript](https://www.typescriptlang.org/)**
- **[🔗 Expo](https://docs.expo.dev/)** para Desenvolvimento Ágil e Multiplataforma


## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js
- NPM
- Docker (para rodar o PostgreSQL localmente)
- Expo (não é necessário instalar globalmente, o projeto usa npx expo)
- Conta na OpenAI

### Passos

#### 1. Clone o repositório:
   ```bash
   git clone https://github.com/FernandoHN99/NutrIA.git
   ```
   ```bash
   cd nutria
   ```

#### 2. Backend

0. Instale as dependências:
   ```bash
   cd backend
   npm install
   ```

1. Gere as JWT secrets seguras, execute no terminal:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
   ```
   Guarde o resultado para usar no `BACKEND_JWT_SECRET` e `BACKEND_REFRESH_SECRET` mais a frente. Rode o comando duas vezes (um valor para cada secret).

2. Suba o banco de dados com Docker:
   ```bash
   docker compose up -d
   ```

3. Crie o arquivo de ambiente a partir do exemplo:
   ```bash
   cp .env.example .env
   ```

   `backend/.env.example` traz um único template com blocos comentados para os dois cenários — a aplicação sempre lê apenas `backend/.env` (nunca `.env.local`), então escolha um bloco e comente/descomente conforme o caso:
   - **Desenvolvimento local (Docker):** mantenha `BACKEND_DB_HOST`, `BACKEND_DB_PORTA`, `BACKEND_DB_USUARIO`, `BACKEND_DB_SENHA` e `BACKEND_DB_DATABASE` descomentados (já pré-configurados para o `docker-compose.yml`, credenciais padrão `nutria`/`nutria`/`nutria`).
   - **Produção (Render/Neon):** comente o bloco de `BACKEND_DB_*` e descomente `BACKEND_DATABASE_URL`, preenchendo com a string de conexão do seu banco (ela tem prioridade quando definida).
   - Em ambos os casos, configure `BACKEND_JWT_SECRET` e `BACKEND_REFRESH_SECRET` com os valores gerados no passo 1, e adicione `BACKEND_OPEN_AI_API_KEY` apenas se for usar o chatbot.

4. Execute as migrations para criar as tabelas do banco de dados:
   ```bash
   npm run db:migrate
   ```

5. Popule o banco com os alimentos verificados:
   ```bash
   npm run db:seed
   ```

6. Inicie o servidor:
   ```bash
   npm run dev
   ```

#### 3. Frontend
0. Instale as dependências (em outro terminal):
   ```bash
   cd frontend
   npm install
   ```

1. Crie o arquivo de ambiente a partir do exemplo:
   ```bash
   cp .env.example .env
   ```

   `frontend/.env.example` também traz um único template comentado para local e produção:
   ```env
   EXPO_PUBLIC_BACKEND_URL=http://localhost
   EXPO_PUBLIC_BACKEND_PORTA=5001
   ```

   > **Observação para Múltiplos Dispositivos:**
   > Se estiver testando em um dispositivo físico (não no simulador), substitua `localhost` pelo **IP local da máquina** que hospeda o backend:
   > ```env
   > EXPO_PUBLIC_BACKEND_URL=http://192.168.1.100  # Seu IP local
   > EXPO_PUBLIC_BACKEND_PORTA=5001
   > ```
   > Para descobrir seu IP: `ifconfig` (Mac/Linux) ou `ipconfig` (Windows)
   >
   > Para apontar para o backend em produção, descomente a linha `EXPO_PUBLIC_BACKEND_URL` do bloco de produção no `.env.example`.

2. Inicie o aplicativo com o Expo:
   ```bash
   npm start
   ```

> **Estrutura do projeto:** `backend/` e `frontend/` são pacotes independentes, cada um com seu próprio `package.json`, `node_modules` e `.env`. Rode o backend e o frontend em terminais separados (não há um script único na raiz para subir os dois).

## ✒️ Autores
* Fernando Henriques Neto &nbsp;18.00931-0 
* Guilherme Sanches Rossi &nbsp;&nbsp;19.02404-5 
* Matheus Coelho Rocha  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;20.00391-9 
* Pedro Henrique S.Hein &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;20.00134-7 


## 🎁 Expressões de Gratidão
Agradecimento ao professor [🔗 Rodrigo Bossini](https://www.linkedin.com/in/rodrigobossini/?originalSubdomain=br) por todo suporte para a conclusão do Projeto.
