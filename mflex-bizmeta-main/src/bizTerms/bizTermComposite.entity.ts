import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'biz_trm_composite', schema: 'mflex' })
export class BizTermComposite {
  @PrimaryColumn({ name: 'composite_id', type: 'int' })
  compositeId: number; // 구성비즈니스용어ID (PK)

  @PrimaryColumn({ name: 'composite_trm_id', type: 'int' })
  compositeTermId: number; // 상위 비즈니스용어번호 (PK, FK)

  @PrimaryColumn({
    name: 'composite_trm_child_id',
    type: 'int',
  })
  compositeTermChildId: number; // 구성비즈니스용어번호 (PK, FK)

  @Column({ name: 'trm_rel_id', type: 'int', nullable: true })
  termRelId: number | null; // 용어관계ID (FK)

  @Column({ name: 'sort_order', type: 'int', nullable: true })
  sortOrder: number | null; // 정렬 순서

  @Column({
    name: 'enact_dt',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createDateTime: Date; // 시행일시
}
