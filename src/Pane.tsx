import {
    prefix,
} from 'inline-style-prefixer';
import React from 'react';
import {
    convertSizeToCssValue,
} from './SplitPane';
import {
    getUnit,
} from './splitPaneUtils';

export type PaneProps = {
    resizersSize: number,
    index: number,
    initialSize?: string | number,
    minSize?: string | number,
    maxSize?: string,
    size?: string,
    className?: string,
    split: 'vertical' | 'horizontal',
    innerRef: (index: number, el: HTMLElement) => void
};

type style = {
    display: string,
    outline: string,
    minSize?: string,
    maxSize?: string,
    flex?: string,
    flexGrow?: number,
    minHeight?: string,
    minWidth?: string,
    maxWidth?: string,
    maxHeight?: string,
    width?: string,
    height?: string
}

export const Pane = React.memo<PaneProps>((props) => {
    const {
        resizersSize,
        className,
        index,
        initialSize = '1',
        maxSize = '100%',
        minSize = '0',
        split = 'vertical',
        size,
        children,
        innerRef,
        ...otherProps
    } = props;

    const setRef = (element:HTMLDivElement) => {
        props.innerRef(
            index, element,
        );
    };

    const PaneStyle = () => {
        const value = size ? size.toString() : initialSize.toString();
        const vertical = split === 'vertical';
        const style:style = {
            display: 'flex',
            outline: 'none',
        };

        style[vertical ? 'minWidth' : 'minHeight'] = convertSizeToCssValue(
            minSize.toString(), resizersSize,
        ) + 'px';
        style[vertical ? 'maxWidth' : 'maxHeight'] = convertSizeToCssValue(
            maxSize, resizersSize,
        );

        switch(getUnit(value)) {
            case 'ratio':
                style.flex = value;
                break;
            case '%':
            case 'px':
                style.flexGrow = 0;
                style[vertical ? 'width' : 'height'] = convertSizeToCssValue(
                    value.toString(), resizersSize,
                );
                break;
        }

        return style;
    };

    const prefixedStyle = prefix(PaneStyle());

    return (
        <div className={className} style={prefixedStyle} ref={setRef}>
            {children}
        </div>
    );
});

