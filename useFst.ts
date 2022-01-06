import {
    useState,
    useCallback,
    useReducer,
} from 'react';
import {
    FstTransitionReturnType,
    TaggedUnion,
} from '../../oak/Oak';

const NO_OUTPUT: Array<any> = [];
function noOutput<Output>(): Array<Output> {
    return NO_OUTPUT as Array<Output>;
}

type FstReducerState<
    State,
    Output extends TaggedUnion<string>
> = {
    state: State,
    output: Array<Output>,
}
type FstReducerFn<
    State,
    Action extends TaggedUnion<string>,
    Output extends TaggedUnion<string>
> = (
    s: FstReducerState<State, Output>,
    a: Action,
) => FstReducerState<State, Output>;

type FstHook<
    State extends TaggedUnion<string>,
    Action extends TaggedUnion<string>,
    Output extends TaggedUnion<string>
> = [
    FstReducerState<State, Output>,
    (a: Action) => void,
]
export function useFst<
    State extends TaggedUnion<string>,
    Action extends TaggedUnion<string>,
    Output extends TaggedUnion<string>
>(
    transitionFn: (state: State, action: Action) => FstTransitionReturnType<State, Output>,
    initialState: State,
): FstHook<State, Action, Output> {
    const reducer: FstReducerFn<State, Action, Output> = (
        stateWithOutput,
        action,
    ) => {
        const next = transitionFn(
            stateWithOutput.state,
            action,
        );
        const nextOutput = next.output || noOutput();

        return {
            state: next.state,
            output: nextOutput,
        };
    };

    return useReducer(
        reducer,
        {
            state: initialState,
            output: noOutput<Output>(),
        },
    );
}