import {
    behavior,
    Given,
} from '../test-utilities/bdd';
import {
    matchKind,
    TaggedUnionMatcher,
} from './TaggedUnion';

describe(
    'TaggedUnion', () => {

        behavior().do(
            'matchKind',
            Given(
                'a TaggedUnion ', () => null,
            )
                .When(
                    'matchKind', (sut) => {
                        return matchKind<MyTaggedUnion, MyTaggedUnion['kind'], number>(
                            {kind: 'two'}, {
                                'one': (v: One) => 1,
                                'two': (v: Two) => 2,
                            },
                        );
                    },
                )
                .Then(
                    'matches correct branch', (
                        sut, result,
                    ) => {
                        expect(result).toEqual(2);
                    },
                ),
        );
    },
);

type MyTaggedUnion =
    One | Two;

type One = {kind: 'one'};
type Two = {kind: 'two'};