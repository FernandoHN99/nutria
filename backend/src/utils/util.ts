import { Request, Response, NextFunction } from 'express';
import { JsonReponseSucesso, JsonReponseErro } from './jsonReponses';
import { directoryImport } from 'directory-import';

export default class Util {

   static envolveFuncTryCatch(context: any, funcao: Function) {
      return async function (req: Request, res: Response, next: NextFunction) {
         let responseSucesso: JsonReponseSucesso;
         try {
            responseSucesso = await funcao.bind(context)(req, res, next);
            res.status(responseSucesso.codigo).json(responseSucesso);
         } catch (erro: any) {
            console.log('erro: ', erro)
            if (erro instanceof JsonReponseErro) {
               res.status(erro.codigo).json(erro);
            } else {
               res.status(500).json({ sucesso: false, codigo: 500, mensagem: 'Erro interno no servidor', erro });
            }
         }
      };
   }

   static validarData(stringDate: string): boolean {
      return !isNaN(Date.parse(stringDate));
   }

   static validarString(valor: any): boolean {
      return typeof valor === 'string' && valor.length > 0;
   }

   static validarNumero(valor: any): boolean {
      const numero = parseFloat(valor);
      return !isNaN(numero);
   }

   static validarNumeroPositivo(valor: any): boolean {
      const numero = parseFloat(valor);
      return !isNaN(numero) && numero >= 0;
   }

   static validarNumeroMaiorZero(valor: any): boolean {
      const numero = parseFloat(valor);
      return !isNaN(numero) && numero > 0;
   }

   static exportarColecaoInstacias(caminhoModulos: string): [] {
      const modulosImportados: any = directoryImport(caminhoModulos);
      let instanciasExportadas: any = [];
      for (let key in modulosImportados) {
         instanciasExportadas.push(new modulosImportados[key].default());
      }
      return instanciasExportadas;
   }

   static exportarColecao(caminhoModulos: string): [] {
      const modulosImportados: any = directoryImport(caminhoModulos);
      let modulosExportados: any = [];
      for (let key in modulosImportados) {
         modulosExportados.push(modulosImportados[key].default);
      }
      return modulosExportados;
   }

   static capitalize(frase: string) {
      return frase.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
   }

   static criarStrData(dias: number = 0, meses: number = 0, anos: number = 0, data: Date = new Date()): string {
      return new Date(data.getFullYear() + anos, data.getMonth() + meses, data.getDate() + dias).toISOString().split('T')[0];
   }

   static transformerStringNumber = {
      from(valor: string): number {
         return parseFloat(valor);
      },
      to(valor: any) {
         return valor;
      }
   }

   static transformerByteaString = {
      from(valor: any): string {
         return valor ? valor.toString() : valor;
      },
      to(valor: any) {
         return valor;
      }
   };

   static contarNumeroKeysJSON(json: any): number {
      return Object.keys(json).length;
   }
}