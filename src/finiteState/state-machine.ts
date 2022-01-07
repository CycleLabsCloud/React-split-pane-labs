import {
    TaggedUnion,
} from './TaggedUnion';
import {
    FstTransitionReturnType,
} from '../Fst';

export type FSMTestCase<State, Action> = {
    description: string,
    Given: State,
    When: Action,
    Then: State,
}

export function behavesLikeFSM<State, Action>(
    transitionFn: (s: State, a: Action) => State,
    testCases: Array<FSMTestCase<State, Action>>,
): void {
    testCases.forEach(testCase => {
        test(
            testCase.description, () => {
                const nextState = transitionFn(
                    testCase.Given,
                    testCase.When,
                );

                expect(nextState).toEqual(testCase.Then);
            },
        );
    });
}



export type FSTTestCase<State, Action, Output extends TaggedUnion<string>> = {
    description: string,
    expectedDescription?: string,
    Given: State,
    When: Action,
    Then: FstTransitionReturnType<State, Output>,
}

export function behavesLikeFST<State, Action, Output extends TaggedUnion<string>>(
    transitionFn: (s: State, a: Action) => FstTransitionReturnType<State, Output>,
    testCases: Array<FSTTestCase<State, Action, Output>>,
): void {
    testCases.forEach(testCase => {
        test(
            testCase.description, () => {
                const transitionResult = transitionFn(
                    testCase.Given,
                    testCase.When,
                );

                expect(transitionResult).toEqual(testCase.Then);
                if(testCase.expectedDescription) {
                    expect(testCase.expectedDescription).toEqual(testCase.description);
                }
            },
        );
    });
}
