import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { validateJwt } from '../../../../utils/supabase-utils';
import { explainError } from '../../../../utils/error-utils';
import { cacheGet, cacheSet } from '../../../../utils/redis-utils';
import fetch from 'node-fetch';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const authHeader = event.headers.Authorization || '';
        const token = authHeader.replace('Bearer ', '');
        await validateJwt(token);

        const { errorMessage } = JSON.parse(event.body || '{}');
        if (!errorMessage) throw new Error('errorMessage is required');

        const cacheKey = `error:${errorMessage}`;
        const cachedExplanation = await cacheGet(cacheKey);
        if (cachedExplanation) {
            return { statusCode: 200, body: cachedExplanation };
        }

        const explanation = await explainError(errorMessage);
        await cacheSet(cacheKey, JSON.stringify({ explanation }), 86400); // Cache for 24 hours

        return { statusCode: 200, body: JSON.stringify({ explanation }) };
    } catch (error: any) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message || 'Failed to explain error' }) };
    }

    async function explainError(errorMessage: string): Promise<string> {
        const apiKey = process.env.DEEPSEEK_API_KEY;
        if (!apiKey) throw new Error('DEEPSEEK_API_KEY is not set');

        const response = await fetch('https://api.deepseek.com/explain', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ error: errorMessage }),
        });

        if (!response.ok) throw new Error('DeepSeek API request failed');
        const data = await response.json();
        return data.explanation || 'No explanation available';
    }
};
