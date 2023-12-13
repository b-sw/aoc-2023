import * as fs from 'fs';

const file = fs.readFileSync('input.txt','utf8');

function part1(): number {
    const patterns = getPatterns();

    return patterns.reduce((acc, pattern) => {
        return acc + getPatternSum(pattern);
    }, 0);
}

function getPatterns(): string[][] {
    const patternsRaw = file.split('\n\n');

    return patternsRaw.map(patternRaw => patternRaw.split('\n'));
}

function getPatternSum(pattern: string[]): number {
    const rows = pattern;
    const cols = Array.from({length: pattern[0].length}, (_, colIndex) => {
        return pattern.map(row => row[colIndex]).join('');
    });

    const rowSymmetryAxis = getSymmetryAxis(rows);
    const colSymmetryAxis = getSymmetryAxis(cols);

    return rowSymmetryAxis === -1 ? colSymmetryAxis : 100 * rowSymmetryAxis;
}

function getSymmetryAxis(lines: string[], forbiddenIndex = -1): number {
    for (let symmetryAxisIndex = 1; symmetryAxisIndex < lines.length; symmetryAxisIndex++) {
        const patternSize = Math.min(symmetryAxisIndex, lines.length - symmetryAxisIndex);

        const left = lines.slice(symmetryAxisIndex - patternSize, symmetryAxisIndex);
        const right = lines.slice(symmetryAxisIndex, symmetryAxisIndex + patternSize);

        if (left.join('') === right.reverse().join('') && symmetryAxisIndex !== forbiddenIndex) {
            return symmetryAxisIndex;
        }
    }

    return -1;
}

function part2(): number {
    const patterns = getPatterns();

    return patterns.reduce((acc, pattern) => {
        return acc + getSmudgedPatternSum(pattern);
    }, 0);
}

function getSmudgedPatternSum(pattern: string[]): number {
    const rows = pattern;
    const cols = Array.from({length: pattern[0].length}, (_, colIndex) => {
        return pattern.map(row => row[colIndex]).join('');
    });

    const initialRowSymmetryAxis = getSymmetryAxis(rows);
    const initialColSymmetryAxis = getSymmetryAxis(cols);

    for (let row = 0; row < rows.length; row++) {
        for (let col = 0; col < rows[row].length; col++) {
            const unsmudgedPattern = [...pattern];
            const unsmudgedSymbol = unsmudgedPattern[row][col] === '.' ? '#' : '.';
            unsmudgedPattern[row] = unsmudgedPattern[row].slice(0, col) + unsmudgedSymbol + unsmudgedPattern[row].slice(col + 1);

            const unsmudgedRows = [...unsmudgedPattern];
            const unsmudgedCols = Array.from({length: unsmudgedPattern[0].length}, (_, colIndex) => {
                return unsmudgedPattern.map(row => row[colIndex]).join('');
            });

            const newRowSymmetryAxis = getSymmetryAxis(unsmudgedRows, initialRowSymmetryAxis);
            const newColSymmetryAxis = getSymmetryAxis(unsmudgedCols, initialColSymmetryAxis);

            if (newRowSymmetryAxis !== -1 && newRowSymmetryAxis !== initialRowSymmetryAxis) {
                return 100 * newRowSymmetryAxis;
            }

            if (newColSymmetryAxis !== -1 && newColSymmetryAxis !== initialColSymmetryAxis) {
                return newColSymmetryAxis;
            }
        }
    }



    return initialRowSymmetryAxis === -1 ? initialColSymmetryAxis : 100 * initialRowSymmetryAxis;
}

console.log(part1());
console.log(part2());