import Conta from '../entities/conta';
import { AppDataSource } from '../../database/data-source';

export default class ContaRepositorio {

   private repositorio: any;

   constructor() {
      this.repositorio = AppDataSource.getRepository(Conta);
   }

   public async obterContaPorID(id: string): Promise<Conta | null> {
      return await this.repositorio.findOne({ where: { id } });
   }

   public async obterContaPorEmail(email: string): Promise<Conta | null> {
      return await this.repositorio.findOne({ where: { email } });
   }

   public async inserirConta(conta: Conta): Promise<Conta> {
      return await this.repositorio.save(conta);
   }

   public async atualizarConta(id: string, dados: Partial<Pick<Conta, 'email' | 'senha_hash'>>): Promise<void> {
      await this.repositorio.update({ id }, dados);
   }

}
