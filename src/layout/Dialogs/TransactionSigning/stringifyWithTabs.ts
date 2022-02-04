export const stringifyWithTabs = (tx: any): string => {
    let result = JSON.stringify(tx, null, 2);
    // Find all unsafe longs and replace them in target json string
    const unsafeLongs = Object.values(tx)
        .filter((v) => typeof v === 'string' && parseInt(v) > Number.MAX_SAFE_INTEGER) as string[];
    unsafeLongs.forEach(unsafeLong => {
        result = result.replace(`"${unsafeLong}"`, unsafeLong);
    });
    return result;
};
