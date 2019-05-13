export const range = (start: number, end: number, step = 1): number[] =>
    Array.from({length: end - start})
        .map((_, i) => i * step  + start);
