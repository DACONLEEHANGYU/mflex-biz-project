import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'biz_trm_composite_rel', schema: 'mflex' })
export class BizTermCompositeRel {
  @PrimaryColumn({ name: 'trm_composite_rel_id', type: 'int' })
  termCompositerRelId: number; // 구성비즈니스용어ID (PK)

  @PrimaryColumn({ name: 'composite_id', type: 'int' })
  compositeId: number; // 상위 비즈니스용어번호 (PK, FK)

  @PrimaryColumn({
    name: 'composite_rel_id',
    type: 'int',
  })
  compositeRelId: number; // 구성비즈니스용어번호 (PK, FK)

  @Column({ name: 'composite_trm_order', type: 'int' })
  compositeTermOrder: number | null; // 정렬 순서

  @Column({
    name: 'enact_dt',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createDateTime: Date; // 시행일시
}
