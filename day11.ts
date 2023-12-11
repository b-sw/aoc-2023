import * as fs from 'fs';

const file = fs.readFileSync('input.txt','utf8');

function part1(expansionFactor = 2): number {
    const universe: string[] = file.split('\n');
    const rowsToExpand = expandRows(universe);
    const colsToExpand = expandCols(universe);
    const galaxies = findGalaxies(universe);

    let distancesSum = 0;

    galaxies.forEach(([galaxyRow, galaxyCol]) => {
        const distances = galaxies.map(([row, col]) => {
            const expandedRowsCount = findExpandedBetween(row, galaxyRow, rowsToExpand);
            const expandedColsCount = findExpandedBetween(col, galaxyCol, colsToExpand);

            return Math.abs(galaxyRow - row) + Math.abs(galaxyCol - col) + expandedRowsCount * (expansionFactor - 1) + expandedColsCount * (expansionFactor - 1);
        });
        distancesSum += distances.reduce((acc, distance) => acc + distance, 0);
    });

    return distancesSum /= 2;
}

function expandRows(universe: string[]): boolean[] {
    const [rowsCount, colsCount] = [universe.length, universe[0].length];
    const rowsToExpand = Array.from({length: rowsCount}, _ => false);

    universe.forEach((row, rowIndex) => {
        rowsToExpand[rowIndex] = !row.includes('#');
    });

    return rowsToExpand;
}

function expandCols(universe: string[]): boolean[] {
    const colsCount = universe[0].length;
    const colsToExpand = Array.from({length: colsCount}, _ => false);

    for (let colIndex = 0; colIndex < colsCount; colIndex++) {
        colsToExpand[colIndex] = universe.every(row => row[colIndex] === '.');
    }

    return colsToExpand;
}

function findGalaxies(universe: string[]): [number, number][] {
    const galaxies: [number, number][] = [];

    universe.forEach((row, rowIndex) => {
        row.split('').forEach((tile, colIndex) => {
            if (tile === '#') {
                galaxies.push([rowIndex, colIndex]);
            }
        });
    });

    return galaxies;
}

function findExpandedBetween(rowCol1: number, rowCol2: number, toExpand: boolean[]): number {
    const [start, end] = rowCol1 < rowCol2 ? [rowCol1, rowCol2] : [rowCol2, rowCol1];
    let expandedCount = 0;

    for (let row = start + 1; row < end; row++) {
        if (toExpand[row]) {
            expandedCount++;
        }
    }

    return expandedCount;
}

function part2(): number {
    return part1(1000000)
}

console.log(part1());
console.log(part2());