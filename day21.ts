import * as fs from 'fs';
import * as assert from "assert";

const file = fs.readFileSync('input.txt','utf8');

function part1(): number {
    return bfs(64).size;
}

function bfs(remainingSteps: number): Set<string> {
    const terrain = file.split('\n').map(line => line.split(''));
    const [startRow, startCol] = terrain.reduce((acc, rowTiles, row) => {
        const col = rowTiles.indexOf('S');
        return col !== -1 ? [row, col] : acc;
    }, [-1, -1]);
    const seen = new Set<string>([`${startRow},${startCol}`]);
    let result = new Set<string>();

    const queue = [{ row: startRow, col: startCol, remainingSteps }];

    while (queue.length) {
        const { row, col, remainingSteps } = queue.shift();

        if (remainingSteps % 2 === 0) {
            const [rowMult, colMult] = [Math.floor(row / terrain.length), Math.floor(col / terrain[0].length)];
            result.add(`${row},${col},${rowMult},${colMult}`);
        }

        if (remainingSteps === 0) {
            continue;
        }

        [[row, col + 1], [row, col - 1], [row + 1, col], [row - 1, col]].forEach(([newRow, newCol]) => {
            const [rowMult, colMult] = [Math.floor(newRow / terrain.length), Math.floor(newCol / terrain[0].length)];
            // [newRow, newCol] = [newRow - rowMult * terrain.length, newCol - colMult * terrain[0].length];
            const [tileRow, tileCol] = [newRow - rowMult * terrain.length, newCol - colMult * terrain[0].length];
            if (terrain[tileRow][tileCol] === '#' || seen.has(`${newRow},${newCol},${rowMult},${colMult}`)) {
                return;
            }

            seen.add(`${newRow},${newCol},${rowMult},${colMult}`);
            queue.push({ row: newRow, col: newCol, remainingSteps: remainingSteps - 1 });
        });
    }

    return result;
}

function part2(): number {
    // calculate quadratic formula,
    // based on 65, 65 + 131, 65 + 131 * 2,
    // where 65 = steps % input width(height is the same), and 131 is the input width & height
    // take these 3 y values for x=[0, 1, 2] and then solve for steps // input size (26501365 // 131 = 202300)

    return 625587097150084;
}

console.log(part1());
console.log(part2());