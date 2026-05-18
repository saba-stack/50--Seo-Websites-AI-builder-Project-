import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { Role } from "@prisma/client";
import { authRepository } from "../repositories/authRepository";
import { AppError } from "../utils/appError";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { env } from "../config/env";
import { ttlToMs } from "../utils/duration";

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export class AuthService {
  async register(input: { email: string; password: string; role: Role; cityId?: string }) {
    const existing = await authRepository.findUserByEmail(input.email);
    if (existing) {
      throw new AppError("Email already exists", 409, "EMAIL_EXISTS");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await authRepository.createUser({
      email: input.email,
      passwordHash,
      role: input.role,
      cityId: input.cityId
    });

    return { id: user.id, email: user.email, role: user.role, cityId: user.cityId };
  }

  async login(input: { email: string; password: string }) {
    const user = await authRepository.findUserByEmail(input.email);
    if (!user || !user.isActive) {
      throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");

    const payload = {
      userId: user.id,
      role: user.role,
      cityId: user.cityId
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    const expiresAt = new Date(Date.now() + ttlToMs(env.JWT_REFRESH_TTL));
    await authRepository.createRefreshToken({
      tokenHash: hashToken(refreshToken),
      userId: user.id,
      expiresAt
    });
    await authRepository.updateLastLogin(user.id);

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role, cityId: user.cityId }
    };
  }

  async refresh(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);
    const tokenHash = hashToken(refreshToken);
    const tokenRecord = await authRepository.findRefreshToken(tokenHash);
    if (!tokenRecord || tokenRecord.userId !== payload.userId) {
      throw new AppError("Invalid refresh token", 401, "INVALID_REFRESH");
    }
    if (tokenRecord.expiresAt < new Date()) {
      throw new AppError("Refresh token expired", 401, "REFRESH_EXPIRED");
    }

    await authRepository.revokeRefreshToken(tokenRecord.id);
    const newPayload = { userId: payload.userId, role: payload.role, cityId: payload.cityId };
    const newAccessToken = signAccessToken(newPayload);
    const newRefreshToken = signRefreshToken(newPayload);
    await authRepository.createRefreshToken({
      tokenHash: hashToken(newRefreshToken),
      userId: payload.userId,
      expiresAt: new Date(Date.now() + ttlToMs(env.JWT_REFRESH_TTL))
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(userId: string) {
    await authRepository.revokeAllUserRefreshTokens(userId);
  }
}

export const authService = new AuthService();
