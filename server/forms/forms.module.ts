import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EventsModule } from '../events/events.module';
import { FormsController } from './forms.controller';
import { InboxController } from './inbox.controller';
import { SubmissionsService } from './submissions.service';

@Module({
  imports: [AuthModule, EventsModule],
  controllers: [FormsController, InboxController],
  providers: [SubmissionsService],
})
export class FormsModule {}
