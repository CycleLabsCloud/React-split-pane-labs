import {
    assertNever,
} from '../finiteState/patternMatching';
import {
    FstTransitionReturnType
} from './Fst';
import {
    getUnit,
    convertToUnit,
} from './splitPaneUtils';

export enum StateKind {
    IDLE = 'IDLE',
    RESIZING = 'RESIZING',
}
export type State =
    Idle |
    Resizing;

export type Idle = {
    kind: StateKind.IDLE,
    sizes: string[],
}

export type Resizing = {
    kind: StateKind.RESIZING,
    sizes: string[],
    resizerIndex: number,
    startClientX: number,
    startClientY: number,
    dimensionsSnapshot: DimensionsSnapshot,
}
export type DimensionsSnapshot = {
    resizersSize: number,
    paneDimensions: DOMRect[],
    splitPaneSizePx: number,
    minSizesPx: number[],
    maxSizesPx: number[],
    sizesPx: number[]
}

export enum ActionKind {
    RESIZE_START = 'RESIZE_START',
    RESIZE = 'RESIZE',
    RESIZE_END = 'RESIZE_END',
}
export type Action =
    ResizeStart |
    Resize |
    ResizeEnd;

export type ResizeStart = {
    kind: ActionKind.RESIZE_START,
    resizerIndex: number,
    clientX: number,
    clientY: number,
    dimensionsSnapshot: DimensionsSnapshot,
}

export type Resize = {
    kind: ActionKind.RESIZE,
    clientX: number,
    clientY: number,
    split: 'vertical' | 'horizontal',
}

export type ResizeEnd = {
    kind: ActionKind.RESIZE_END,
}

export enum OutputKind {
    ON_RESIZE_START = 'ON_RESIZE_START',
    ON_RESIZE = 'ON_RESIZE',
    ON_RESIZE_END = 'ON_RESIZE_END',
}

export type Output =
    OnResizeStart |
    OnResize |
    OnResizeEnd;

export type OnResizeStart = {
    kind: OutputKind.ON_RESIZE_START,
}

export type OnResize = {
    kind: OutputKind.ON_RESIZE,
}

export type OnResizeEnd = {
    kind: OutputKind.ON_RESIZE_END,
}

export function transition(
    state: State,
    action: Action,
): FstTransitionReturnType<State, Output> {
    switch (state.kind) {
        case StateKind.IDLE:
            return onIdle(
                state,
                action,
            );
        case StateKind.RESIZING:
            return onResizing(
                state,
                action,
            );
        default:
            assertNever(state);
    }
}

function onIdle(
    state: Idle,
    action: Action,
): FstTransitionReturnType<State, Output> {
    switch (action.kind) {
        case ActionKind.RESIZE_START:
            return onResizeStart(
                state,
                action,
            );
        case ActionKind.RESIZE:
            // illegal transition
            return {
                state,
            };
        case ActionKind.RESIZE_END:
            // illegal transition
            return {
                state,
            };
        default:
            assertNever(action);
    }
}

function onResizing(
    state: Resizing,
    action: Action,
): FstTransitionReturnType<State, Output> {
    switch (action.kind) {
        case ActionKind.RESIZE_START:
            // illegal transition
            return {
                state,
            };
        case ActionKind.RESIZE:
            return onResize(
                state,
                action,
            );
        case ActionKind.RESIZE_END:
            return onResizeEnd(
                state,
                action,
            );
        default:
            assertNever(action);
    }
}

function onResizeStart(
    state: Idle,
    action: ResizeStart,
): FstTransitionReturnType<Resizing, Output> {
    const nextState: Resizing = {
        kind: StateKind.RESIZING,
        sizes: [ ...state.sizes ],
        resizerIndex: action.resizerIndex,
        startClientX: action.clientX,
        startClientY: action.clientY,
        dimensionsSnapshot: action.dimensionsSnapshot,
    };
    return {
        state: nextState,
        output: [{
            kind: OutputKind.ON_RESIZE_START,
        }],
    };
}

function onResize(
    state: Resizing,
    action: Resize,
): FstTransitionReturnType<Resizing, Output> {
    const nextState = { ...state };
    const {minSizesPx, maxSizesPx, paneDimensions, sizesPx, splitPaneSizePx} = state.dimensionsSnapshot;
    const sizeDim = action.split === 'vertical' ? 'width' : 'height';
    const primary = paneDimensions[state.resizerIndex];
    const secondary = paneDimensions[state.resizerIndex + 1];
    const maxSize = primary[sizeDim] + secondary[sizeDim];

    const primaryMinSizePx = minSizesPx[state.resizerIndex];
    const secondaryMinSizePx = minSizesPx[state.resizerIndex + 1];
    const primaryMaxSizePx = Math.min(
        maxSizesPx[state.resizerIndex], maxSize,
    );
    const secondaryMaxSizePx = Math.min(
        maxSizesPx[state.resizerIndex + 1], maxSize,
    );

    const moveOffset = action.split === 'vertical'
        ? state.startClientX - action.clientX
        : state.startClientY - action.clientY;


    let primarySizePx = primary[sizeDim] - moveOffset;
    let secondarySizePx = secondary[sizeDim] + moveOffset;

    let primaryHasReachedLimit = false;
    let secondaryHasReachedLimit = false;

    if (primarySizePx < primaryMinSizePx) {
        primarySizePx = primaryMinSizePx;
        primaryHasReachedLimit = true;
    } else if (primarySizePx > primaryMaxSizePx){
        primarySizePx = primaryMaxSizePx;
        primaryHasReachedLimit = true;
    }

    if (secondarySizePx < secondaryMinSizePx) {
        secondarySizePx = secondaryMinSizePx;
        secondaryHasReachedLimit = true;
    } else if (secondarySizePx > secondaryMaxSizePx){
        secondarySizePx = secondaryMaxSizePx;
        secondaryHasReachedLimit = true;
    }

    if (primaryHasReachedLimit) {
        secondarySizePx = primary[sizeDim] + secondary[sizeDim] - primarySizePx;
    } else if (secondaryHasReachedLimit) {
        primarySizePx = primary[sizeDim] + secondary[sizeDim] - secondarySizePx;
    }
    sizesPx[state.resizerIndex] = primarySizePx;
    sizesPx[state.resizerIndex + 1] = secondarySizePx;

    const _sizes = state.sizes.concat();

    let updateRatio;
    [primarySizePx, secondarySizePx].forEach((
        paneSize, idx,
    ) => {
        const unit = getUnit(_sizes[state.resizerIndex + idx]);

        if (unit !== 'ratio') {

            _sizes[state.resizerIndex + idx] = convertToUnit(
                paneSize, unit, splitPaneSizePx,
            );
        } else {
            updateRatio = true;
        }
    });

    if (updateRatio) {
        let ratioCount = 0;
        let lastRatioIdx;
        const updatedSizes = _sizes.map((
            size, idx,
        ) => {
            if (getUnit(size) === 'ratio') {
                ratioCount++;
                lastRatioIdx = idx;
                return convertToUnit(
                    sizesPx[idx], 'ratio',
                );
            } else {
                return size;
            }
        });

        if (ratioCount === 1) {
            if(lastRatioIdx) {
                updatedSizes[lastRatioIdx] = '1';
            }
        }
        nextState.sizes = updatedSizes;
    }

    return {
        state: nextState,
        output: [{
            kind: OutputKind.ON_RESIZE,
        }],
    };
}

function onResizeEnd(
    state: Resizing,
    action: ResizeEnd,
): FstTransitionReturnType<Idle, Output> {
    // no logic needed here, just side effects
    const nextState: Idle = {
        kind: StateKind.IDLE,
        sizes: [ ...state.sizes ],
    };
    return {
        state: nextState,
        output: [{
            kind: OutputKind.ON_RESIZE_END,
        }],
    };
}