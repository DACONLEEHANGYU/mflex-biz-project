import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource, In, EntityManager } from 'typeorm';
import { BizTerm } from './bizTerm.entity';
import { BizTermRel } from './bizTermRel.entity';
import { BizTermComposite } from './bizTermComposite.entity';
import { BizTermCompositeRel } from './bizTermCompositeRel.entity';

@Injectable()
export class BizTermService {
  constructor(
    @InjectRepository(BizTerm)
    private readonly bizTermRepository: Repository<BizTerm>,
    @InjectRepository(BizTermRel)
    private readonly bizTermRelRepository: Repository<BizTermRel>,
    @InjectRepository(BizTermComposite)
    private readonly bizTermCompositeRepository: Repository<BizTermComposite>,
    @InjectRepository(BizTermCompositeRel)
    private readonly bizTermCompositeRelRepository: Repository<BizTermCompositeRel>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 복합구성용어 자식 간 관계 전체 조회
   */
  async getAllCompositeRelations(): Promise<BizTermCompositeRel[]> {
    return await this.bizTermCompositeRelRepository.find({
      order: {
        compositeTermOrder: 'ASC',
      },
    });
  }

  /**
   * 특정 복합구성용어의 자식 간 관계 조회
   * @param compositeId 복합구성용어 번호
   */
  async getCompositeRelationsByCompositeId(
    compositeId: number,
  ): Promise<BizTermCompositeRel[]> {
    return await this.bizTermCompositeRelRepository.find({
      where: {
        compositeId: compositeId,
      },
      order: {
        compositeTermOrder: 'ASC',
      },
    });
  }

  /**
   * 전체 용어 조회 (페이징 포함, 관계 포함, 복합용어 구성 포함)
   */
  async findAll(page: number = 1, limit: number = 50) {
    // 1. 기본 용어 조회
    const [terms, totalCount] = await this.bizTermRepository.findAndCount({
      order: {
        termId: 'ASC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // 2. 조회된 용어들의 ID 추출
    const termIds = terms.map((term) => term.termId);

    // 3. termId가 parent_trm_id 또는 passive_trm_id인 관계 정보 조회
    const parentRelations = await this.bizTermRelRepository.find({
      where: {
        parentTermId: In(termIds),
      },
    });

    const passiveRelations = await this.bizTermRelRepository.find({
      where: {
        passiveTermId: In(termIds),
      },
    });

    // 4. termId가 복합용어인 경우 구성용어(자식) 조회
    const compositeChildren = await this.bizTermCompositeRepository.find({
      where: {
        compositeTermId: In(termIds),
      },
      order: {
        sortOrder: 'ASC',
      },
    });

    // 4-1. 복합구성용어 자식 간 관계 전체 조회
    const allCompositeRelations = await this.getAllCompositeRelations();

    // 4-2. compositeRelations에서 사용되는 compositeRelId 추출
    const compositeRelIds = allCompositeRelations.map((rel) =>
      Number(rel.compositeRelId),
    );

    // 4-3. compositeRelId에 해당하는 BizTermRel 조회
    let compositeRelDetails: BizTermRel[] = [];
    if (compositeRelIds.length > 0) {
      compositeRelDetails = await this.bizTermRelRepository.find({
        where: {
          termRelId: In(compositeRelIds),
        },
      });
    }

    // 4-4. compositeRelId별 BizTermRel을 Map으로 구성
    const compositeRelDetailsMap = new Map<number, BizTermRel>();
    compositeRelDetails.forEach((rel) => {
      compositeRelDetailsMap.set(Number(rel.termRelId), rel);
    });

    // 5. 구성용어의 상세 정보를 가져오기 위해 자식 용어 ID 추출
    const childTermIds = compositeChildren.map((comp) =>
      Number(comp.compositeTermChildId),
    );
    const childTermsMap = new Map();

    if (childTermIds.length > 0) {
      const childTerms = await this.bizTermRepository.find({
        where: {
          termId: In(childTermIds),
        },
      });

      childTerms.forEach((term) => {
        childTermsMap.set(term.termId, term);
      });
    }

    // 6. 자식 용어들의 관계 정보 조회
    const childParentRelations = await this.bizTermRelRepository.find({
      where: {
        parentTermId: In(childTermIds),
      },
    });

    const childPassiveRelations = await this.bizTermRelRepository.find({
      where: {
        passiveTermId: In(childTermIds),
      },
    });

    // 7. 자식 용어별 관계 정보를 Map으로 구성
    const childRelationsMap = new Map();

    childTermIds.forEach((childId) => {
      const asParent = childParentRelations.filter(
        (rel) => Number(rel.parentTermId) === Number(childId),
      );
      const asPassive = childPassiveRelations.filter(
        (rel) => Number(rel.passiveTermId) === Number(childId),
      );

      childRelationsMap.set(childId, {
        asParent,
        asPassive,
        relationCount: asParent.length + asPassive.length,
      });
    });

    // 8. 용어별 관계 및 복합용어 구성 매핑
    const items = terms.map((term) => {
      // parent로 연결된 관계들 (termId가 parent_trm_id인 경우)
      const asParent = parentRelations.filter(
        (rel) => Number(rel.parentTermId) === Number(term.termId),
      );

      // passive로 연결된 관계들 (termId가 passive_trm_id인 경우)
      const asPassive = passiveRelations.filter(
        (rel) => Number(rel.passiveTermId) === Number(term.termId),
      );

      // 해당 compositeId의 자식 간 관계 필터링 및 BizTermRel 정보 추가
      const compositeRelations = allCompositeRelations
        .filter((rel) => Number(rel.compositeId) === Number(term.termId))
        .map((rel) => ({
          ...rel,
          relationDetail:
            compositeRelDetailsMap.get(Number(rel.compositeRelId)) || null,
        }));

      // 복합용어의 구성용어(자식) 정보
      const compositeInfo = compositeChildren
        .filter((comp) => Number(comp.compositeTermId) === Number(term.termId))
        .map((comp) => {
          const childTerm = childTermsMap.get(
            Number(comp.compositeTermChildId),
          );
          const childRelations = childRelationsMap.get(
            Number(comp.compositeTermChildId),
          ) || {
            asParent: [],
            asPassive: [],
            relationCount: 0,
          };

          return {
            compositeId: comp.compositeId,
            compositeTermId: comp.compositeTermId,
            compositeTermChildId: comp.compositeTermChildId,
            termRelId: comp.termRelId,
            sortOrder: comp.sortOrder,
            childTerm: childTerm
              ? {
                  ...childTerm,
                  relations: {
                    asParent: childRelations.asParent,
                    asPassive: childRelations.asPassive,
                  },
                  relationCount: childRelations.relationCount,
                }
              : null,
          };
        });

      return {
        ...term,
        relations: {
          asParent: asParent,
          asPassive: asPassive,
        },
        relationCount: asParent.length + asPassive.length,
        compositeChildren: compositeInfo,
        compositeRelations: compositeRelations, // BizTermRel 정보가 포함된 자식 간 관계
        compositeRelationsCount: compositeRelations.length,
        compositeChildrenCount: compositeInfo.length,
      };
    });

    return {
      items,
      searchCount: items.length,
      totalCount,
      allCompositeRelations: allCompositeRelations, // 전체 복합구성용어 관계 데이터 추가
    };
  }

  /**
   * ID로 용어 조회 (관계 포함)
   */
  async findOne(termId: number) {
    const term = await this.bizTermRepository.findOne({
      where: { termId },
    });

    if (!term) {
      return null;
    }

    // termId가 parent_trm_id인 관계 정보 조회
    const asParent = await this.bizTermRelRepository.find({
      where: { parentTermId: termId },
    });

    // termId가 passive_trm_id인 관계 정보 조회
    const asPassive = await this.bizTermRelRepository.find({
      where: { passiveTermId: termId },
    });

    return {
      ...term,
      relations: {
        asParent: asParent,
        asPassive: asPassive,
      },
      relationCount: asParent.length + asPassive.length,
    };
  }

  /**
   * 용어명으로 검색 (관계 포함)
   */
  async searchByName(trmName: string, page: number = 1, limit: number = 50) {
    const [terms, totalCount] = await this.bizTermRepository
      .createQueryBuilder('biz_trm')
      .where('biz_trm.trm_nm LIKE :trmName', { trmName: `%${trmName}%` })
      .orderBy('biz_trm.trm_id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const termIds = terms.map((term) => term.termId);

    // termId가 parent_trm_id 또는 passive_trm_id인 관계 정보 조회
    const parentRelations = await this.bizTermRelRepository.find({
      where: {
        parentTermId: In(termIds),
      },
    });

    const passiveRelations = await this.bizTermRelRepository.find({
      where: {
        passiveTermId: In(termIds),
      },
    });

    const items = terms.map((term) => {
      const asParent = parentRelations.filter(
        (rel) => rel.parentTermId === term.termId,
      );

      const asPassive = passiveRelations.filter(
        (rel) => rel.passiveTermId === term.termId,
      );

      return {
        ...term,
        relations: {
          asParent: asParent,
          asPassive: asPassive,
        },
        relationCount: asParent.length + asPassive.length,
      };
    });

    return {
      items,
      searchCount: items.length,
      totalCount,
    };
  }

  /**
   * 비즈니스 용어 추가
   */
  async addBizTerm(bizTerm: Partial<BizTerm>): Promise<BizTerm> {
    const now = new Date();

    const entity = this.bizTermRepository.create({
      ...bizTerm,
      createDateTime: bizTerm.createDateTime
        ? new Date(bizTerm.createDateTime)
        : now,
    });
    return await this.bizTermRepository.save(entity);
  }

  /**
   * 비즈니스 용어 삭제
   */
  async deleteBizTerm(termId: number): Promise<void> {
    await this.bizTermRepository.delete({ termId });
  }

  /**
   * 비즈니스 용어 관계 추가
   */
  async addBizTermRel(bizTermRel: Partial<BizTermRel>): Promise<BizTermRel> {
    const existingRelation = await this.bizTermRelRepository.findOne({
      where: {
        parentTermId: bizTermRel.parentTermId,
        passiveTermId: bizTermRel.passiveTermId,
        relType: bizTermRel.relType,
      },
    });

    if (existingRelation) {
      // ✅ 커스텀 코드(140) 포함해서 예외 던지기
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          message: `이미 존재하는 관계입니다. (Parent: ${bizTermRel.parentTermId}, Passive: ${bizTermRel.passiveTermId}, Type: ${bizTermRel.relType})`,
          code: 1400, // ← 커스텀 에러코드
        },
        HttpStatus.CONFLICT,
      );
    }

    const now = new Date();

    const entity = this.bizTermRelRepository.create({
      ...bizTermRel,
      createDateTime: bizTermRel.createDateTime
        ? new Date(bizTermRel.createDateTime)
        : now,
    });

    return await this.bizTermRelRepository.save(entity);
  }

  /**
   * 비즈니스 용어 관계 삭제
   */
  async deleteBizTermRel(relId: number): Promise<void> {
    await this.bizTermRelRepository.delete({ termRelId: relId });
  }

  /**
   * 복합 구성 용어 생성 (메인 함수)
   * @param compositeTermId 부모 용어 ID (복합용어)
   * @param compositeTermChildId 자식 용어 ID (구성용어)
   */
  async addBizTermComposite(
    compositeTermId: number,
    compositeTermChildId: number,
  ): Promise<{ term: BizTerm; composites: BizTermComposite[] }> {
    // 트랜잭션으로 묶어서 원자성 보장
    return await this.dataSource.transaction(async (manager) => {
      // 1. 복합용어 타입 업데이트
      const compositeTerm = await this.updateTermToComposite(
        compositeTermId,
        manager,
      );

      // 2. 구성용어 추가
      await this.addCompositeChild(
        compositeTermId,
        compositeTermChildId,
        manager,
      );

      // 3. 결과 조회
      const composites = await manager.find(BizTermComposite, {
        where: { compositeTermId: compositeTermId },
      });

      return { term: compositeTerm, composites };
    });
  }

  /**
   * 용어를 복합용어 타입으로 변경
   */
  private async updateTermToComposite(
    termId: number,
    manager?: EntityManager,
  ): Promise<BizTerm> {
    const repository = manager
      ? manager.getRepository(BizTerm)
      : this.bizTermRepository;

    const term = await repository.findOne({
      where: { termId },
    });

    if (!term) {
      throw new NotFoundException(`용어 ID ${termId}를 찾을 수 없습니다.`);
    }

    // 이미 복합용어인 경우 업데이트 스킵
    if (term.termType !== 'COMPOSITE') {
      await repository.update({ termId }, { termType: 'COMPOSITE' });
      term.termType = 'COMPOSITE';
    }
    return term;
  }

  /**
   * 복합용어에 구성용어(자식) 추가
   */
  // async addCompositeChild(
  //   compositeTermId: number,
  //   compositeTermChildId: number,
  //   manager?: EntityManager,
  // ): Promise<BizTermComposite> {
  //   const compositeRepository = manager
  //     ? manager.getRepository(BizTermComposite)
  //     : this.bizTermCompositeRepository;

  //   const relRepository = manager
  //     ? manager.getRepository(BizTermRel)
  //     : this.bizTermRelRepository;

  //   // 자식 용어 존재 확인
  //   const childRepository = manager
  //     ? manager.getRepository(BizTerm)
  //     : this.bizTermRepository;

  //   const childTerm = await childRepository.findOne({
  //     where: { termId: compositeTermChildId },
  //   });

  //   if (!childTerm) {
  //     throw new NotFoundException(
  //       `구성용어 ID ${compositeTermChildId}를 찾을 수 없습니다.`,
  //     );
  //   }

  //   // 복합 구성용어 중복 체크
  //   const existingComposite = await compositeRepository.findOne({
  //     where: {
  //       compositeTermId: compositeTermId,
  //       compositeTermChildId: compositeTermChildId,
  //     },
  //   });

  //   if (existingComposite) {
  //     throw new ConflictException('이미 추가된 구성용어입니다.');
  //   }

  //   // 소속관계 중복 체크
  //   const existingRelation = await relRepository.findOne({
  //     where: {
  //       parentTermId: compositeTermId,
  //       passiveTermId: compositeTermChildId,
  //       relType: 'COMPOSITION',
  //     },
  //   });

  //   let relationId: number;

  //   if (existingRelation) {
  //     // 이미 소속관계가 있으면 기존 관계 ID 사용
  //     relationId = existingRelation.termRelId;
  //   } else {
  //     // 최대 rel_id 조회 (타입 캐스팅 추가)
  //     const maxRelResult = await relRepository
  //       .createQueryBuilder('rel')
  //       .select('COALESCE(MAX(rel.rel_id::integer), 0)', 'maxId')
  //       .getRawOne();

  //     const newRelId = parseInt(maxRelResult.maxId) + 1;

  //     const newRelation = relRepository.create({
  //       termRelId: newRelId,
  //       parentTermId: compositeTermId,
  //       passiveTermId: compositeTermChildId,
  //       relType: 'COMPOSITION',
  //       rel_expln: '복합용어 구성 관계',
  //       owner: 'system',
  //       createDateTime: new Date(),
  //     });

  //     const savedRelation = await relRepository.save(newRelation);
  //     relationId = savedRelation.termRelId;
  //   }

  //   // 최대 composite_id 조회 (타입 캐스팅 추가)
  //   const maxCompositeResult = await compositeRepository
  //     .createQueryBuilder('comp')
  //     .select('COALESCE(MAX(comp.composite_id::integer), 0)', 'maxId')
  //     .getRawOne();

  //   const newCompositeId = parseInt(maxCompositeResult.maxId) + 1;

  //   console.log(
  //     'Max composite_id:',
  //     maxCompositeResult.maxId,
  //     '-> New ID:',
  //     newCompositeId,
  //   );

  //   // sortOrder 계산
  //   const compositesForParent = await compositeRepository.count({
  //     where: { compositeTermId: compositeTermId },
  //   });
  //   const sortOrder = compositesForParent + 1;

  //   // 복합 구성용어 생성
  //   const composite = compositeRepository.create({
  //     compositeId: newCompositeId,
  //     compositeTermId: compositeTermId,
  //     compositeTermChildId: compositeTermChildId,
  //     termRelId: relationId,
  //     sortOrder: sortOrder,
  //     createDateTime: new Date(),
  //   });

  //   console.log('Creating composite:', composite);

  //   return await compositeRepository.save(composite);
  // }

  /**
   * 복합용어에 구성용어(자식) 추가
   */
  async addCompositeChild(
    compositeTermId: number,
    compositeTermChildId: number,
    manager?: EntityManager,
  ): Promise<BizTermComposite> {
    const compositeRepository = manager
      ? manager.getRepository(BizTermComposite)
      : this.bizTermCompositeRepository;

    const relRepository = manager
      ? manager.getRepository(BizTermRel)
      : this.bizTermRelRepository;

    const compositeRelRepository = manager
      ? manager.getRepository(BizTermCompositeRel)
      : this.bizTermCompositeRelRepository;

    // 자식 용어 존재 확인
    const childRepository = manager
      ? manager.getRepository(BizTerm)
      : this.bizTermRepository;

    const childTerm = await childRepository.findOne({
      where: { termId: compositeTermChildId },
    });

    if (!childTerm) {
      throw new NotFoundException(
        `구성용어 ID ${compositeTermChildId}를 찾을 수 없습니다.`,
      );
    }

    // 복합 구성용어 중복 체크
    const existingComposite = await compositeRepository.findOne({
      where: {
        compositeTermId: compositeTermId,
        compositeTermChildId: compositeTermChildId,
      },
    });

    if (existingComposite) {
      throw new ConflictException('이미 추가된 구성용어입니다.');
    }

    // 부모-자식 간 소속관계 중복 체크
    const existingRelation = await relRepository.findOne({
      where: {
        parentTermId: compositeTermId,
        passiveTermId: compositeTermChildId,
        relType: 'COMPOSITION',
      },
    });

    let relationId: number;

    if (existingRelation) {
      relationId = existingRelation.termRelId;
    } else {
      const maxRelResult = await relRepository
        .createQueryBuilder('rel')
        .select('COALESCE(MAX(rel.rel_id::integer), 0)', 'maxId')
        .getRawOne();

      const newRelId = parseInt(maxRelResult.maxId) + 1;

      const newRelation = relRepository.create({
        termRelId: newRelId,
        parentTermId: compositeTermId,
        passiveTermId: compositeTermChildId,
        relType: 'COMPOSITION',
        rel_expln: '복합용어 구성 관계',
        owner: 'system',
        createDateTime: new Date(),
      });

      const savedRelation = await relRepository.save(newRelation);
      relationId = savedRelation.termRelId;
    }

    // 최대 composite_id 조회
    const maxCompositeResult = await compositeRepository
      .createQueryBuilder('comp')
      .select('COALESCE(MAX(comp.composite_id::integer), 0)', 'maxId')
      .getRawOne();

    const newCompositeId = parseInt(maxCompositeResult.maxId) + 1;

    console.log(
      'Max composite_id:',
      maxCompositeResult.maxId,
      '-> New ID:',
      newCompositeId,
    );

    // sortOrder 계산
    const compositesForParent = await compositeRepository.count({
      where: { compositeTermId: compositeTermId },
    });
    const sortOrder = compositesForParent + 1;

    // 복합 구성용어 생성
    const composite = compositeRepository.create({
      compositeId: newCompositeId,
      compositeTermId: compositeTermId,
      compositeTermChildId: compositeTermChildId,
      termRelId: relationId,
      sortOrder: sortOrder,
      createDateTime: new Date(),
    });

    console.log('Creating composite:', composite);

    const savedComposite = await compositeRepository.save(composite);

    // ✅ 복합용어의 기존 구성요소들 조회 (sortOrder 순서대로)
    const existingComposites = await compositeRepository.find({
      where: {
        compositeTermId: compositeTermId,
      },
      order: {
        sortOrder: 'ASC',
      },
    });

    console.log(
      `Existing composites count for compositeTermId ${compositeTermId}:`,
      existingComposites.length,
    );

    // 2개 이상일 때만 자식 간 순차적 관계 생성 및 BizTermCompositeRel 생성
    if (existingComposites.length >= 2) {
      // 이전 자식 (바로 앞 순서의 자식)
      const previousChild = existingComposites[existingComposites.length - 2];
      const currentChild = compositeTermChildId; // 방금 추가된 자식

      // ✅ 이전 자식(parent)과 현재 자식(passive) 간의 순차적 소속관계 생성
      let childToChildRelation = await relRepository.findOne({
        where: {
          parentTermId: previousChild.compositeTermChildId,
          passiveTermId: currentChild,
          relType: 'COMPOSITION',
        },
      });

      let childRelationId: number;

      if (childToChildRelation) {
        // 이미 관계가 존재하면 기존 ID 사용
        childRelationId = childToChildRelation.termRelId;
        console.log('Found existing child-to-child relation:', childRelationId);
      } else {
        // 자식 간 순차적 관계 생성
        const maxChildRelResult = await relRepository
          .createQueryBuilder('rel')
          .select('COALESCE(MAX(rel.rel_id::integer), 0)', 'maxId')
          .getRawOne();

        const newChildRelId = parseInt(maxChildRelResult.maxId) + 1;

        const newChildRelation = relRepository.create({
          termRelId: newChildRelId,
          parentTermId: previousChild.compositeTermChildId, // 이전 자식이 parent
          passiveTermId: currentChild, // 현재 자식이 passive
          relType: 'COMPOSITION',
          rel_expln: '복합구성용어 내부 순차적 관계',
          owner: 'system',
          createDateTime: new Date(),
        });

        const savedChildRelation = await relRepository.save(newChildRelation);
        childRelationId = savedChildRelation.termRelId;

        console.log('Created new child-to-child relation:', {
          relationId: childRelationId,
          parentTermId: previousChild.compositeTermChildId,
          passiveTermId: currentChild,
        });
      }

      // BizTermCompositeRel 생성 - compositeId에 해당하는 기존 관계들 조회
      const existingCompositeRels = await compositeRelRepository.find({
        where: {
          compositeId: compositeTermId,
        },
        order: {
          compositeTermOrder: 'DESC',
        },
      });

      // 다음 compositeTermOrder 계산 (기존 최대값 + 1, 없으면 1)
      const nextOrder =
        existingCompositeRels.length > 0
          ? Number(existingCompositeRels[0].compositeTermOrder) + 1
          : 1;

      // BizTermCompositeRel의 최대 trm_composite_rel_id 조회
      const maxCompositeRelIdResult = await compositeRelRepository
        .createQueryBuilder('rel')
        .select('COALESCE(MAX(rel.trm_composite_rel_id::integer), 0)', 'maxId')
        .getRawOne();

      const newCompositeRelId = parseInt(maxCompositeRelIdResult.maxId) + 1;

      // BizTermCompositeRel 생성
      const compositeRel = compositeRelRepository.create({
        termCompositerRelId: newCompositeRelId,
        compositeId: compositeTermId, // 복합용어 ID
        compositeRelId: childRelationId, // ✅ 자식들 간의 순차적 관계 ID
        compositeTermOrder: nextOrder,
        createDateTime: new Date(),
      });

      await compositeRelRepository.save(compositeRel);

      console.log(
        'Created composite relation with sequential child relation:',
        {
          compositeRel,
          childRelationId,
          previousChildId: previousChild.compositeTermChildId,
          currentChildId: currentChild,
        },
      );
    } else {
      console.log(
        'Skipping BizTermCompositeRel creation - need at least 2 composites',
      );
    }

    return savedComposite;
  }

  /**
   * 기존 복합용어에 구성용어만 추가 (용어 타입 변경 없이)
   */
  async addBizTermCompositeChild(
    compositeTermId: number,
    compositeTermChildId: number,
  ): Promise<BizTermComposite> {
    return await this.dataSource.transaction(async (manager) => {
      // 복합용어 존재 및 타입 확인
      const compositeTerm = await manager.getRepository(BizTerm).findOne({
        where: { termId: compositeTermId },
      });

      if (!compositeTerm) {
        throw new NotFoundException(
          `용어 ID ${compositeTermId}를 찾을 수 없습니다.`,
        );
      }

      if (compositeTerm.termType !== 'COMPOSITE') {
        throw new BadRequestException('복합용어 타입이 아닙니다.');
      }

      return await this.addCompositeChild(
        compositeTermId,
        compositeTermChildId,
        manager,
      );
    });
  }

  /**
   * 복합구성요소 자식 삭제
   */
  async deleteBizTermCompositeChild(
    compositeTermId: number,
    compositeTermChildId: number,
  ): Promise<void> {
    return await this.dataSource.transaction(async (manager) => {
      const compositeRepo = manager.getRepository(BizTermComposite);
      const compositeRelRepo = manager.getRepository(BizTermCompositeRel);
      const relRepo = manager.getRepository(BizTermRel);

      // 1. 삭제할 자식 요소 찾기
      const targetComposite = await compositeRepo.findOne({
        where: {
          compositeTermId,
          compositeTermChildId,
        },
      });

      if (!targetComposite) {
        throw new NotFoundException(
          `복합구성용어 ID ${compositeTermId}의 자식 ID ${compositeTermChildId}를 찾을 수 없습니다.`,
        );
      }

      const deletedSortOrder = targetComposite.sortOrder;
      const deletedCompositeId = targetComposite.compositeId;

      // ✅ sortOrder가 null인 경우 처리
      if (deletedSortOrder === null || deletedSortOrder === undefined) {
        throw new BadRequestException('삭제할 항목의 sortOrder가 없습니다.');
      }

      console.log(
        `Deleting composite child: compositeId=${deletedCompositeId}, sortOrder=${deletedSortOrder}`,
      );

      // 2. 해당 복합용어의 모든 자식 조회 (sortOrder 순서대로)
      const allChildren = await compositeRepo.find({
        where: {
          compositeTermId: compositeTermId,
        },
        order: {
          sortOrder: 'ASC',
        },
      });

      // 3. BizTermComposite에서 삭제
      await compositeRepo.delete({
        compositeId: deletedCompositeId,
      });

      // 4. 삭제된 자식의 부모-자식 관계도 삭제
      await relRepo.delete({
        parentTermId: compositeTermId,
        passiveTermId: compositeTermChildId,
        relType: 'COMPOSITION',
      });

      // 5. 자식 간 순차적 관계 삭제 (삭제된 자식과 관련된 관계들)
      // 이전 자식 -> 삭제된 자식
      if (deletedSortOrder > 1) {
        const prevChild = allChildren.find(
          (c) => c.sortOrder === deletedSortOrder - 1,
        );
        if (prevChild) {
          await relRepo.delete({
            parentTermId: prevChild.compositeTermChildId,
            passiveTermId: compositeTermChildId,
            relType: 'COMPOSITION',
          });
        }
      }

      // 삭제된 자식 -> 다음 자식
      if (deletedSortOrder < allChildren.length) {
        const nextChild = allChildren.find(
          (c) => c.sortOrder === deletedSortOrder + 1,
        );
        if (nextChild) {
          await relRepo.delete({
            parentTermId: compositeTermChildId,
            passiveTermId: nextChild.compositeTermChildId,
            relType: 'COMPOSITION',
          });
        }
      }

      // 6. 삭제 후 남은 자식들의 sortOrder 재배치
      const remainingChildren = allChildren.filter(
        (c) => c.compositeId !== deletedCompositeId,
      );

      for (let i = 0; i < remainingChildren.length; i++) {
        const newSortOrder = i + 1;
        const child = remainingChildren[i];

        if (child.sortOrder !== newSortOrder) {
          await compositeRepo.update(
            { compositeId: child.compositeId },
            { sortOrder: newSortOrder },
          );
        }
      }

      // 7. BizTermCompositeRel 재생성
      // 기존 BizTermCompositeRel 전체 삭제
      await compositeRelRepo.delete({ compositeId: compositeTermId });

      console.log(
        `Deleted all BizTermCompositeRel for compositeId=${compositeTermId}`,
      );

      // 8. 재배치된 순서에 따라 자식 간 관계 재생성
      if (remainingChildren.length >= 2) {
        // 재배치된 자식들 다시 조회
        const reorderedChildren = await compositeRepo.find({
          where: {
            compositeTermId: compositeTermId,
          },
          order: {
            sortOrder: 'ASC',
          },
        });

        for (let i = 1; i < reorderedChildren.length; i++) {
          const prevChild = reorderedChildren[i - 1];
          const currChild = reorderedChildren[i];

          // 이전 자식 -> 현재 자식 간의 순차적 관계 찾기 또는 생성
          let childToChildRel = await relRepo.findOne({
            where: {
              parentTermId: prevChild.compositeTermChildId,
              passiveTermId: currChild.compositeTermChildId,
              relType: 'COMPOSITION',
            },
          });

          let childRelationId: number;

          if (childToChildRel) {
            childRelationId = childToChildRel.termRelId;
            console.log(
              `Found existing child-to-child relation: ${childRelationId}`,
            );
          } else {
            // 새로운 관계 생성
            const maxRelResult = await relRepo
              .createQueryBuilder('rel')
              .select('COALESCE(MAX(rel.rel_id::integer), 0)', 'maxId')
              .getRawOne();

            const newRelId = parseInt(maxRelResult.maxId) + 1;

            const newRel = relRepo.create({
              termRelId: newRelId,
              parentTermId: prevChild.compositeTermChildId,
              passiveTermId: currChild.compositeTermChildId,
              relType: 'COMPOSITION',
              rel_expln: '복합구성용어 내부 순차적 관계',
              owner: 'system',
              createDateTime: new Date(),
            });

            const savedRel = await relRepo.save(newRel);
            childRelationId = savedRel.termRelId;

            console.log(
              `Created new child-to-child relation: ${childRelationId} (${prevChild.compositeTermChildId} -> ${currChild.compositeTermChildId})`,
            );
          }

          // BizTermCompositeRel 생성
          const maxCompositeRelResult = await compositeRelRepo
            .createQueryBuilder('rel')
            .select(
              'COALESCE(MAX(rel.trm_composite_rel_id::integer), 0)',
              'maxId',
            )
            .getRawOne();

          const newCompositeRelId = parseInt(maxCompositeRelResult.maxId) + 1;

          const compositeRel = compositeRelRepo.create({
            termCompositerRelId: newCompositeRelId,
            compositeId: compositeTermId,
            compositeRelId: childRelationId,
            compositeTermOrder: i, // 1부터 시작
            createDateTime: new Date(),
          });

          await compositeRelRepo.save(compositeRel);

          console.log(
            `Created BizTermCompositeRel: order ${i}, relId ${childRelationId}`,
          );
        }
      }

      console.log(
        `Successfully deleted composite child and reorganized relations`,
      );
    });
  }

  /**
   * 복합구성용어 자식간 순서 선택
   */
  async updateCompositeChildOrder(
    compositeId: number,
    compositeTermOrder: number,
    compositeRelId: number,
  ): Promise<any> {
    // 현재 항목 존재 확인
    const composite = await this.bizTermCompositeRelRepository.findOne({
      where: { compositeId, compositeTermOrder },
    });

    if (!composite) {
      throw new NotFoundException(
        `복합구성용어 ID ${compositeId}의 자식 순서 ${compositeTermOrder}를 찾을 수 없습니다.`,
      );
    }

    // compositeRelId(관계번호) 업데이트
    await this.bizTermCompositeRelRepository
      .createQueryBuilder()
      .update(BizTermCompositeRel)
      .set({ compositeRelId: compositeRelId })
      .where(
        'composite_id = :compositeId AND composite_trm_order = :compositeTermOrder',
        {
          compositeId,
          compositeTermOrder,
        },
      )
      .execute();

    // 업데이트된 엔티티 다시 조회
    const updated = await this.bizTermCompositeRelRepository.findOne({
      where: { compositeId, compositeTermOrder },
    });

    if (!updated) {
      throw new NotFoundException('업데이트 후 항목을 찾을 수 없습니다.');
    }

    // compositeRelId에 해당하는 BizTermRel 조회 (findAll과 동일한 방식)
    let relationDetail: BizTermRel | null = null;
    if (updated.compositeRelId) {
      relationDetail = await this.bizTermRelRepository.findOne({
        where: {
          termRelId: Number(updated.compositeRelId),
        },
      });
    }

    // findAll의 compositeRelations와 동일한 구조로 반환
    return {
      ...updated,
      relationDetail: relationDetail,
    };
  }

  /**
   * 전달된 정보를 기반으로 복합구성요소 순서 변경
   */
  async changeCompositeChildrenOrder(payload: {
    compositeId: number;
    compositeTermName?: string;
    movedChild?: {
      childId: string;
      termId: number;
      termName: string;
      oldOrder: number;
      newOrder: number;
    };
    affectedChildren?: Array<{
      childId: string;
      termId: number;
      termName: string;
      compositeId: number;
      termRelId: string;
      orderChange: { from: number; to: number };
    }>;
    allChildrenOrder: Array<{
      childId: string;
      termId: number;
      termName: string;
      compositeId: number | string;
      termRelId: string;
      sortOrder: number | string;
    }>;
  }): Promise<BizTermComposite[]> {
    const parentCompositeTermId = Number(payload.compositeId);
    const items = payload.allChildrenOrder || [];
    const movedChild = payload.movedChild;
    const affectedChildren = payload.affectedChildren || [];

    if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestException('allChildrenOrder 데이터가 필요합니다.');
    }

    // 트랜잭션으로 안전하게 업데이트
    return await this.dataSource.transaction(async (manager) => {
      const compositeRepo = manager.getRepository(BizTermComposite);
      const relRepo = manager.getRepository(BizTermRel);
      const compositeRelRepo = manager.getRepository(BizTermCompositeRel);

      const ids = items.map((it) => Number(it.compositeId));

      // 대상 레코드 조회 및 유효성 검사
      const existing = await compositeRepo.find({
        where: { compositeId: In(ids) },
        order: { sortOrder: 'ASC' },
      });

      if (existing.length !== ids.length) {
        throw new NotFoundException(
          '전달된 compositeId 중 존재하지 않는 항목이 있습니다.',
        );
      }

      const invalid = existing.find(
        (rec) => Number(rec.compositeTermId) !== parentCompositeTermId,
      );
      if (invalid) {
        throw new BadRequestException(
          `compositeId ${invalid.compositeId}는 compositeTermId ${parentCompositeTermId}에 속하지 않습니다.`,
        );
      }

      // ✅ movedChild와 affectedChildren 정보를 활용하여 새로운 순서 계산
      const newOrderMap = new Map<number, number>();

      if (movedChild) {
        // 이동된 항목의 새 순서
        const movedCompositeId = items.find(
          (it) => Number(it.termId) === Number(movedChild.termId),
        )?.compositeId;
        if (movedCompositeId) {
          newOrderMap.set(Number(movedCompositeId), movedChild.newOrder);
        }
      }

      // 영향받은 항목들의 새 순서
      if (affectedChildren && affectedChildren.length > 0) {
        affectedChildren.forEach((affected) => {
          newOrderMap.set(
            Number(affected.compositeId),
            affected.orderChange.to,
          );
        });
      }

      // 나머지 항목들은 기존 순서 유지
      items.forEach((item) => {
        const cid = Number(item.compositeId);
        if (!newOrderMap.has(cid)) {
          newOrderMap.set(cid, Number(item.sortOrder));
        }
      });

      console.log('New order map:', Object.fromEntries(newOrderMap));

      // ✅ sortOrder 업데이트 (BizTermComposite)
      for (const [compositeId, newOrder] of newOrderMap.entries()) {
        await compositeRepo.update({ compositeId }, { sortOrder: newOrder });
      }

      // ✅ 자식 간 관계 업데이트 (BizTermCompositeRel)
      // 순서가 변경되었으므로 자식 간 순차적 관계도 다시 생성해야 함
      const updatedComposites = await compositeRepo.find({
        where: { compositeTermId: parentCompositeTermId },
        order: { sortOrder: 'ASC' },
      });

      // 기존 BizTermCompositeRel 삭제
      await compositeRelRepo.delete({ compositeId: parentCompositeTermId });

      // 새로운 순서에 따라 자식 간 관계 재생성
      if (updatedComposites.length >= 2) {
        for (let i = 1; i < updatedComposites.length; i++) {
          const prevChild = updatedComposites[i - 1];
          const currChild = updatedComposites[i];

          // 자식 간 순차적 관계 찾기 또는 생성
          let childToChildRel = await relRepo.findOne({
            where: {
              parentTermId: prevChild.compositeTermChildId,
              passiveTermId: currChild.compositeTermChildId,
              relType: 'COMPOSITION',
            },
          });

          let childRelationId: number;

          if (childToChildRel) {
            childRelationId = childToChildRel.termRelId;
          } else {
            // 새로운 관계 생성
            const maxRelResult = await relRepo
              .createQueryBuilder('rel')
              .select('COALESCE(MAX(rel.rel_id::integer), 0)', 'maxId')
              .getRawOne();

            const newRelId = parseInt(maxRelResult.maxId) + 1;

            const newRel = relRepo.create({
              termRelId: newRelId,
              parentTermId: prevChild.compositeTermChildId,
              passiveTermId: currChild.compositeTermChildId,
              relType: 'COMPOSITION',
              rel_expln: '복합구성용어 내부 순차적 관계',
              owner: 'system',
              createDateTime: new Date(),
            });

            const savedRel = await relRepo.save(newRel);
            childRelationId = savedRel.termRelId;
          }

          // BizTermCompositeRel 생성
          const maxCompositeRelResult = await compositeRelRepo
            .createQueryBuilder('rel')
            .select(
              'COALESCE(MAX(rel.trm_composite_rel_id::integer), 0)',
              'maxId',
            )
            .getRawOne();

          const newCompositeRelId = parseInt(maxCompositeRelResult.maxId) + 1;

          const compositeRel = compositeRelRepo.create({
            termCompositerRelId: newCompositeRelId,
            compositeId: parentCompositeTermId,
            compositeRelId: childRelationId,
            compositeTermOrder: i, // 1부터 시작
            createDateTime: new Date(),
          });

          await compositeRelRepo.save(compositeRel);

          console.log(
            `Created BizTermCompositeRel: order ${i}, relId ${childRelationId}`,
          );
        }
      }

      return updatedComposites;
    });
  }
}
