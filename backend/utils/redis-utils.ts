import fetch, { Response } from 'node-fetch';

interface UpstashResponse {
    result: string | null;
}

export const cacheSet = async (key: string, value: string, expiration: number): Promise<void> => {
    const url = `${process.env.UPSTASH_REDIS_REST_URL}/set/${encodeURIComponent(key)}`;
    const response: Response = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value, ex: expiration }),
    });
    if (!response.ok) throw new Error('Failed to set cache');
};

export const cacheGet = async (key: string): Promise<string | null> => {
    const url = `${process.env.UPSTASH_REDIS_REST_URL}/get/${encodeURIComponent(key)}`;
    const response: Response = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        },
    });
    if (!response.ok) throw new Error('Failed to get cache');
    const data: UpstashResponse = (await response.json()) as UpstashResponse;
    return data.result;
};
