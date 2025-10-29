import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BizTerm } from './bizTerm.entity';
import { BizTermService } from './bizTerm.service';
import { BizTermController } from './bizTerm.controller';
import { BizTermRel } from './bizTermRel.entity';
import { BizTermComposite } from './bizTermComposite.entity';
import { BizTermCompositeRel } from './bizTermCompositeRel.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BizTerm,
      BizTermRel,
      BizTermComposite,
      BizTermCompositeRel,
    ]),
  ],
  providers: [BizTermService],
  controllers: [BizTermController],
  exports: [BizTermService],
})
export class BizTermModule {}
