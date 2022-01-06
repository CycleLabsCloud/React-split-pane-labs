import React, {
    Component,
    cloneElement,
    ReactChildren,
    ReactNodeArray,
    ReactNode,
} from 'react';
import {
    Resizer,
} from './Resizer';
import {
    Pane,
} from './Pane';
import {
    StyleComponent,
} from './StyleComponent';
import {
    State,
    Action,
    Output,
    transition,
    OutputKind,
    StateKind,
    ActionKind,
} from './SplitPaneFst';
import {
    useFst,
} from './useFst';
import {
    assertNever,
} from '../finiteState/patternMatching';
import {
    getUnit,
} from './splitPaneUtils';

const DEFAULT_PANE_SIZE = '1';
const DEFAULT_PANE_MIN_SIZE = '0';
const DEFAULT_PANE_MAX_SIZE = '100%';

function convert(
    str: string, size: number,
) {
    const tokens = str.match(/([0-9]+)([px|%]*)/);
    const value = tokens !== null ? tokens[1] : '';
    const unit = tokens !== null ? tokens[2] : 'px';
    return toPx(
        value, unit, size,
    );
}

function toPx(
    value: string, unit = 'px', size: number,
) {
    switch (unit) {
        case '%': {
            return +(size * parseInt(value) / 100).toFixed(2);
        }
        default: {
            return +value;
        }
    }
}

function removeNullChildren(children: React.ReactNode) {
    return React.Children.toArray(children).filter(c => c);
}


export function convertSizeToCssValue(
    value: string, resizersSize: number,
) {
    if(getUnit(value) !== '%') {
        return value;
    }

    if (!resizersSize) {
        return value;
    }

    const idx = value.search('%');
    const percent = parseInt(value.slice(
        0, idx,
    )) / 100;
    if (percent === 0) {
        return value;
    }

    return `calc(${value} - ${resizersSize}px*${percent})`;
}

export type SplitPaneProps = {
    children: ReactNodeArray,
    allowResize?: boolean,
    className?: string,
    split?: 'vertical' | 'horizontal',
    resizerSize?: number,
    minSize: number,
    defaultSize?: number | string,
    primary?: 'first' | 'second',
    onChange?: (s: string[]) => void,
    onResizeStart?: () => void,
    onResizeEnd?: (s:string[]) => void,
  };

export const SplitPane = (props: SplitPaneProps): JSX.Element => {
    const {
        className,
        allowResize = true,
        children,
        defaultSize,
        primary = 'first',
        split = 'vertical',
        resizerSize = 1,
    } = props;

    const splitRef = React.useRef<HTMLDivElement>(null);

    const getDefaultSize = () => {
        let panes;
        switch(typeof defaultSize) {
            case 'string': {
                const primaryDefault = parseInt(defaultSize);
                const secondaryPane = 100 - primaryDefault;
                panes = [ primaryDefault.toString(), secondaryPane.toString() ];
                break;
            }
            case 'number': {
                panes = [ `${defaultSize}px`, '1' ];
                break;
            }
            default: {
                return ['1', '1'];
            }
        }
        return primary === 'first' ? panes : panes.reverse();
    };

    const [stateWithOutput, dispatch] = useFst<
        State,
        Action,
        Output
    >(
        transition,
        {
            kind: StateKind.IDLE,
            sizes: getDefaultSize(),
        },
    );

    // Perform side effects from FST transition
    React.useEffect(
        () => {
            stateWithOutput.output.forEach(o => {
                onOutput(o);
            });
        },
        [stateWithOutput.output],
    );

    function onOutput(output: Output): void {
        switch (output.kind) {
            case OutputKind.ON_RESIZE_START:
                onResizeStart();
                break;
            case OutputKind.ON_RESIZE:
                onResize();
                break;
            case OutputKind.ON_RESIZE_END:
                onResizeEnd();
                break;
            default:
                assertNever(output);
        }
    }

    function onResizeStart(): void {
        // register listeners and invoke props.onResizeStart callback
        document.addEventListener(
            'mousemove', onMouseMove,
        );
        document.addEventListener(
            'mouseup', onMouseUp,
        );

        document.addEventListener(
            'touchmove', onTouchMove,
        );
        document.addEventListener(
            'touchend', onMouseUp,
        );
        document.addEventListener(
            'touchcancel', onMouseUp,
        );

        if (props.onResizeStart) {
            props.onResizeStart();
        }
    }

    function onResize(): void {
        // invoke props.onChange callback
        props.onChange && props.onChange(stateWithOutput.state.sizes);
    }

    function onResizeEnd(): void {
        // register listeners and invoke props.onResizeEnd callback
        document.removeEventListener(
            'mouseup', onMouseUp,
        );
        document.removeEventListener(
            'mousemove', onMouseMove,
        );

        document.removeEventListener(
            'touchmove', onTouchMove,
        );
        document.removeEventListener(
            'touchend', onMouseUp,
        );
        document.addEventListener(
            'touchcancel', onMouseUp,
        );

        if (props.onResizeEnd) {
            props.onResizeEnd(stateWithOutput.state.sizes);
        }
    }

    const [paneElements, setPaneElements] = React.useState<HTMLElement[]>([]);
    // const splitRef = React.useRef<HTMLDivElement>(null);

    const onMouseUp = (event: MouseEvent | TouchEvent) => {
        event.preventDefault();

        dispatch({
            kind: ActionKind.RESIZE_END,
        });

    };

    React.useEffect(
        () => {
            // umount hooks
            return () => {
                document.removeEventListener(
                    'mouseup', onMouseUp,
                );
                document.removeEventListener(
                    'mousemove', onMouseMove,
                );

                document.removeEventListener(
                    'touchmove', onTouchMove,
                );
                document.removeEventListener(
                    'touchend', onMouseUp,
                );
            };
        }, [],
    );

    const onMouseDown = React.useCallback(
        (
            event: React.MouseEvent, resizerIndex: number,
        ) => {
            if (event.button !== 0) {
                return;
            }
            event.preventDefault();
            if (!allowResize) {
                return;
            }
            dispatch({
                kind: ActionKind.RESIZE_START,
                dimensionsSnapshot: getDimensionsSnapshot(),
                clientX: event.clientX,
                clientY: event.clientY,
                resizerIndex: resizerIndex,
            });
        }, [],
    );

    const onTouchStart = (
        event: React.TouchEvent, resizerIndex: number,
    ) => {
        event.preventDefault();

        const {clientX, clientY} = event.touches[0];
        if (!allowResize) {
            return;
        }
        dispatch({
            kind: ActionKind.RESIZE_START,
            dimensionsSnapshot: getDimensionsSnapshot(),
            clientX: clientX,
            clientY: clientY,
            resizerIndex: resizerIndex,
        });
    };

    const onMouseMove = (event: MouseEvent) => {
        event.preventDefault();

        dispatch({
            kind: ActionKind.RESIZE,
            clientX: event.clientX,
            clientY: event.clientY,
            split: split,
        });
    };

    const onTouchMove = (event: TouchEvent) => {
        event.preventDefault();

        const {clientX, clientY} = event.touches[0];

        dispatch({
            kind: ActionKind.RESIZE,
            clientX: clientX,
            clientY: clientY,
            split: split,
        });
    };

    const getDimensionsSnapshot = () => {
        const paneDimensions = getPaneDimensions();
        const splitPaneDimensions = splitRef.current?.getBoundingClientRect() as DOMRect;
        const minSizes = getPanePropMinMaxSize('minSize');
        const maxSizes = getPanePropMinMaxSize('maxSize');

        const resizersSize = getResizersSize(removeNullChildren(children));
        const splitPaneSizePx = split === 'vertical'
            ? (splitPaneDimensions ? splitPaneDimensions.width : 0) - resizersSize
            : (splitPaneDimensions ? splitPaneDimensions.height : 0) - resizersSize;

        const minSizesPx = minSizes.map(s => convert(
            s, splitPaneSizePx,
        ));
        const maxSizesPx = maxSizes.map(s => convert(
            s, splitPaneSizePx,
        ));
        const sizesPx = paneDimensions.map(d => split === 'vertical' ? d.width : d.height);

        return {
            resizersSize,
            paneDimensions,
            splitPaneSizePx,
            minSizesPx,
            maxSizesPx,
            sizesPx,
        };
    };

    const getPanePropMinMaxSize = (key:string) => {
        return removeNullChildren(children).map((child:any) => {
            const value = child.props[key];
            if (value === undefined) {
                return key === 'maxSize' ? DEFAULT_PANE_MAX_SIZE : DEFAULT_PANE_MIN_SIZE;
            }

            return value;
        });
    };

    const getPaneDimensions = () => {
        return paneElements.filter(el => el).map(el => el.getBoundingClientRect());
    };

    const setPaneRef = (
        idx:number, el:HTMLElement,
    ) => {
    // if no panel of elements create?
        paneElements[idx] = el;
    };

    const getResizersSize = (children:ReactNodeArray) => {
        return (children.length - 1) * resizerSize;
    };

    const notNullChildren = removeNullChildren(children);
    const resizersSize = getResizersSize(notNullChildren);

    const elements = notNullChildren.reduce(
        (
            acc:React.ReactNode[], child:any, idx:number,
        ) => {
            let pane;
            const resizerIndex = idx - 1;
            const isPane = child.type === Pane;
            const paneProps = {
                index: idx,
                initialSize: defaultSize,
                'data-type': 'Pane',
                split: split,
                key: `Pane-${idx}`,
                innerRef: setPaneRef,
                resizersSize,
                size: stateWithOutput.state.sizes[idx],
                minSize: props.minSize,
            };

            if (isPane) {
                pane = cloneElement(
                    child, paneProps,
                );
            } else {
                pane = <Pane {...paneProps}>{child}</Pane>;
            }

            if (acc.length === 0) {
                return [...acc, pane];
            } else {
                const resizer = (
                    <Resizer
                        index={resizerIndex}
                        key={`Resizer-${resizerIndex}`}
                        split={split}
                        onMouseDown={onMouseDown}
                        onTouchStart={onTouchStart}
                    />
                );

                return [...acc, resizer, pane];
            }
        }, [],
    );
    // const splitRef = React.useRef<HTMLDivElement>(null);

    return (
        <StyleComponent
            ref={splitRef}
            data-type='SplitPane'
            data-split={split}
            split={split}
        >
            {elements}
        </StyleComponent>
    );
};