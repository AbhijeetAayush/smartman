import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { validateJwt } from '../../../../utils/supabase-utils';
import { executeRequest, saveRequestHistory } from '../../../../utils/history-db-handler';
import { cacheGet, cacheSet } from '../../../../utils/redis-utils';
import fetch from 'node-fetch';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const authHeader = event.headers.Authorization || '';
        const token = authHeader.replace('Bearer ', '');
        const user = await validateJwt(token);

        const request = JSON.parse(event.body || '{}');
        const { url, method = 'GET', body } = request;
        if (!url) throw new Error('URL is required');

        const cacheKey = `request:${user.userId}:${url}`;
        const cachedResponse = await cacheGet(cacheKey);
        if (cachedResponse) {
            return { statusCode: 200, body: cachedResponse };
        }

        const response = await executeRequest(url, method, body);
        await cacheSet(cacheKey, JSON.stringify(response), 3600); // Cache for 1 hour
        await saveRequestHistory(user.userId, { url, method, body, response });

        return { statusCode: 200, body: JSON.stringify(response) };
    } catch (error: any) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message || 'Failed to execute request' }) };
    }
};
