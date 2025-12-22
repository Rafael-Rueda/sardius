import { IGoogleAuthProvider, IGoogleUser } from "@/domain/identity/application/providers/google-auth.provider";
import type { Env } from "@/env/env";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";

@Injectable()
export class GoogleAuthProvider implements IGoogleAuthProvider {
    private oauth2Client: OAuth2Client;

    constructor(configService: ConfigService<Env, true>) {
        this.oauth2Client = new google.auth.OAuth2(
            configService.get("GOOGLE_OAUTH2_CLIENT_ID", { infer: true }),
            configService.get("GOOGLE_OAUTH2_CLIENT_SECRET", { infer: true }),
            configService.get("GOOGLE_OAUTH2_REDIRECT_URL", { infer: true }),
        );
    }

    getRedirectUrl(): string {
        return this.oauth2Client.generateAuthUrl({
            access_type: "offline",
            scope: [
                "https://www.googleapis.com/auth/userinfo.profile",
                "https://www.googleapis.com/auth/userinfo.email",
            ],
        });
    }

    async getUserFromCode(code: string): Promise<IGoogleUser> {
        // 1. Exchange the authorization code for tokens
        const { tokens } = await this.oauth2Client.getToken(code);
        this.oauth2Client.setCredentials(tokens);

        // 2. Fetch user data using the oauth2 lib
        const oauth2 = google.oauth2({ version: "v2", auth: this.oauth2Client });
        const { data } = await oauth2.userinfo.get();

        // 3. Return a clean object, decoupling the lib from the rest of the app
        return {
            id: data.id as string,
            email: data.email as string,
            name: data.name as string,
        };
    }
}
