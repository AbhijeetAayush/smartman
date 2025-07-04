import { saveItem, getItem } from './ddb-utils';
import { UserProfile } from '../types/model';

export const saveUserProfile = async (userId: string, profile: UserProfile): Promise<void> => {
    const item = {
        PK: `USER#${userId}`,
        SK: 'PROFILE',
        Type: 'USER',
        createdAt: new Date().toISOString(),
        data: profile,
    };
    await saveItem(process.env.TABLE_NAME!, item);
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    const result = await getItem(process.env.TABLE_NAME!, { PK: `USER#${userId}`, SK: 'PROFILE' });
    return result.Item ? (result.Item.data as UserProfile) : null;
};

export const updateUserProfile = async (
    userId: string,
    updates: { name?: string; preferences?: Record<string, any> },
): Promise<void> => {
    const existingProfile = (await getUserProfile(userId)) || {};
    const updatedProfile = { ...existingProfile, ...updates };
    await saveUserProfile(userId, updatedProfile);
};
