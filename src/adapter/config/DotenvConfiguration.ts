import dotenv from 'dotenv';
import { keyblade } from 'keyblade';
import { Configuration } from '../../core/port/Configuration';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
const env = keyblade(process.env);

export const dotenvConfiguration: Configuration = {
  server: { port: Number(env.SERVER_PORT), environment: env.ENVIRONMENT },
  secrets: {
    googleBardCookies: String(env.GOOGLE_BARD_COOKIES),
    openAiKey: String(env.OPENAI_API_KEY),
    openAiOrganization: String(env.OPENAI_API_ORGANIZATION),
  },
  database: {
    connectionString: String(env.DATABASE_CONNECTION_STRING),
  },
};
