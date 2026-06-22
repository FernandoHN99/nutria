import 'dotenv/config';

export const PORTA_BACKEND: number = 5001;
export const DOMINIO_BACKEND: string = 'http://127.0.0.1';

// Production database URL (Render/Neon) takes precedence
export const DATABASE_URL: string = process.env.BACKEND_DATABASE_URL ?? '';

// Development database configuration (Docker)
export const USUARIO: string = process.env.BACKEND_DB_USUARIO ?? '';
export const HOST: string = process.env.BACKEND_DB_HOST ?? '';
export const DATABASE: string = process.env.BACKEND_DB_DATABASE ?? '';
export const SENHA: string = process.env.BACKEND_DB_SENHA ?? '';
export const PORTA_DB: number = process.env.BACKEND_DB_PORTA ? parseInt(process.env.BACKEND_DB_PORTA) : 0;

// Authentication
export const JWT_SECRET: string = process.env.BACKEND_JWT_SECRET ?? '';
export const REFRESH_SECRET: string = process.env.BACKEND_REFRESH_SECRET ?? '';

// OpenAI
export const OPEN_AI_API_KEY: string = process.env.BACKEND_OPEN_AI_API_KEY ?? '';


export const tiposDeCartao: Array<string> = ['MACROS', 'CALORIAS', 'DIETA FLEXIVEL'];
export const listaNomeRefeicoesBase: Array<string> = ['Café', 'Almoço', 'Jantar', 'Lanche'];
export const listaRotasSemAuth: Array<string> = ['/nutria/usuario/criar', '/nutria/usuario/login', '/nutria/usuario/refresh-token'];
export const listaEstadosAlimentos: Array<string> = ['PADRAO', 'CRU', 'COZIDO', 'GRELHADO', 'ASSADO', 'REFOGADO', 'FRITO'];
export const listaUnidadesMedida: Array<string> = ['GRAMA', 'MILILITRO', 'COLHER SOPA', 'COLHER CHA', 'XICARA PADRAO', 'XICARA CHA', 'XICARA CAFE', 'UNIDADE'];
export const listaSexosBiologicos: Array<string> = ['H', 'M'];
export const listaSistemasMedidas: Array<string> = ['METRICO', 'IMPERIAL'];
export const listaPerfisAlimentares: Array<string> = ['ONIVORO', 'VEGETARIANO', 'VEGANO'];
export const listaNiveisDeAtividade: Array<string> = ['SENDENTARIO', 'LEVE', 'MODERADO', 'INTENSO', 'EXTREMO'];
export const listaObjetivos: Array<string> = ['PERDA', 'MANUTENCAO', 'GANHO'];

