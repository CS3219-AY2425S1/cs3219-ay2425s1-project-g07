import { registerAs } from '@nestjs/config';

export default registerAs('config', () => ({
  mongodb: {
    uri: process.env.MONGODB_URI,
    dbName: process.env.MONGODB_DB_NAME
  }
}));