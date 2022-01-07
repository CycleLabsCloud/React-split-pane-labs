/**
 * This is a type guard for TypeScript to prevent a line from being
 * reachable.  It is used in switch statements so that TypeScript
 * will give you compiler errors if you forgot to handle a possible case.
 * It is literally impossible to write TypeScript code that will reach this.
 */

/* istanbul ignore next */
export function assertNever(x: never): never {
    throw new Error('Unexpected object: ' + x);
}

export function valueOrElse<T>(
    maybe: T | undefined,
    valueForElse: T,
): T {
    if (typeof maybe === 'undefined') {
        return valueForElse;
    } else {
        return maybe;
    }
}