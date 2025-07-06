import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { validateJwt } from '../../../../utils/supabase-utils';
import { deleteCollection } from '../../../../utils/collections-db-handler';
import { cacheSet } from '../../../../utils/redis-utils';
import { listCollections } from '../../../../utils/collections-db-handler';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const authHeader = event.headers.Authorization || '';
        const token = authHeader.replace('Bearer ', '');
        const user = await validateJwt(token);

        const collectionId = event.pathParameters?.id;
        if (!collectionId) throw new Error('Collection ID is required');

        await deleteCollection(user.userId, collectionId);
        await cacheSet(
            `collections:${user.userId}`,
            JSON.stringify({ collections: await listCollections(user.userId) }),
            3600,
        );

        return { statusCode: 200, body: JSON.stringify({ message: 'Collection deleted' }) };
    } catch (error: any) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message || 'Failed to delete collection' }) };
    }
};
