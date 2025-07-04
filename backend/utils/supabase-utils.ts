import * as jwt from 'jsonwebtoken';
import { User } from '../types/model';

export const validateJwt = async (token: string): Promise<User> => {
    try {
        const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET!) as { sub: string; email?: string };
        return { userId: decoded.sub, email: decoded.email };
    } catch (error) {
        throw new Error('Invalid JWT');
    }
};
