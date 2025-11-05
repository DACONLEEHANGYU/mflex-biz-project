import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { BizTermService } from './bizTerm.service';
import { BizTerm } from './bizTerm.entity';
import { BizTermRel } from './bizTermRel.entity';

@Controller('biz-terms')
export class BizTermController {
  constructor(private readonly bizTermService: BizTermService) {}

  @Get()
  async findAll(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('search') search?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 100;
    const parsedOffset = offset ? parseInt(offset, 10) : 0;
    return await this.bizTermService.findAll(
      parsedLimit,
      parsedOffset,
      search,
    );
  }

  @Get(':id/related')
  async findTermWithRelatedTerms(@Param('id') id: number) {
    return await this.bizTermService.findTermWithRelatedTerms(id);
  }

  @Post()
  async addBizTerm(@Body() bizTerm: BizTerm) {
    return await this.bizTermService.addBizTerm(bizTerm);
  }

  @Delete(':id')
  async deleteBizTerm(@Param('id') id: number) {
    return await this.bizTermService.deleteBizTerm(id);
  }

  @Post('/relation')
  async addBizTermRel(@Body() bizTermRel: Partial<BizTermRel>) {
    return await this.bizTermService.addBizTermRel(bizTermRel);
  }

  @Delete('/relation/:id')
  async deleteBizTermRel(@Param('id') id: number) {
    return await this.bizTermService.deleteBizTermRel(id);
  }

  // @Get('test-db')
  // async testDbQuery() {
  //   return await this.bizTermService.testDirectQuery();
  // }

  // @Get('test-entity')
  // async testEntity() {
  //   return await this.bizTermService.testEntityQuery();
  // }

  // @Put('/update-term-type/:id')
  // async updateTermToComposite(@Param('id') id: number) {
  //   return await this.bizTermService.updateTermToComposite(id);
  // }

  @Post('/composite/child')
  async addCompositeChild(
    @Body('compositeTermId') compositeTermId: number,
    @Body('compositeTermChildId') compositeTermChildId: number,
  ) {
    return await this.bizTermService.addCompositeChild(
      compositeTermId,
      compositeTermChildId,
    );
  }

  @Post('/composite')
  async addBizTermComposite(
    @Body('compositeTermId') compositeTermId: number,
    @Body('compositeTermChildId') compositeTermChildId: number,
  ) {
    return await this.bizTermService.addBizTermComposite(
      compositeTermId,
      compositeTermChildId,
    );
  }

  @Delete(
    '/composite/compositeId/:compositeTermId/childId/:compositeTermChildId',
  )
  async deleteBizTermCompositeChild(
    @Param('compositeTermId') compositeTermId: number,
    @Param('compositeTermChildId') compositeTermChildId: number,
  ) {
    return await this.bizTermService.deleteBizTermCompositeChild(
      compositeTermId,
      compositeTermChildId,
    );
  }

  @Get('/composite-relations/:compositeId')
  async getCompositeRelations(@Param('compositeId') compositeId: number) {
    return await this.bizTermService.getCompositeRelationsByCompositeId(
      compositeId,
    );
  }

  @Put('/composite/order')
  async updateCompositeChildOrder(
    @Body('compositeId') compositeId: number,
    @Body('compositeTermOrder') compositeTermOrder: number,
    @Body('compositeRelId') compositeRelId: number,
  ) {
    return await this.bizTermService.updateCompositeChildOrder(
      compositeId,
      compositeTermOrder,
      compositeRelId,
    );
  }

  @Put('/composite/change-order')
  async changeCompositeChildrenOrder(@Body() payload: any) {
    console.log('Received payload:', JSON.stringify(payload, null, 2));
    return await this.bizTermService.changeCompositeChildrenOrder(payload);
  }
}
