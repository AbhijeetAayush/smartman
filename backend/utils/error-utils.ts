export const formatError = (error: any): string => {
    return `Error: ${error.message || 'Unknown error'}`;
};

export const isRetryableError = (error: any): boolean => {
    const retryableStatuses = [500, 502, 503, 504];
    return error.status && retryableStatuses.includes(error.status);
};
