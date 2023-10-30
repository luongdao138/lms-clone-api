import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailSubscriber } from './subscribers/email.subscriber';

@Module({
  imports: [],
  providers: [EmailService, EmailSubscriber],
  exports: [EmailService],
})
export class EmailModule {}
