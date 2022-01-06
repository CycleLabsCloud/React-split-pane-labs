import {
    TaggedUnion,
} from '../finiteState/TaggedUnion';

// Finite State Transducer
export type FstTransitionReturnType<
    State,
    Output extends TaggedUnion<string>,
> = {
    state: State,
    output?: Output[],
};

export type Fst<
    State,
    Action extends TaggedUnion<string>,
    Output extends TaggedUnion<string>,
> = {
    transition: (s: State, a: Action) => FstTransitionReturnType<State, Output>,
    createInitialState: (params?: Partial<State>) => State,
}
