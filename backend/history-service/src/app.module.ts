import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AppService } from './app.service';
import {
  QuestionHistory,
  QuestionHistorySchema,
} from './schemas/history.schema';

import { QuestionHistoryController } from './controllers/history.controller';
import { QuestionHistoryService } from './services/history.services';

const connection_uri = process.env.HISTORY_SERVICE_MONGODB_URI;

if (!connection_uri) {
  throw new Error(
    'Please define the HISTORY_SERVICE_MONGODB_URI environment variable inside .env',
  );
}

@Module({
  imports: [
    MongooseModule.forRoot(connection_uri),
    MongooseModule.forFeature([
      {
        name: QuestionHistory.name,
        schema: QuestionHistorySchema,
      },
    ]),
  ],
  controllers: [AppController, QuestionHistoryController],
  providers: [AppService, QuestionHistoryService],
})
export class AppModule {}
