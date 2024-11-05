import { registerAs } from '@nestjs/config';

export default registerAs('config', () => ({
  questionServiceDomain: process.env.QUESTION_SERVICE_DOMAIN,
  kafkaBrokerUri: process.env.KAFKA_BROKER_URI,
  consumerGroupId: process.env.COLLAB_SERVICE_CONSUMER_GROUP_ID,
}));
