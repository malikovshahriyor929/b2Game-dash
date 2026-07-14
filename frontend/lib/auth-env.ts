const vercelUrl = process.env.VERCEL_URL;

if (!process.env.NEXTAUTH_URL && vercelUrl) {
  process.env.NEXTAUTH_URL = vercelUrl.startsWith("http") ? vercelUrl : `https://${vercelUrl}`;
}

const defaultAuthSecret = "b2-game-club-demo-secret";
const configuredAuthSecret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;

if (process.env.NODE_ENV === "production" && (!configuredAuthSecret || configuredAuthSecret === defaultAuthSecret || configuredAuthSecret.length < 32)) {
  throw new Error("Production NEXTAUTH_SECRET/AUTH_SECRET must be custom and at least 32 characters");
}

export const authSecret = configuredAuthSecret ?? defaultAuthSecret;
