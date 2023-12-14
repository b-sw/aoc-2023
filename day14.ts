import * as fs from 'fs';

const file = fs.readFileSync('input.txt','utf8');

function part1(): number {
    const platform = getPlatform();

    moveRoundedRocks(0, platform, new Map<string, string[][]>(), new Map<string, number>);

    return calculateRocksScore(platform);
}

function getPlatform(): string[][] {
    return file.split('\n').map(line => line.split(''));
}

function moveRoundedRocks(iter: number, platform: string[][], cache: Map<string, string[][]>, occurrenceCache: Map<string, number>): number {
    const oldCols: string[][] = [];

    for (let col = 0; col < platform[0].length; col++) {
        oldCols.push(platform.map(row => row[col]));
    }

    const key = oldCols.map(col => col.join('')).join('');
    if (cache.has(key)) {
        platform.forEach((row, rowIndex) => {
            platform[rowIndex] = cache.get(key)[rowIndex];
        });
        return occurrenceCache.get(key);
    }

    platform.forEach((row, rowIndex) => {
        platform[rowIndex] = Array(row.length).fill('.');
    });

    oldCols.forEach((col, colIndex) => {
        const rocks: number[] = [-1];
        let spheres: number[] = [];

        col.forEach((cell, rowIndex) => {
            if (cell === 'O') {
                spheres.push(rowIndex);
            } else if (cell === '#') {
                rocks.push(rowIndex);
            }
        });

        rocks.reverse().forEach(rock => {
            const spheresAboveRock = spheres.filter(sphere => sphere > rock).length;
            spheres = spheres.filter(sphere => sphere < rock);

            if (rock !== -1) {
                platform[rock][colIndex] = '#';
            }

            for (let i = 1; i < spheresAboveRock + 1; i++) {
                platform[rock + i][colIndex] = 'O';
            }
        });
    });

    cache.set(key, platform);
    occurrenceCache.set(key, iter);

    return -1;
}

function calculateRocksScore(platform: string[][]): number {
    let score = 0;

    for (let row = 0; row < platform.length; row++) {
        for (let col = 0; col < platform[row].length; col++) {
            if (platform[row][col] === 'O') {
                score += platform.length - row;
            }
        }
    }

    return score;
}

function part2(): number {
    let platform = getPlatform();
    const cache = new Map<string, string[][]>();
    const occurrenceCache = new Map<string, number>();

    let i = 0;
    while (i < 1000000000) {
        for (let j = 0; j < 4; j++) {
            const firstCycleElemIndex = moveRoundedRocks(i, platform, cache, occurrenceCache);

            if (firstCycleElemIndex !== -1) {
                const cycleLength = i - firstCycleElemIndex;
                const remainingIterations = 1000000000 - i;
                const iterationsToDo = remainingIterations % cycleLength;
                const iterationsToOmit = remainingIterations - iterationsToDo;
                i += iterationsToOmit;
            }
            platform = rotateClockwise(platform);
        }
        i += 1;
    }

    return calculateRocksScore(platform);
}

function rotateClockwise(arr: string[][]): string[][] {
    return arr[0].map((_, i) => arr.map(row => row[i]).reverse());
}

console.log(part1());
console.log(part2());