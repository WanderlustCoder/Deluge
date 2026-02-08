import { timingSafeEqual } from "crypto";

export function verifyCronRequest(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || !authHeader) return false;

  const expected = Buffer.from(`Bearer ${cronSecret}`);
  const received = Buffer.from(authHeader);

  // Prevent timing attacks by using constant-time comparison
  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
}
