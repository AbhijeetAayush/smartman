import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { validateJwt } from '../../../../utils/supabase-utils';
import { listCollections } from '../../../../utils/collections-db-handler';
import { cacheGet, cacheSet } from '../../../../utils/redis-utils';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const authHeader = event.headers.Authorization || '';
        const token = authHeader.replace('Bearer ', '');
        const user = await validateJwt(token);

        const cacheKey = `collections:${user.userId}`;
        const cachedCollections = await cacheGet(cacheKey);
        if (cachedCollections) {
            return { statusCode: 200, body: cachedCollections };
        }

        const collections = await listCollections(user.userId);
        await cacheSet(cacheKey, JSON.stringify({ collections }), 3600);

        return { statusCode: 200, body: JSON.stringify({ collections }) };
    } catch (error: any) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message || 'Failed to list collections' }) };
    }
};
