import React,
{
    ReactNodeArray,
} from 'react';
import styles from './SplitPane.scss';


export type StyleComponentProps = {
    split: 'vertical' | 'horizontal',
    children?: ReactNodeArray,
};

export const StyleComponent = React.memo(React.forwardRef<HTMLDivElement, StyleComponentProps>((
    props, ref,
) => {
    const {
        // className,
        split = 'vertical',
        children,
        ...otherProps
    } = props;

    return (
        <div className={split === 'vertical' ? styles.row : styles.column} ref={ref} {...otherProps}>
            {children}
        </div>
    );
}));