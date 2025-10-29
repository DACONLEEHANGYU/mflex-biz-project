import { Controller, Get } from '@nestjs/common';
import { BizTerm } from './bizTerms/bizTerm.entity';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
