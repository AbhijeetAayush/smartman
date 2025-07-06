import * as jwt from 'jsonwebtoken';
import { User } from '../types/model';

export const validateJwt = async (token: string): Promise<User> => {
    console.log('Starting JWT validation for token:', token.substring(0, 20) + '...'); // Log first 20 chars for brevity
    try {
        const secret = process.env.SUPABASE_JWT_SECRET;
        if (!secret) {
            console.error('Supabase JWT secret is not configured in environment variables');
            throw new Error('Server configuration error');
        }
        console.log('Using secret for verification:', secret.substring(0, 10) + '...'); // Log first 10 chars for security

        const decoded = jwt.verify(token, secret) as { sub: string; email?: string };
        console.log('JWT validated successfully:', { sub: decoded.sub, email: decoded.email });
        return { userId: decoded.sub, email: decoded.email };
    } catch (error: any) {
        console.error('JWT Validation Error:', {
            message: error.message,
            code: error.code,
            name: error.name,
            stack: error.stack,
        });
        throw new Error('Invalid JWT');
    }
};
