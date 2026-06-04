const vercelUrl = process.env.VERCEL_URL;

if (!process.env.NEXTAUTH_URL && vercelUrl) {
  process.env.NEXTAUTH_URL = vercelUrl.startsWith("http") ? vercelUrl : `https://${vercelUrl}`;
}

export const authSecret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET ?? "b2-game-club-demo-secret";
