
export type TaggedUnion<T extends string> = {
    kind: T;
}

export type TaggedUnionTypes<
    U extends TaggedUnion<T>,
    T extends string
> = U['kind'];

export type TaggedUnionMatcher<
    U extends TaggedUnion<T>,
    T extends string,
    Output,
> = {
    [K in T]:
        U extends {kind: K}
            ? (variant: U) => Output
            : never;
}

export function matchKind<
    U extends TaggedUnion<T>,
    T extends string,
    Output,
>(
    variant: U,
    matcher: TaggedUnionMatcher<U, T, Output>,
): Output {
    return matcher[variant.kind](variant);
}

export type Untagged<U extends TaggedUnion<string>> =
    Omit<U, 'kind'>;