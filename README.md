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

#### 2. Instale as dependências na raiz
1. Instale tudo uma vez, a partir da raiz do projeto:
   ```bash
   npm install
   ```

#### 3. Backend

0. Gere as JWT secrets seguros, execute no terminal:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
   ```
   Guarde o resultado para usar no `BACKEND_JWT_SECRET` e `BACKEND_REFRESH_SECRET` mais a frente.

1. Suba o banco de dados com Docker:
   ```bash
   docker compose up -d
   ```

2. Crie os arquivos de ambiente:
   ```bash
   # Para desenvolvimento local (com Docker)
   cp backend/.env.local.example backend/.env.local
   
   # Para produção (usando DATABASE_URL)
   cp backend/.env.example backend/.env
   ```

3. **Para Desenvolvimento Local:**
   - Use `backend/.env.local` (já pré-configurado para Docker)
   - As credenciais padrão são: `usuario: nutria`, `senha: nutria`, `database: nutria`
   - Configure `BACKEND_JWT_SECRET` e `BACKEND_REFRESH_SECRET` com valores seguros
   - Adicione apenas `BACKEND_OPEN_AI_API_KEY` se for usar o chatbot

4. **Para Produção (Render/Neon):**
   - Use `backend/.env` 
   - Preencha `BACKEND_DATABASE_URL` com a string de conexão do seu banco em produção
   - Configure `BACKEND_JWT_SECRET` e `BACKEND_REFRESH_SECRET` com valores seguros

5. Execute as migrations para criar as tabelas do banco de dados:
   ```bash
   npm run backend:migrate
   ```

6. Popule o banco com os alimentos verificados:
   ```bash
   npm run backend:seed
   ```

7. Inicie o servidor:
   ```bash
   npm run dev:backend
   ```

#### 4. Frontend
1. Crie o arquivo de ambiente:
   ```bash
   cp frontend/.env.example frontend/.env
   ```

2. Configure o `frontend/.env` com o endereço do backend:
   ```env
   BACKEND_URL=http://localhost
   BACKEND_PORTA=5001
   ```

   > **Observação para Múltiplos Dispositivos:**
   > Se estiver testando em um dispositivo físico (não no simulador), substitua `localhost` pelo **IP local da máquina** que hospeda o backend:
   > ```env
   > BACKEND_URL=http://192.168.1.100  # Seu IP local
   > BACKEND_PORTA=5001
   > ```
   > Para descobrir seu IP: `ifconfig` (Mac/Linux) ou `ipconfig` (Windows)

3. Inicie o aplicativo com o Expo:
   ```bash
   npm run dev:frontend
   ```

#### 5. Executar os dois juntos
```bash
npm run dev
```

> **Estrutura do projeto com workspaces:** há um único `node_modules` gerenciado na raiz do repositório, enquanto `backend/` e `frontend/` mantêm seus próprios `package.json` e `.env` separados.

## ✒️ Autores
* Fernando Henriques Neto &nbsp;18.00931-0 
* Guilherme Sanches Rossi &nbsp;&nbsp;19.02404-5 
* Matheus Coelho Rocha  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;20.00391-9 
* Pedro Henrique S.Hein &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;20.00134-7 


## 🎁 Expressões de Gratidão
Agradecimento ao professor [🔗 Rodrigo Bossini](https://www.linkedin.com/in/rodrigobossini/?originalSubdomain=br) por todo suporte para a conclusão do Projeto.
