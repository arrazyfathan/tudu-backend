import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import {User} from '../../generated/prisma/client';
import {Token} from "../models/token.model";

export function generateAccessToken(user: User): string {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
        throw new Error('JWT_ACCESS_SECRET is not defined in environment variables');
    }
    return jwt.sign({id: user.id}, secret, {expiresIn: '1h'});
}

export function generateRefreshToken(): string {
    return crypto.randomBytes(16).toString('base64url');
}

export function generateTokens(user: User): Token {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();
    return {access_token: accessToken, refresh_token: refreshToken};
}

