import { saveItem, getItems, deleteItem } from './ddb-utils';
import { Collection } from '../types/model';

export const saveCollection = async (userId: string, name: string, items: string[]): Promise<void> => {
    const item = {
        PK: `USER#${userId}`,
        SK: `COLLECTION#${Date.now()}`,
        Type: 'COLLECTION',
        createdAt: new Date().toISOString(),
        data: { collectionName: name, items },
    };
    await saveItem(process.env.TABLE_NAME!, item);
};

export const listCollections = async (userId: string): Promise<Collection[]> => {
    const result = await getItems(process.env.TABLE_NAME!, { PK: `USER#${userId}` }, 'SK begins_with COLLECTION#');
    return result.Items ? result.Items.map((item) => item.data as Collection) : [];
};

export const deleteCollection = async (userId: string, collectionId: string): Promise<void> => {
    const key = { PK: `USER#${userId}`, SK: `COLLECTION#${collectionId}` };
    await deleteItem(process.env.TABLE_NAME!, key);
};
