import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { USUARIO, HOST, DATABASE, SENHA, PORTA_DB, DATABASE_URL } from '../config/variaveis'

import AlimentoConsumido from '../app/entities/alimentoConsumido'
import AlimentoFavorito from '../app/entities/alimentoFavorito'
import AlimentoPrato from '../app/entities/alimentoPrato'
import Alimento from '../app/entities/alimento'
import Cartao from '../app/entities/cartao';
import Conta from '../app/entities/conta';
import Dia from '../app/entities/dia';
import Perfil from '../app/entities/perfil';
import Prato from '../app/entities/prato';
import Refeicao from '../app/entities/refeicao';
import TabelaNutricional from '../app/entities/tabelaNutricional';
import Usuario from '../app/entities/usuario';
import CodigoDeBarras from '../app/entities/codigoDeBarras'

const databaseConfig: any = DATABASE_URL
  ? { url: DATABASE_URL, ssl: { rejectUnauthorized: false } }
  : {
      host: HOST,
      port: PORTA_DB,
      username: USUARIO,
      password: SENHA,
      database: DATABASE,
    }

export const AppDataSource = new DataSource({
   type: 'postgres',
   ...databaseConfig,
   synchronize: false,
   logging: false,
   entities: [
    AlimentoConsumido,
    AlimentoFavorito,
    AlimentoPrato,
    Alimento,
    Cartao,
    Conta,
    Dia,
    Perfil,
    Prato,
    Refeicao,
    TabelaNutricional,
    Usuario,
    CodigoDeBarras
  ],
   migrations: ['src/database/migrations/*.ts'],
   subscribers: [],
})
