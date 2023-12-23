import * as fs from 'fs';

const file = fs.readFileSync('input.txt','utf8');

const terrain = file.split('\n').map(line => line.split(''));
const [targetRow, targetCol] = [terrain.length - 1, terrain[0].length - 2];

function part1(): number {
    const queue = [{ row: 0, col: 1, pathLen: 0, visited: new Set<string>() }];
    let maxPathLen = -Infinity;

    while (queue.length) {
        const { row, col, pathLen, visited } = queue.shift();

        if (row === targetRow && col === targetCol) {
            maxPathLen = Math.max(maxPathLen, pathLen);
            continue;
        }

        [[row, col + 1], [row, col - 1], [row + 1, col], [row - 1, col]].forEach(([newRow, newCol]) => {
            if (newRow < 0 || newRow >= terrain.length || newCol < 0 || newCol >= terrain[0].length) {
                return;
            }

            if (terrain[newRow][newCol] === '#' || visited.has(`${newRow},${newCol}`)) {
                return;
            }

            const currentTile= terrain[row][col];
            if (['<', '>', '^', 'v'].includes(currentTile)) {
                if (currentTile === '<' && newCol > col) {
                    return;
                }
                if (currentTile === '>' && newCol < col) {
                    return;
                }
                if (currentTile === '^' && newRow > row) {
                    return;
                }
                if (currentTile === 'v' && newRow < row) {
                    return;
                }
            }
            queue.push({ row: newRow, col: newCol, pathLen: pathLen + 1, visited: new Set([...visited, `${newRow},${newCol}`]) });
        });
    }

    return maxPathLen;
}

function part2(): number {
    const vertices = [[0, 1], [targetRow, targetCol]];

    terrain.forEach((row, r) => {
        row.forEach((tile, c) => {
            if (tile === '#') {
                return;
            }
            let neighboursCount = 0;

            [[r, c + 1], [r, c - 1], [r + 1, c], [r - 1, c]].forEach(([newRow, newCol]) => {
                if (newRow < 0 || newRow >= terrain.length || newCol < 0 || newCol >= terrain[0].length) {
                    return;
                }

                if (terrain[newRow][newCol] === '#') {
                    return;
                }

                neighboursCount++;
            });

            if (neighboursCount >= 3) {
                vertices.push([r, c]);
            }
        });
    });

    // adjacency list, where key is vertex name, and value is a map of neighbours and distances to them
    const graph = new Map(vertices.map(([row, col]) => [`${row},${col}`, new Map<string, number>()]));

    vertices.forEach(([vertexRow, vertexCol]) => {
         const dfsStack = [[vertexRow, vertexCol, 0]];
         const seen = new Set([`${vertexRow},${vertexCol}`]);

         while (dfsStack.length) {
             const [row, col, distance] = dfsStack.pop();

             if (distance !== 0 && vertices.some(([r, c]) => r === row && c === col)) {
                 graph.get(`${vertexRow},${vertexCol}`).set(`${row},${col}`, distance);
                 continue;
             }

             [[row, col + 1], [row, col - 1], [row + 1, col], [row - 1, col]].forEach(([newRow, newCol]) => {
                 if (newRow < 0 || newRow >= terrain.length || newCol < 0 || newCol >= terrain[0].length) {
                     return;
                 }

                 if (terrain[newRow][newCol] === '#') {
                     return;
                 }

                 if (seen.has(`${newRow},${newCol}`)) {
                     return;
                 }

                 dfsStack.push([newRow, newCol, distance + 1]);
                 seen.add(`${newRow},${newCol}`);
             });
         }
    });

    return dfs(graph, [0, 1]);
}

const seen = new Set<string>();
function dfs(graph: Map<string, Map<string, number>>, vertex: [number, number]): number {
    if (vertex[0] === targetRow && vertex[1] === targetCol) {
        return 0;
    }

    let maxPathLen = -Infinity;

    seen.add(`${vertex[0]},${vertex[1]}`);
    graph.get(`${vertex[0]},${vertex[1]}`)!.forEach((distance, neighbour) => {
        if (seen.has(neighbour)) {
            return;
        }
        maxPathLen = Math.max(maxPathLen, distance + dfs(graph, neighbour.split(',').map(Number) as [number, number]));
    });
    seen.delete(`${vertex[0]},${vertex[1]}`);

    return maxPathLen;
}

console.log(part1());
console.log(part2());