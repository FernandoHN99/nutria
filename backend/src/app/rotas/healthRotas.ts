import { Router } from 'express';
import Rota from '../../utils/rota';
import HealthController from '../controllers/healthController';
import Util from '../../utils/util';

export default class HealthRotas implements Rota {
   public caminho: string = '/health';
   public roteador: Router;
   public controller: HealthController;

   constructor() {
      this.roteador = Router();
      this.controller = new HealthController();

      this.roteador.get('/', Util.envolveFuncTryCatch(this.controller, this.controller.verificarSaude));

      console.log('Rotas Health: Ativo');
   }
}
