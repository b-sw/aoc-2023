import * as fs from 'fs';

const file = fs.readFileSync('input.txt','utf8');

function part1(): void {
    const loopPath = getPath(getMaze());

    // visualise
    // const maze = getMaze();
    // maze.forEach((row, rowIndex) => {
    //     const pathedRow = row.map((tile, colIndex) => {
    //         const isPath = loopPath.some(([row, col]) => row === rowIndex && col === colIndex);
    //         return isPath ? '@' : tile;
    //     });
    //     console.log(pathedRow.join(''));
    // });

    console.log(loopPath.length / 2);
}

function getPath(maze: string[][]): [number, number][] {
    const [startRow, startCol] = findStartPoint(maze);

    const nextNodes = getNextNodes(startRow, startCol, maze, new Set<string>(), true);
    const terminalPaths: [number, number][][] = [];

    nextNodes.forEach(node => {
        let path: [number, number][] = [[startRow, startCol]];
        let skipStart = true;
        let currentNode = node;
        const visited = new Set<string>();

        while (maze[currentNode[0]][currentNode[1]] !== 'S') {
            path.push([currentNode[0], currentNode[1]]);
            visited.add(`${currentNode[0]},${currentNode[1]}`)
            const [nextNode] = getNextNodes(currentNode[0], currentNode[1], maze, visited, skipStart);
            currentNode = nextNode;
            skipStart = false;
        }

        terminalPaths.push(path);
    });

    return terminalPaths.reduce((acc, path) => {
        return path.length > acc.length ? path : acc;
    }, []);

}

function getMaze(): string[][] {
    return file.split('\n').map(line => line.split(''));
}

function findStartPoint(maze: string[][]): [number, number] {
    for (let row = 0; row < maze.length; row++) {
        for (let col = 0; col < maze[row].length; col++) {
            if (maze[row][col] === 'S') {
                return [row, col];
            }
        }
    }

    throw new Error('No start point found');
}

function getNextNodes(row: number, col: number, maze: string[][], visited: Set<string>, skipStart: boolean): [number, number][] {
    const maxRow = maze.length - 1;
    const maxCol = maze[0].length - 1;
    const tile = maze[row][col];
    const nextNodes: [number, number][] = [];

    if (tile === '.') {
        return [];
    }
    if (tile === 'S') {
        if (row < maxRow && ['|', 'L', 'J'].includes(maze[row + 1][col])) {
            nextNodes.push([row + 1, col]);
        }
        if (row > 0 && ['|', '7', 'F'].includes(maze[row - 1][col])) {
            nextNodes.push([row - 1, col]);
        }
        if (col < maxCol && ['-', 'L', 'F'].includes(maze[row][col - 1])) {
            nextNodes.push([row, col  - 1]);
        }
        if (col > 0 && ['-', 'J', '7'].includes(maze[row][col + 1])) {
            nextNodes.push([row, col + 1]);
        }
    }
    if (tile === '|' || tile === '7' || tile === 'F') {
        if (row < maxRow && maze[row + 1][col] !== '.' && !visited.has(`${row + 1},${col}`)) {
            nextNodes.push([row + 1, col]);
        }
    }
    if (tile === '|' || tile === 'L' || tile === 'J') {
        if (row > 0 && maze[row - 1][col] !== '.' && !visited.has(`${row - 1},${col}`)) {
            nextNodes.push([row - 1, col]);
        }
    }
    if (tile === '-' || tile === 'L' || tile === 'F') {
        if (col < maxCol && maze[row][col + 1] !== '.' && !visited.has(`${row},${col + 1}`)) {
            nextNodes.push([row, col + 1]);
        }
    }
    if (tile === '-' || tile === 'J' || tile === '7') {
        if (col > 0 && maze[row][col - 1] !== '.' && !visited.has(`${row},${col - 1}`)) {
            nextNodes.push([row, col - 1]);
        }
    }

    return nextNodes.filter(node => !skipStart || maze[node[0]][node[1]] !== 'S');
}

function part2(): void {
    const maze = getMaze();

    const doubledMaze = maze.reduce((acc, row) => {
        acc.push(new Array(row.length * 2).fill('?'));
        acc.push(new Array(row.length * 2).fill('?'));
        return acc;
    }, [] as string[][]);

    maze.forEach((row, rowIndex) => {
        row.forEach((tile, colIndex) => {
            doubledMaze[rowIndex * 2][colIndex * 2] = tile;
        });
    });

    doubledMaze.forEach((row, rowIndex) => {
        row.forEach((tile, colIndex) => {
            if (tile !== '?') {
                return;
            }
            if (colIndex > 0 && colIndex < row.length - 1 && ['-', 'F', 'L', 'S'].includes(doubledMaze[rowIndex][colIndex - 1]) && ['-', 'J', '7', 'S'].includes(doubledMaze[rowIndex][colIndex + 1])) {
                doubledMaze[rowIndex][colIndex] = '-';
                return;
            }
            if (rowIndex > 0 && rowIndex < doubledMaze.length - 1 && ['|', 'F', '7', 'S'].includes(doubledMaze[rowIndex - 1][colIndex]) && ['|', 'L', 'J', 'S'].includes(doubledMaze[rowIndex + 1][colIndex])) {
                doubledMaze[rowIndex][colIndex] = '|';
                return;
            }
            doubledMaze[rowIndex][colIndex] = '.';
        });
    });

    const loopPath = getPath(doubledMaze);

    doubledMaze.forEach((row, rowIndex) => {
        const pathedRow = row.map((tile, colIndex) => {
            const isPath = loopPath.some(([row, col]) => row === rowIndex && col === colIndex);
            if (isPath) {
                doubledMaze[rowIndex][colIndex] = '@';
            }
            return isPath ? '@' : tile;
        });
    });

    doubledMaze.forEach((row, rowIndex) => {
        markFloatingNodes(rowIndex, 0, doubledMaze);
        markFloatingNodes(rowIndex, row.length - 1, doubledMaze);
    });

    doubledMaze[0].forEach((col, colIndex) => {
        markFloatingNodes(0, colIndex, doubledMaze);
        markFloatingNodes(doubledMaze.length - 1, colIndex, doubledMaze);
    })

    const reducedMaze = doubledMaze.reduce((acc, row, rowIndex) => {
        if (rowIndex % 2 === 1) {
            return acc;
        }

        const reducedRow = row.reduce((accRow, col, colIndex) => {
            return colIndex % 2 === 1 ? accRow : [...accRow, col];
        }, [] as string[])
        acc.push(reducedRow);
        return acc;
    }, [] as string[][]);

    const enclosedNodes = reducedMaze.reduce((acc, row, rowIndex) => {
        const rowEnclosedCount = row.reduce((accRow, tile, colIndex) => {
            return tile !== '*' && tile !== '@' ? accRow + 1 : accRow;
        }, 0);
        return rowEnclosedCount + acc;
    }, 0);

    console.log(enclosedNodes);
}

function markFloatingNodes(rowIndex: number, colIndex: number, maze: string[][]): void {
    const queue = [[rowIndex, colIndex]];
    while (queue.length) {
        const [nodeRow, nodeCol] = queue.shift();

        if (nodeRow < 0 || nodeRow > maze.length - 1 || nodeCol < 0 || nodeCol > maze[0].length - 1) {
            continue;
        }
        const nodeTile = maze[nodeRow][nodeCol];
        if (nodeTile === '*' || nodeTile === '@') {
            continue;
        }

        maze[nodeRow][nodeCol] = '*';

        const neighbours = [
            [nodeRow - 1, nodeCol],
            [nodeRow + 1, nodeCol],
            [nodeRow, nodeCol - 1],
            [nodeRow, nodeCol + 1],
        ];

        queue.push(...neighbours);
    }
}


part1();
part2();