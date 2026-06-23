import { PORTA_BACKEND, JWT_SECRET, listaRotasSemAuth } from './config/variaveis';
import Rota from './utils/rota';
import Servidor from './app/servidor';
// import Util from './utils/util';
import AlimentoConsumidoRotas from './app/rotas/alimentoConsumidoRotas';
import AlimentoFavoritoRotas from './app/rotas/alimentoFavoritoRotas';
import AlimentoPratoRotas from './app/rotas/alimentoPratoRotas';
import AlimentoRotas from './app/rotas/alimentoRotas';
import CartaoRotas from './app/rotas/cartaoRotas';
import ChatBotRotas from './app/rotas/chatBotRotas';
import DiaRotas from './app/rotas/diaRotas';
import HealthRotas from './app/rotas/healthRotas';
import PerfilRotas from './app/rotas/perfilRotas';
import PratoRotas from './app/rotas/pratoRotas';
import RefeicaoRotas from './app/rotas/refeicaoRotas';
import TabelaNutricionalRotas from './app/rotas/tabelaNutricionalRotas';
import UsuarioRotas from './app/rotas/usuarioRotas';

// const listaRotas: Rota[] = Util.exportarColecaoInstacias('../app/rotas/');
const listaRotas: Rota[] = [
  new AlimentoConsumidoRotas(),
  new AlimentoFavoritoRotas(),
  new AlimentoPratoRotas(),
  new AlimentoRotas(),
  new CartaoRotas(),
  new ChatBotRotas(),
  new DiaRotas(),
  new HealthRotas(),
  new PerfilRotas(),
  new PratoRotas(),
  new RefeicaoRotas(),
  new TabelaNutricionalRotas(),
  new UsuarioRotas()
];

const servidor: Servidor = new Servidor(PORTA_BACKEND, JWT_SECRET, listaRotasSemAuth, listaRotas);
servidor.iniciar();