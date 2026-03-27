import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { PublicLeadController } from './public-lead.controller';
import { Lead, LeadSchema } from './lead.schema';
import { Quote, QuoteSchema } from '../calculator/schemas/quote.schema';
import { AutomationModule } from '../automation/automation.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lead.name, schema: LeadSchema },
      { name: Quote.name, schema: QuoteSchema },
    ]),
    forwardRef(() => AutomationModule),
    ActivityModule,
  ],
  controllers: [LeadsController, PublicLeadController],
  providers: [LeadsService],
  exports: [LeadsService, MongooseModule],
})
export class LeadsModule {}
