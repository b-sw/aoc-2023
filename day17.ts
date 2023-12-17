import * as fs from 'fs';

const file = fs.readFileSync('input.txt','utf8');

type Dir = '<' | '>' | '^' | 'v';

type Move = {
    row: number;
    col: number;
    dir: Dir;
    cost: number;
    accumulatedCost: number;
    dirMovesLeft: number;
    movesDone?: number;
    previousItems?: Move[];
}

type QueueItem<T> = {
    priority: number;
    value: T;
}

class PriorityQueue<T extends Move> {
    private queue: QueueItem<T>[] = [];

    public enqueue(priority: number, value: T): void {
        if (this.queue.some(item => isMoveEqual(value, item.value))) {
            const existingItem = this.queue.find(item => isMoveEqual(value, item.value));
            const newCost = Math.min(existingItem.priority, priority);
            existingItem.priority = newCost;
            existingItem.value.accumulatedCost = newCost;
        } else {
            this.queue.push({ priority, value });
        }
        this.queue.sort((a, b) => a.priority - b.priority);
    }

    public dequeue(): T {
        return this.queue.shift().value;
    }

    public isEmpty(): boolean {
        return this.queue.length === 0;
    }
}

function isMoveEqual(move: Move, other: Move): boolean {
    return move.row === other.row &&
        move.col === other.col &&
        move.dir === other.dir &&
        move.dirMovesLeft === other.dirMovesLeft;

}

function part1(): number {
    const map = file.split('\n').map(line => line.split(''));
    const queue = new PriorityQueue<Move>();
    const visited = new Set<string>();
    let minCost = Infinity;

    queue.enqueue(0, { row: 0, col: 0, dir: '>', dirMovesLeft: 2, accumulatedCost: 0, cost: 0 });

    while (!queue.isEmpty()) {
        const move = queue.dequeue();

        if (move.row === map.length - 1 && move.col === map[0].length - 1) {
            minCost = Math.min(minCost, move.accumulatedCost + move.cost);
            continue;
        }

        const nextMoves = getMoves(map, move.row, move.col, move.dir, visited, move.dirMovesLeft);
        nextMoves.forEach(nextMove => {
            const moveCost = move.accumulatedCost + move.cost;

            queue.enqueue(moveCost, { ...nextMove, accumulatedCost: moveCost });
        });

        visited.add(tileKey(move.row, move.col, move.dirMovesLeft, move.dir));
    }

    return minCost;
}

function getMoves(map: string[][], row: number, col: number, dir: Dir, visited: Set<string>, dirMovesLeft: number): Move[] {
    const [maxRow, maxCol] = [map.length - 1, map[0].length - 1];
    const moves: Move[] = [];

    if (dir !== '<' && col < maxCol && !visited.has(tileKey(row, col + 1, dirMovesLeft, dir))) {
        const movesLeft = dir === '>' ? dirMovesLeft - 1 : 3;
        if (movesLeft > 0) {
            moves.push({ row, col: col + 1, dir: '>', dirMovesLeft: movesLeft, accumulatedCost: 0, cost: +map[row][col + 1] });
        }
    }
    if (dir !== '>' && col > 0 && !visited.has(tileKey(row, col - 1, dirMovesLeft, dir))) {
        const movesLeft = dir === '<' ? dirMovesLeft - 1 : 3;
        if (movesLeft > 0) {
            moves.push({ row, col: col - 1, dir: '<', dirMovesLeft: movesLeft, accumulatedCost: 0, cost: +map[row][col - 1] });
        }
    }
    if (dir !== '^' && row < maxRow && !visited.has(tileKey(row + 1, col, dirMovesLeft, dir))) {
        const movesLeft = dir === 'v' ? dirMovesLeft - 1 : 3;
        if (movesLeft > 0) {
            moves.push({ row: row + 1, col, dir: 'v', dirMovesLeft: movesLeft, accumulatedCost: 0, cost: +map[row + 1][col] });
        }
    }
    if (dir !== 'v' && row > 0 && !visited.has(tileKey(row - 1, col, dirMovesLeft, dir))) {
        const movesLeft = dir === '^' ? dirMovesLeft - 1 : 3;
        if (movesLeft > 0) {
            moves.push({ row: row - 1, col, dir: '^', dirMovesLeft: movesLeft, accumulatedCost: 0, cost: +map[row - 1][col] });
        }
    }

    return moves;
}

function tileKey(row: number, col: number, dirMovesLeft: number, dir: Dir): string {
    return `${row};${col};${dirMovesLeft};${dir}`;
}

function part2(): number {
    const map = file.split('\n').map(line => line.split(''));
    const queue = new PriorityQueue<Move>();
    const visited = new Set<string>();
    let minCost = Infinity;

    queue.enqueue(0, { row: 0, col: 0, dir: '>', dirMovesLeft: 9, accumulatedCost: 0, movesDone: 1, previousItems: [], cost: 0 });

    while (!queue.isEmpty()) {
        const move = queue.dequeue();

        if (move.row === map.length - 1 && move.col === map[0].length - 1) {
            minCost = Math.min(minCost, move.accumulatedCost);
            continue;
        }

        const nextMoves = getMoves2(map, move.row, move.col, move.dir, visited, move.dirMovesLeft, move.movesDone);
        nextMoves.forEach(nextMove => {
            const moveCost = move.accumulatedCost + nextMove.cost;

            queue.enqueue(moveCost, { ...nextMove, accumulatedCost: moveCost, previousItems: [...move.previousItems, move] });
        });

        visited.add(tileKey(move.row, move.col, move.dirMovesLeft, move.dir));
    }

    return minCost;
}

function getMoves2(map: string[][], row: number, col: number, dir: Dir, visited: Set<string>, dirMovesLeft: number, movesDone: number): Move[] {
    if (visited.has(tileKey(row + 1, col, dirMovesLeft, dir))) {
        return [];
    }

    if (movesDone < 4) {
        const requiredMovesCount = 4 - movesDone;
        const rowDif = dir === '^' ? -1 : (dir === 'v' ? 1 : 0);
        const colDif = dir === '<' ? -1 : (dir === '>' ? 1 : 0);

        let requiredMovesCost = 0;

        for (let i = 0; i < requiredMovesCount; i++) {
            if (row + rowDif * (i + 1) < 0 || row + rowDif * (i + 1) >= map.length || col + colDif * (i + 1) < 0 || col + colDif * (i + 1) >= map[0].length) {
                return [];
            }
            requiredMovesCost += +map[row + rowDif * (i + 1)][col + colDif * (i + 1)];
        }

        return [{ row: row + rowDif * requiredMovesCount, col: col + colDif * requiredMovesCount, dir, dirMovesLeft: dirMovesLeft - requiredMovesCount, accumulatedCost: 0, movesDone: movesDone + requiredMovesCount, previousItems: [], cost: requiredMovesCost }];
    }

    const [maxRow, maxCol] = [map.length - 1, map[0].length - 1];
    const moves: Move[] = [];

    if (dir !== '<' && col < maxCol && !visited.has(tileKey(row, col + 1, dirMovesLeft, dir))) {
        const movesLeft = dir === '>' ? dirMovesLeft - 1 : 10;
        if (movesLeft > 0) {
            moves.push({ row, col: col + 1, dir: '>', dirMovesLeft: movesLeft, accumulatedCost: 0, cost: +map[row][col + 1], movesDone: dir === '>' ? movesDone + 1 : 1 });
        }
    }
    if (dir !== '>' && col > 0 && !visited.has(tileKey(row, col - 1, dirMovesLeft, dir))) {
        const movesLeft = dir === '<' ? dirMovesLeft - 1 : 10;
        if (movesLeft > 0) {
            moves.push({ row, col: col - 1, dir: '<', dirMovesLeft: movesLeft, accumulatedCost: 0, cost: +map[row][col - 1], movesDone: dir === '<' ? movesDone + 1 : 1 });
        }
    }
    if (dir !== '^' && row < maxRow && !visited.has(tileKey(row + 1, col, dirMovesLeft, dir))) {
        const movesLeft = dir === 'v' ? dirMovesLeft - 1 : 10;
        if (movesLeft > 0) {
            moves.push({ row: row + 1, col, dir: 'v', dirMovesLeft: movesLeft, accumulatedCost: 0, cost: +map[row + 1][col], movesDone: dir === 'v' ? movesDone + 1 : 1 });
        }
    }
    if (dir !== 'v' && row > 0 && !visited.has(tileKey(row - 1, col, dirMovesLeft, dir))) {
        const movesLeft = dir === '^' ? dirMovesLeft - 1 : 10;
        if (movesLeft > 0) {
            moves.push({ row: row - 1, col, dir: '^', dirMovesLeft: movesLeft, accumulatedCost: 0, cost: +map[row - 1][col], movesDone: dir === '^' ? movesDone + 1 : 1 });
        }
    }

    return moves;
}

console.log(part1());
console.log(part2());