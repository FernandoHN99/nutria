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
1. Suba o banco de dados com Docker:
   ```bash
   docker compose up -d
   ```
2. Preencha o arquivo `.env` com as credenciais necessárias. As variáveis de conexão ao PostgreSQL já estão pré-configuradas para o Docker local. Adicione apenas a `OPEN_AI_API_KEY` do seu serviço OpenAI.

3. Execute as migrations para criar as tabelas do banco de dados:
   ```bash
   npm run backend:migrate
   ```
4. Popule o banco com os alimentos verificados:
   ```bash
   npm run backend:seed
   ```
5. Inicie o servidor:
   ```bash
   npm run dev:backend
   ```

#### 4. Frontend
1. Atualize o arquivo `.env` com as informações apontadas ao Backend. Um arquivo de exemplo está disponível no projeto para referência.
   > **Observação:** para usar o Expo em múltiplos dispositivos, substitua `localhost` pelo IP da máquina que hospeda o backend.

2. Inicie o aplicativo com o Expo pela raiz do projeto:
   ```bash
   npm run dev:frontend
   ```

#### 5. Executar os dois juntos
```bash
npm run dev
```

> **Estrutura do projeto com workspaces:** há um único `node_modules` gerenciado na raiz do repositório, enquanto `backend/` e `frontend/` mantêm seus próprios `package.json`.

## ✒️ Autores
* Fernando Henriques Neto &nbsp;18.00931-0 
* Guilherme Sanches Rossi &nbsp;&nbsp;19.02404-5 
* Matheus Coelho Rocha  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;20.00391-9 
* Pedro Henrique S.Hein &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;20.00134-7 


## 🎁 Expressões de Gratidão
Agradecimento ao professor [🔗 Rodrigo Bossini](https://www.linkedin.com/in/rodrigobossini/?originalSubdomain=br) por todo suporte para a conclusão do Projeto.
