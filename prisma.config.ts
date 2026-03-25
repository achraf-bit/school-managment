import { defineConfig } from 'prisma/config'
import "dotenv/config";

const isDev = process.env.APP_ENV === "dev";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: isDev ? process.env.SUPABASE_DATABASE_URL! : process.env.DATABASE_URL!,
  }
})