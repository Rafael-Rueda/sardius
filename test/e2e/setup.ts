import dotenv from "dotenv";
import { execSync } from "node:child_process";
import path from "node:path";

export default async function globalSetup() {
    dotenv.config({ path: path.resolve(process.cwd(), ".env.test"), override: true });

    console.log("\n🔧 Setting up test database...");

    try {
        execSync("npx prisma db push", {
            env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
            stdio: "inherit",
        });
        console.log("✅ Test database schema synchronized");
    } catch (error) {
        console.error("❌ Failed to sync test database schema:", error);
        throw error;
    }
}
