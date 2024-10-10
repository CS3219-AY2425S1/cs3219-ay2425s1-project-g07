import { registerAs } from '@nestjs/config';

export default registerAs('config', () => ({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  queueUrl: process.env.QUEUE_URL,
}));
