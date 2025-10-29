import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert } from 'typeorm';

@Entity('biz_trm', { schema: 'bizmeta' })
export class BizTerm {
  @PrimaryGeneratedColumn({ name: 'trm_id' })
  termId: number;

  @Column({ name: 'trm_nm' })
  termName: string;

  @Column({ name: 'trm_expln' })
  termExplain: string;

  @Column({ name: 'trm_type' })
  termType: string;

  @Column({ name: 'owner' })
  owner: string;

  @Column({ name: 'enact_dt' })
  createDateTime: Date;
}
