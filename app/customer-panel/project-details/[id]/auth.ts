import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, SECRET);
    return decoded; // { userId, email, role, ... }
  } catch (err) {
    return null;
  }
}
