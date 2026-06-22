import { Entity, Column, PrimaryColumn, BaseEntity, ManyToOne, JoinColumn } from "typeorm";
import Usuario from "./usuario";

@Entity('cartao')
export default class Cartao extends BaseEntity {

   @PrimaryColumn('uuid')
   id_usuario: string

   @PrimaryColumn('text')
   tipo_cartao: string

   @Column({ type: 'timestamp', nullable: true })
   dtt_interacao_cartao: string | null

   @ManyToOne(() => Usuario, (usuario) => usuario.cartoes)
   @JoinColumn({ name: "id_usuario" })
   usuario: Usuario;

   constructor(id_usuario: string, tipo_cartao: string) {
      super();
      this.id_usuario = id_usuario;
      this.tipo_cartao = tipo_cartao;
      this.dtt_interacao_cartao = null;
   }

   public marcarCartaoLido() {
      this.dtt_interacao_cartao = new Date().toISOString();
   }

}