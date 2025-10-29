import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BizTerm } from './bizTerms/bizTerm.entity';
import { BizTermRel } from './bizTerms/bizTermRel.entity';
import { BizTermComposite } from './bizTerms/bizTermComposite.entity';
import { BizTermCompositeRel } from './bizTerms/bizTermCompositeRel.entity';
import { BizTermModule } from './bizTerms/bizTerm.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '112.217.190.130',
      port: 5432,
      username: 'hglee',
      password: 'rNd25$!',
      database: 'rnd',
      schema: 'bizmeta',
      entities: [BizTerm, BizTermRel, BizTermComposite, BizTermCompositeRel],
      synchronize: false,
    }),
    BizTermModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
