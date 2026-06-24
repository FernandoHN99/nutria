import 'reflect-metadata'
import path from 'path'
import { DataSource } from 'typeorm'
import { USUARIO, HOST, DATABASE, SENHA, PORTA_DB, DATABASE_URL } from '../config/variaveis'

// Import das suas entidades continuam aqui...
import AlimentoConsumido from '../app/entities/alimentoConsumido'
import AlimentoFavorito from '../app/entities/alimentoFavorito'
import AlimentoPrato from '../app/entities/alimentoPrato'
import Alimento from '../app/entities/alimento'
import Cartao from '../app/entities/cartao'
import Conta from '../app/entities/conta'
import Dia from '../app/entities/dia'
import Perfil from '../app/entities/perfil'
import Prato from '../app/entities/prato'
import Refeicao from '../app/entities/refeicao'
import TabelaNutricional from '../app/entities/tabelaNutricional'
import Usuario from '../app/entities/usuario'
import CodigoDeBarras from '../app/entities/codigoDeBarras'

const databaseConfig = DATABASE_URL
  ? { url: DATABASE_URL, ssl: { rejectUnauthorized: false } }
  : {
      host: HOST,
      port: Number(PORTA_DB),
      username: USUARIO,
      password: SENHA,
      database: DATABASE,
    }

// Valida o ambiente diretamente para definir a pasta da migration
const isProd = process.env.BACKEND_NODE_ENV === 'production'

const migrationsPath = isProd
  ? path.join(process.cwd(), 'build/database/migrations/*.js')
  : path.join(process.cwd(), 'src/database/migrations/*.ts')

export const AppDataSource = new DataSource({
   type: 'postgres',
   ...databaseConfig,
   synchronize: false,
   logging: false,
   entities: [
    AlimentoConsumido, AlimentoFavorito, AlimentoPrato, Alimento,
    Cartao, Conta, Dia, Perfil, Prato, Refeicao, TabelaNutricional,
    Usuario, CodigoDeBarras
  ],
   migrations: [migrationsPath],
   subscribers: [],
})

