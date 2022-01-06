type units = '%' | 'px' | 'ratio';

export function getUnit(size: string) {
    if(size.endsWith('px')) {
        return 'px';
    }

    if(size.endsWith('%')) {
        return '%';
    }

    return 'ratio';
}

export function convertToUnit(
    size: number, unit: units, containerSize?: number,
) {
    switch(unit) {
        case '%':
            return `${(size / (containerSize || 1) * 100).toFixed(2)}%`;
        case 'px':
            return `${size.toFixed(2)}px`;
        case 'ratio':
            return (size * 100).toFixed(0);
    }
}