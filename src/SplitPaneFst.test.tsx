import {
    behavesLikeFSM,
    behavesLikeFST,
} from './finiteState/state-machine';
import * as SplitPane from './SplitPaneFst';
import {
    StateKind,
    ActionKind,
    Action,
    ResizeStart,
    Resize,
    ResizeEnd,
} from './SplitPaneFst';

const dim = {
    resizersSize: 0,
    paneDimensions:   [{
        height: 100,
        width: 200,
        x: 0,
        y: 50,
        bottom: 0,
        left: 0,
        right: 0,
        top: 0,
        toJSON: () => {},
    }, {
        height: 100,
        width: 200,
        x: 0,
        y: 50,
        bottom: 0,
        left: 0,
        right: 0,
        top: 0,
        toJSON: () => {},
    }],
    splitPaneSizePx: 0,
    minSizesPx: [],
    maxSizesPx: [],
    sizesPx: [],
};

describe(
    'SplitPane', () => {
        behavesLikeFST<
            SplitPane.State,
            SplitPane.Action,
            SplitPane.Output
        >(
            SplitPane.transition,
            [{
                description: 'Idle -> start resizing',
                Given: {
                    kind: StateKind.IDLE,
                    sizes: ['0', '0'],
                },
                When: {
                    kind: ActionKind.RESIZE_START,
                    resizerIndex: 0,
                    clientX: 0,
                    clientY: 0,
                    dimensionsSnapshot: dim,
                },
                Then: {
                    state: {
                        kind: StateKind.RESIZING,
                        sizes: ['0', '0'],
                        resizerIndex: 0,
                        startClientX: 0,
                        startClientY: 0,
                        dimensionsSnapshot: dim,
                    },
                    output: [{ kind: SplitPane.OutputKind.ON_RESIZE_START}],
                },
            },
            {
                description: 'start resizing -> resizing',
                Given: {
                    kind: StateKind.RESIZING,
                    sizes: ['0', '0'],
                    startClientX: 0,
                    startClientY: 0,
                    resizerIndex: 0,
                    dimensionsSnapshot: dim,
                },
                When: {
                    kind: ActionKind.RESIZE,
                    clientX: 50,
                    clientY: 50,
                    split: 'vertical',
                },
                Then: {
                    state: {
                        kind: StateKind.RESIZING,
                        sizes: ['25000', '15000'],
                        resizerIndex: 0,
                        startClientX: 0,
                        startClientY: 0,
                        dimensionsSnapshot: dim,
                    },
                    output: [{ kind: SplitPane.OutputKind.ON_RESIZE}],
                },
            },
            {
                description: 'resizing -> end resizing',
                Given: {
                    kind: StateKind.RESIZING,
                    sizes: ['25000', '15000'],
                    startClientX: 0,
                    startClientY: 0,
                    resizerIndex: 0,
                    dimensionsSnapshot: dim,
                },
                When: { kind: ActionKind.RESIZE_END },
                Then: {
                    state: {
                        kind: StateKind.IDLE,
                        sizes: ['25000', '15000'],
                    },
                    output: [{ kind: SplitPane.OutputKind.ON_RESIZE_END}],
                },
            },

            ],
        );
    },
);

type Options = ResizeStart | Resize | ResizeEnd;