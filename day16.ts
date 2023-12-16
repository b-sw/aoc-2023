import * as fs from 'fs';
import * as assert from "assert";

const file = fs.readFileSync('input.txt','utf8');

type Dir = '<' | '>' | '^' | 'v';

function part1(): number {
    const contraption = file.split('\n').map(line => line.split(''));
    const visited = new Set<string>();

    traverse(contraption, 0, -1, '>', visited);

    return getUniqueTiles(visited) - 1;
}

function traverse(contraption: string[][], row: number, col: number, dir: Dir, visited: Set<string>): void {
    if (visited.has(`${row};${col};${dir}`)) {
        return;
    }
    visited.add(`${row};${col};${dir}`);

    const [maxRow, maxCol] = [contraption.length - 1, contraption[0].length - 1];
    const [nextRow, nextCol] = getNextPos(row, col, dir);

    if (nextRow > maxRow || nextRow < 0 || nextCol > maxCol || nextCol < 0) {
        return;
    }

    const nextTile = contraption[nextRow][nextCol];

    if (nextTile === '\\') {
        const nextDir = dir === '>' ? 'v' : (dir === '<' ? '^' : (dir === '^' ? '<' : '>'));
        traverse(contraption, nextRow, nextCol, nextDir, visited);
    } else if (nextTile === '/') {
        const nextDir = dir === '>' ? '^' : (dir === '<' ? 'v' : (dir === '^' ? '>' : '<'));
        traverse(contraption, nextRow, nextCol, nextDir, visited);
    } else if (nextTile === '|') {
        if (['^', 'v'].includes(dir)) {
            traverse(contraption, nextRow, nextCol, dir, visited);
        } else {
            traverse(contraption, nextRow, nextCol, '^', visited);
            traverse(contraption, nextRow, nextCol, 'v', visited);
        }
    } else if (nextTile === '-') {
        if (['<', '>'].includes(dir)) {
            traverse(contraption, nextRow, nextCol, dir, visited);
        } else {
            traverse(contraption, nextRow, nextCol, '<', visited);
            traverse(contraption, nextRow, nextCol, '>', visited);
        }
    } else { // .
        traverse(contraption, nextRow, nextCol, dir, visited);
    }
}

function getNextPos(row: number, col: number, dir: Dir): [number, number] {
    if (dir === '>') {
        return [row, col + 1];
    } else if (dir === '<') {
        return [row, col - 1];
    } else if (dir === '^') {
        return [row - 1, col];
    } else {
        return [row + 1, col];
    }
}

function getUniqueTiles(visited: Set<string>): number {
    return new Set([...visited].map(tile => tile.split(';', 2).join(';'))).size;
}

function part2(): number {
    const contraption = file.split('\n').map(line => line.split(''));
    let maxEnergized = 0;

    [-1, contraption.length].forEach(row => {
        contraption[0].forEach((tile, col) => {
            const visited = new Set<string>();
            const startDir = row === -1 ? 'v' : '^';

            traverse(contraption, row, col, startDir, visited);
            maxEnergized = Math.max(maxEnergized, getUniqueTiles(visited) - 1);
        });
    });

    [-1, contraption[0].length].forEach(col => {
        contraption.forEach((row, rowIndex) => {
            const visited = new Set<string>();
            const startDir = col === -1 ? '>' : '<';

            traverse(contraption, rowIndex, col, startDir, visited);
            maxEnergized = Math.max(maxEnergized, getUniqueTiles(visited) - 1);
        });
    });

    return maxEnergized;
}

// test
assert(getUniqueTiles(new Set(['1;2;>', '1;2;<', '2;1;<'])) === 2);

console.log(part1());
console.log(part2());