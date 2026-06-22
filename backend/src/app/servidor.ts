import 'reflect-metadata';
import jwt from 'jsonwebtoken';
import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import Rota from '../utils/rota';
import 'dotenv/config';
import { AppDataSource } from '../database/data-source';


export default class Servidor {
   private app: express.Application;
   private porta: number;
   private listaSubRotas: Rota[];
   private rotasSemAuth: string[];
   private chaveJWT: string;
   private roteadorServidor: express.Router;

   constructor(porta: number, chaveJWT: string , rotasSemAuth: string[] , listaSubRotas: Rota[]) {
      this.app = express();
      this.porta = porta;
      this.listaSubRotas = listaSubRotas;
      this.chaveJWT = chaveJWT;
      this.rotasSemAuth = rotasSemAuth;
      this.roteadorServidor = express.Router({ caseSensitive: true });
      this.app.set('case sensitive routing', true);
   }

   private configurarMiddlewares(): void {
      this.app.use(cookieParser());
      this.app.use(cors());
      this.app.use(express.json({ limit: '50mb' }));
      this.app.use(express.urlencoded({ limit: '50mb', extended: true}));
      
      this.app.use((req: Request, res: Response, next: NextFunction) => {
         console.log(`${req.method} ${req.url}`);
         if (this.rotasSemAuth.includes(req.url)) {
            return next();
         }
         this.authenticarTokenBearer(req, res, next);
      });
      
      this.app.use('/nutria', this.roteadorServidor);
      this.app.use((req, res) => {
         res.status(404).json({ sucesso: false, codigo: 404, mensagem: 'Rota não encontrada', erro: req.url });
      });
   }

   public authenticarTokenBearer(req: Request, res: Response, next: NextFunction) {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
         return res.status(400).json({ sucesso: false, codigo: 400, mensagem: 'Token de autenticação não fornecido', erro: {} });
      }

      const tokenParts = authHeader.split(' ');
      if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
         return res.status(400).json({ sucesso: false, codigo: 400, mensagem: 'Token inválido', erro: {} });
      }

      const token = tokenParts[1];
      try {
         const decoded = jwt.verify(token, this.chaveJWT) as { sub: string };
         req.body.id_usuario = decoded.sub;
         next();
      } catch (error) {
         if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ sucesso: false, codigo: 401, mensagem: 'Token expirado', erro: error });
         }
         return res.status(401).json({ sucesso: false, codigo: 401, mensagem: 'Token inválido', erro: error });
      }
   }

   private ativarSubRotas() {
      this.listaSubRotas.forEach(rota => {
         this.roteadorServidor.use(rota.caminho, rota.roteador);
      });
   }

   private iniciarServicos(): void {
      AppDataSource.initialize().then(async () => {
         console.log('Banco de dados: Ativo');
         this.app.listen({
          host: '0.0.0.0',
          port: this.porta,
          },
        () => console.log(`Servidor (${this.porta}): Ativo`)
      );
          
      }).catch((erro) => {
         console.error('Erro ao conectar ao banco de dados', erro);
      });
   }

   public iniciar(): void {
      this.configurarMiddlewares();
      this.ativarSubRotas();
      this.iniciarServicos();
   }
}

