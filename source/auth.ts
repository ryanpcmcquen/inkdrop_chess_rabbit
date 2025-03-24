import {
    AccessContext,
    HttpClient,
    OAuth2AuthCodePKCE,
} from "@bity/oauth2-auth-code-pkce";

export const lichessHost = "https://lichess.org";
export const scopes = [
    "preference:read",
    "preference:write",
    "email:read",
    "engine:read",
    "engine:write",
    "challenge:read",
    "challenge:write",
    "challenge:bulk",
    "study:read",
    "study:write",
    "tournament:write",
    "racer:write",
    "puzzle:read",
    "team:read",
    "team:write",
    "team:lead",
    "follow:read",
    "follow:write",
    "msg:write",
    "board:play",
    "bot:play",
    "web:mod",
];
export const clientId = "inkdrop.app";
export const clientUrl = (() => {
    const url = new URL(location.href);
    url.search = "";
    return url.href;
})();

export class Auth {
    oauth = new OAuth2AuthCodePKCE({
        authorizationUrl: `${lichessHost}/oauth`,
        tokenUrl: `${lichessHost}/api/token`,
        clientId,
        scopes,
        redirectUrl: clientUrl,
        onAccessTokenExpiry: (refreshAccessToken) => refreshAccessToken(),
        onInvalidGrant: (_retry) => {},
    });

    error?: any;
    accessContext?: AccessContext;

    email?: string;

    constructor(private redraw: () => void) {}

    async login() {
        // Redirect to authentication prompt.
        await this.oauth.fetchAuthorizationCode();
    }

    async init() {
        try {
            const hasAuthCode = await this.oauth.isReturningFromAuthServer();
            if (hasAuthCode) {
                // Might want to persist accessContext.token until the user logs out.
                this.accessContext = await this.oauth.getAccessToken();
                this.redraw();

                // Can also use this convenience wrapper for fetch() instead of
                // using manually using getAccessToken() and setting the
                // "Authorization: Bearer ..." header.
                const fetch = this.oauth.decorateFetchHTTPClient(window.fetch);
                await this.useApi(fetch);
            }
        } catch (err) {
            this.error = err;
            this.redraw();
        }
    }

    async useApi(fetch: HttpClient, url, options) {
        const res = await fetch(url, options);
        this.redraw();
    }

    // async logout() {
    //     const token = this.accessContext?.token?.value;
    //     this.accessContext = undefined;
    //     this.error = undefined;
    //     this.email = undefined;
    //     this.redraw();

    //     // Example request using vanilla fetch: Revoke access token.
    //     await fetch(`${lichessHost}/api/token`, {
    //         method: "DELETE",
    //         headers: {
    //             Authorization: `Bearer ${token}`,
    //         },
    //     });
    // }
}
