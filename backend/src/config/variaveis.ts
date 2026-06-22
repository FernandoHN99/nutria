import 'dotenv/config';

export const PORTA_BACKEND: number = 5001;
export const DOMINIO_BACKEND: string = 'http://127.0.0.1';
export const DATABASE_URL: string = process.env.DATABASE_URL ?? '';
export const USUARIO: string = process.env.DB_USUARIO ?? '';
export const HOST: string = process.env.DB_HOST ?? '';
export const DATABASE: string = process.env.DB_DATABASE ?? '';
export const SENHA: string = process.env.DB_SENHA ?? '';
export const PORTA_DB: number = process.env.DB_PORTA ? parseInt(process.env.DB_PORTA) : 0;

export const JWT_SECRET: string = process.env.JWT_SECRET ?? '';
export const REFRESH_SECRET: string = process.env.REFRESH_SECRET ?? '';

export const OPEN_AI_API_KEY: string = process.env.OPEN_AI_API_KEY ?? '';


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

