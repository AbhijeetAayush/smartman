import { saveItem } from './ddb-utils';
import { cacheSet } from './redis-utils';
import { RequestHistory } from '../types/model';
import fetch from 'node-fetch';

export const executeRequest = async (url: string, method: string, body?: any): Promise<any> => {
    const response = await fetch(url, {
        method,
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
    return await response.json();
};

export const saveRequestHistory = async (userId: string, history: RequestHistory): Promise<void> => {
    const item = {
        PK: `USER#${userId}`,
        SK: `HISTORY#${Date.now()}`,
        Type: 'HISTORY',
        createdAt: new Date().toISOString(),
        data: history,
    };
    await saveItem(process.env.TABLE_NAME!, item);
    await cacheSet(`history:${user.userId}`, JSON.stringify({ history: [item.data] }), 3600); // Cache for 1 hour
};
