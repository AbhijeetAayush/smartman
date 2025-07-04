import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { validateJwt } from '../../../../utils/supabase-utils';
import { getUserProfile } from '../../../../utils/auth-db-handler';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const authHeader = event.headers.Authorization || '';
        const token = authHeader.replace('Bearer ', '');
        const user = await validateJwt(token);

        const profile = await getUserProfile(user.userId);

        return { statusCode: 200, body: JSON.stringify({ profile }) };
    } catch (error: any) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message || 'Failed to get profile' }) };
    }
};
