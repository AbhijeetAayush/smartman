import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { validateJwt } from '../../../../utils/supabase-utils';
import { updateUserProfile } from '../../../../utils/auth-db-handler';
import { validateUpdateProfileRequest } from '../../../../utils/validators';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const authHeader = event.headers.Authorization || '';
        const token = authHeader.replace('Bearer ', '');
        const user = await validateJwt(token);

        const request = JSON.parse(event.body || '{}');
        await validateUpdateProfileRequest(request);

        await updateUserProfile(user.userId, request);

        return { statusCode: 200, body: JSON.stringify({ message: 'Profile updated' }) };
    } catch (error: any) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message || 'Failed to update profile' }) };
    }
};
