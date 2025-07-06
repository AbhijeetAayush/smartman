import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { validateJwt } from '../../../../utils/supabase-utils';
import { saveCollection } from '../../../utils/collections-db-handler';
import { validateCreateCollectionRequest } from '../../../../utils/validators';
import { cacheSet } from '../../../../utils/redis-utils';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const authHeader = event.headers.Authorization || '';
        const token = authHeader.replace('Bearer ', '');
        const user = await validateJwt(token);

        const request = JSON.parse(event.body || '{}');
        await validateCreateCollectionRequest(request);

        await saveCollection(user.userId, request.collectionName, request.items);
        await cacheSet(
            `collections:${user.userId}`,
            JSON.stringify({ collections: await listCollections(user.userId) }),
            3600,
        );

        return { statusCode: 200, body: JSON.stringify({ message: 'Collection saved' }) };
    } catch (error: any) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message || 'Failed to save collection' }) };
    }
};
