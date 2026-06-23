import { Request, Response } from 'express';
import { JsonReponseSucesso } from "../../utils/jsonReponses";

export default class HealthController {
   public async verificarSaude(req: Request, res: Response): Promise<JsonReponseSucesso> {
      return new JsonReponseSucesso(200, 'Servidor está operacional', {
         status: 'ok',
         timestamp: new Date().toISOString(),
      });
   }
}
