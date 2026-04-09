import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const encodedKey = new TextEncoder().encode(secretKey);

export interface EmployeePayload {
  employee_id: number;
  store_id: number;
  name: string;
}

export async function signEmployeeToken(payload: EmployeePayload) {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(encodedKey);
}

export async function verifyEmployeeToken(
  token: string,
): Promise<EmployeePayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as EmployeePayload;
  } catch {
    return null;
  }
}

export async function getEmployeeSession(): Promise<EmployeePayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("employee_session")?.value;
  if (!token) return null;
  return verifyEmployeeToken(token);
}
