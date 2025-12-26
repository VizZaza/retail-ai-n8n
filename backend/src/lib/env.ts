import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(8),
  INTERNAL_API_KEY: z.string().min(8),
  ADMIN_EMAIL: z.string().default('admin@local'),
  ADMIN_PASSWORD: z.string().default('admin123'),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_BASE_URL: z.string().default('https://api.openai.com/v1'),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
});

export const env = EnvSchema.parse(process.env);
