import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity('conta')
export default class Conta extends BaseEntity {

   @PrimaryGeneratedColumn('uuid')
   id: string;

   @Column({ type: 'text', unique: true })
   email: string;

   @Column({ type: 'text' })
   senha_hash: string;

}
