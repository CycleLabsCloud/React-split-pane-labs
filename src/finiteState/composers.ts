export function withPreEffect<I, O>(
    f: (i: I) => O,
    preEffect?: (i: I) => void,
): (i: I) => O {
    return preEffect
        ? (i: I) => {
            preEffect(i);
            return f(i);
        }
        : f;
}
