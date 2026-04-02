const SCOPES = [
  "email",
  "profile",
  "https://www.googleapis.com/auth/webmasters.readonly",
]

export function getGoogleOAuthScopes() {
  return SCOPES.join(" ")
}
