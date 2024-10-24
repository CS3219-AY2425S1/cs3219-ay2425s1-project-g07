import { registerAs } from '@nestjs/config';

export default registerAs('config', () => ({
  questionServiceDomain: process.env.QUESTION_SERVICE_DOMAIN,
}));
