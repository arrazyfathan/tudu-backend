import crypto from "crypto";

export const hash = (token: string) => {
    return crypto.createHash('sha256').update(token).digest('hex');
}