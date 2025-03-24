"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.scopes = exports.lichessHost = exports.clientUrl = exports.clientId = exports.Auth = void 0;
var _oauth2AuthCodePkce = require("@bity/oauth2-auth-code-pkce");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const lichessHost = exports.lichessHost = "https://lichess.org";
const scopes = exports.scopes = ["preference:read", "preference:write", "email:read", "engine:read", "engine:write", "challenge:read", "challenge:write", "challenge:bulk", "study:read", "study:write", "tournament:write", "racer:write", "puzzle:read", "team:read", "team:write", "team:lead", "follow:read", "follow:write", "msg:write", "board:play", "bot:play", "web:mod"];
const clientId = exports.clientId = "inkdrop.app";
const clientUrl = exports.clientUrl = (() => {
  const url = new URL(location.href);
  url.search = "";
  return url.href;
})();
class Auth {
  constructor(redraw) {
    this.redraw = redraw;
    _defineProperty(this, "oauth", new _oauth2AuthCodePkce.OAuth2AuthCodePKCE({
      authorizationUrl: `${lichessHost}/oauth`,
      tokenUrl: `${lichessHost}/api/token`,
      clientId,
      scopes,
      redirectUrl: clientUrl,
      onAccessTokenExpiry: refreshAccessToken => refreshAccessToken(),
      onInvalidGrant: _retry => {}
    }));
    _defineProperty(this, "error", void 0);
    _defineProperty(this, "accessContext", void 0);
    _defineProperty(this, "email", void 0);
  }
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
        // await this.useApi(fetch);
      }
    } catch (err) {
      this.error = err;
      this.redraw();
    }
  }
  async useApi(fetch, url, options) {
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
exports.Auth = Auth;
//# sourceMappingURL=auth.js.map