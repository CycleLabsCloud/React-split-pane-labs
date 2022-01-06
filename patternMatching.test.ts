import {
    behavior,
    Given,
} from '../Oak';
import {
    valueOrElse,
} from './patternMatching';

describe(
    'patternMatching', () => {

        behavior().each(
            'iteration: %#',
            [
                [
                    'hello',
                    'world',
                    'hello',
                ],
                [
                    '',
                    'hi',
                    '',
                ],
                [
                    undefined,
                    'hi',
                    'hi',
                ],
            ],
            Given(
                'receives %s %s', (i: [string | undefined, string, string]) => {
                    const [
                        maybe,
                        valueForElse,
                        result,
                    ] = i;

                    return {
                        maybe,
                        valueForElse,
                        result,
                    };
                },
            )
                .When(
                    'call valueOrElse', (sut) => {
                        return valueOrElse(
                            sut.maybe, sut.valueForElse,
                        );
                    },
                )
                .Then(
                    'result is correct', (
                        sut, result,
                    ) => {
                        expect(result).toEqual(sut.result);
                    },
                ),
        );
    },
);