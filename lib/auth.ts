import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(
  process.env.ADMIN_SECRET || 'fallback-secret-change-me'
)

export async function signAdminToken(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret)
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, secret)
    return true
  } catch {
    return false
  }
}
