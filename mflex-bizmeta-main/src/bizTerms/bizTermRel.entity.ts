import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('biz_trm_rel', { schema: 'bizmeta' })
export class BizTermRel {
  @PrimaryGeneratedColumn({ name: 'rel_id' })
  termRelId: number;

  @Column({ name: 'parent_trm_id' })
  parentTermId: number;

  @Column({ name: 'passive_trm_id' })
  passiveTermId: number;

  @Column({ name: 'rel_type' })
  relType: string;

  @Column({ name: 'rel_expln' })
  rel_expln: string;

  @Column({ name: 'owner' })
  owner: string;

  @Column({ name: 'enact_dt' })
  createDateTime: Date;
}
