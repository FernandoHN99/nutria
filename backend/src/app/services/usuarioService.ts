import UsuarioRepositorio from '../repositories/usuarioRepositorio';
import ContaRepositorio from '../repositories/contaRepositorio';
import Usuario from '../entities/usuario';
import Conta from '../entities/conta';
import { JWT_SECRET, REFRESH_SECRET } from '../../config/variaveis';
import { criarUsuarioObject } from '../schemas/usuario/criarUsuarioSchema';
import { atualizarUsuarioDadosObject } from '../schemas/usuario/atualizarUsuarioDadosSchema';
import { atualizarUsuarioContaObject } from '../schemas/usuario/atualizarUsuarioContaSchema';
import { efetuarLoginObject } from '../schemas/usuario/efetuarLoginSchema';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JsonReponseErro } from '../../utils/jsonReponses';
import Eventos from '../../utils/eventos';

export default class UsuarioService {

   private usuarioRepo: UsuarioRepositorio;
   private contaRepo: ContaRepositorio;

   constructor() {
      this.usuarioRepo = new UsuarioRepositorio();
      this.contaRepo = new ContaRepositorio();
   }

   public async obterUsuarioPorID(usuarioID: string): Promise<Usuario> {
      const usuarioRetornado = await this.usuarioRepo.obterUsuarioPorID(usuarioID);
      if (!usuarioRetornado) {
         JsonReponseErro.lancar(404, 'Usuário não encontrado');
      }
      return usuarioRetornado!;
   }

   public async obterContaPorID(contaId: string): Promise<{ id: string; email: string }> {
      const conta = await this.contaRepo.obterContaPorID(contaId);
      if (!conta) {
         JsonReponseErro.lancar(404, 'Conta não encontrada');
      }
      return { id: conta!.id, email: conta!.email };
   }

   public async criarConta(criarContaJSON: criarUsuarioObject): Promise<{ id: string; email: string }> {
      const contaExistente = await this.contaRepo.obterContaPorEmail(criarContaJSON.email);
      if (contaExistente) {
         JsonReponseErro.lancar(409, 'Email já cadastrado');
      }
      const senha_hash = await bcrypt.hash(criarContaJSON.password, 10);
      const novaConta = new Conta();
      novaConta.email = criarContaJSON.email;
      novaConta.senha_hash = senha_hash;
      const contaCriada = await this.contaRepo.inserirConta(novaConta);
      return { id: contaCriada.id, email: contaCriada.email };
   }

   public async criarUsuario(id_conta: string, dadosUsuario: criarUsuarioObject): Promise<Usuario> {
      dadosUsuario.id_usuario = id_conta;
      const novoUsuario: Usuario = new Usuario(dadosUsuario);
      await novoUsuario.save();
      Eventos.emitir('usuarioCriado', novoUsuario.id_usuario);
      return novoUsuario;
   }

   public async atualizarUsuarioDados(novosDadosUsuario: atualizarUsuarioDadosObject): Promise<any> {
      const usuario = await this.obterUsuarioPorID(novosDadosUsuario.id_usuario);
      usuario.atualizarDados(novosDadosUsuario);
      return await usuario.save();
   }

   public async atualizarUsuarioConta(novosDadosContaUsuario: atualizarUsuarioContaObject): Promise<{ email: string }> {
      const conta = await this.contaRepo.obterContaPorID(novosDadosContaUsuario.id_usuario);
      if (!conta) {
         JsonReponseErro.lancar(404, 'Conta não encontrada');
      }
      const atualizacao: Partial<Pick<Conta, 'email' | 'senha_hash'>> = {};
      if (novosDadosContaUsuario.email) {
         atualizacao.email = novosDadosContaUsuario.email;
      }
      if (novosDadosContaUsuario.password) {
         atualizacao.senha_hash = await bcrypt.hash(novosDadosContaUsuario.password, 10);
      }
      await this.contaRepo.atualizarConta(novosDadosContaUsuario.id_usuario, atualizacao);
      return { email: atualizacao.email ?? conta!.email };
   }

   public async fazerLogin(loginJSON: efetuarLoginObject): Promise<any> {
      const conta = await this.contaRepo.obterContaPorEmail(loginJSON.email);
      if (!conta) {
         JsonReponseErro.lancar(401, 'Credenciais inválidas');
      }
      const senhaCorreta = await bcrypt.compare(loginJSON.password, conta!.senha_hash);
      if (!senhaCorreta) {
         JsonReponseErro.lancar(401, 'Credenciais inválidas');
      }
      const access_token = jwt.sign({ sub: conta!.id }, JWT_SECRET, { expiresIn: '1h' });
      const refresh_token = jwt.sign({ sub: conta!.id }, REFRESH_SECRET, { expiresIn: '7d' });
      return { access_token, refresh_token, token_type: 'bearer', expires_in: 3600 };
   }

   public async obterNovoTokenAcesso(refreshToken: string): Promise<any> {
      let decoded: jwt.JwtPayload;
      try {
         decoded = jwt.verify(refreshToken, REFRESH_SECRET) as jwt.JwtPayload;
      } catch {
         JsonReponseErro.lancar(401, 'Token não autorizado');
         return;
      }
      const access_token = jwt.sign({ sub: decoded.sub }, JWT_SECRET, { expiresIn: '1h' });
      const new_refresh_token = jwt.sign({ sub: decoded.sub }, REFRESH_SECRET, { expiresIn: '7d' });
      return { access_token, refresh_token: new_refresh_token, token_type: 'bearer', expires_in: 3600 };
   }

}
