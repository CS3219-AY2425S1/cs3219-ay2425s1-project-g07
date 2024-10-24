import { registerAs } from '@nestjs/config';

export default registerAs('config', () => ({
  kafkaBrokerUri: process.env.KAFKA_BROKER_URI,
  consumerGroupId: process.env.MATCHING_WEBSOCKET_SERVICE_CONSUMER_GROUP_ID,
}));