import * as fs from 'fs';

const file = fs.readFileSync('input.txt','utf8');

class Brick {
    cubes = new Set<string>();
    constructor(readonly startCube: Cube, readonly endCube: Cube, readonly id = Math.random().toString(36).substring(4)) {
        const [dx, dy, dz] = [endCube.x - startCube.x, endCube.y - startCube.y, endCube.z - startCube.z];

        if (dx !== 0) {
            Array.from({ length: Math.abs(dx) + 1 }).forEach((_, i) => {
                this.cubes.add(`${startCube.x + i * Math.sign(dx)},${startCube.y},${startCube.z}`);
            });
        } else if (dy !== 0) {
            Array.from({ length: Math.abs(dy) + 1 }).forEach((_, i) => {
                this.cubes.add(`${startCube.x},${startCube.y + i * Math.sign(dy)},${startCube.z}`);
            });
        } else if (dz !== 0){
            Array.from({ length: Math.abs(dz) + 1 }).forEach((_, i) => {
                this.cubes.add(`${startCube.x},${startCube.y},${startCube.z + i * Math.sign(dz)}`);
            });
        } else {
            [startCube, endCube].forEach(cube => this.cubes.add(`${cube.x},${cube.y},${cube.z}`));
        }

    }

    fall(fallenBricks: Brick[]): boolean {
        let zDiff = Math.abs(this.startCube.z - this.endCube.z) === 0 ? 0 : 1;
        let z = Math.min(this.startCube.z, this.endCube.z);
        let fallenLevels = -1;

        do {
            this.cubes = new Set([...this.cubes.values()].map((cube, i) => `${cube.split(',').slice(0, 2).join(',')},${z + i * zDiff}`));
            z -= 1;
            fallenLevels += 1;
        } while (!fallenBricks.some(brick => this.collides(brick)) && z >= 0);

        this.cubes = new Set([...this.cubes.values()].map(cube => {
            const [x, y, z] = cube.split(',').map(Number);
            return `${x},${y},${z + 1}`;
        }));

        this.startCube.z = Math.min(...[...this.cubes.values()].map(cube => +cube.split(',')[2]));
        this.endCube.z = Math.max(...[...this.cubes.values()].map(cube => +cube.split(',')[2]));

        return fallenLevels > 1;
    }

    collides(other: Brick): boolean {
        const thisCubesCount = this.cubes.size;
        const otherCubesCount = other.cubes.size;

        return new Set([...this.cubes, ...other.cubes]).size !== thisCubesCount + otherCubesCount;
    }
}

class Cube {
    constructor(public x: number, public y: number, public z: number) {}
}

function part1(): number {
    let bricks = getBricks();
    let fallenBricks: Brick[] = [];

    bricks.forEach(brick => {
        brick.fall(fallenBricks);
        fallenBricks.push(brick);
    });

    let counter = 0;
    bricks = bricks.sort((a, b) => Math.min(a.startCube.z, a.endCube.z) - Math.min(b.startCube.z, b.endCube.z));
    bricks.forEach(removedBrick => {
        // part 1
        // part 1
        // const restBricks = bricks.filter(b => b.id !== removedBrick.id);
        // const someWillFall = restBricks.some(brick => {
        //     const otherBricks = restBricks.filter(b => b.id !== brick.id);
        //     return brick.canFall(otherBricks);
        // });
        //
        // if (!someWillFall) {
        //     counter += 1;
        // }


        // part 2
        const restBricks = bricks
            .map(brick => new Brick(new Cube(brick.startCube.x, brick.startCube.y, brick.startCube.z), new Cube(brick.endCube.x, brick.endCube.y, brick.endCube.z), brick.id))
            .filter(b => b.id !== removedBrick.id);
        let willFallCounter = 0;
        restBricks.forEach(brick => {
            const otherBricks = restBricks
                .map(b => new Brick(new Cube(b.startCube.x, b.startCube.y, b.startCube.z), new Cube(b.endCube.x, b.endCube.y, b.endCube.z), b.id))
                .filter(b => b.id !== brick.id);

            willFallCounter += brick.fall(otherBricks) ? 1 : 0;
        });

        counter += willFallCounter;
    });

    return counter;
}

console.log(part1());

function getBricks(): Brick[] {
    return file.split('\n').map(line => {
        const [start, end] = line.split('~');
        const [x, y, z] = start.split(',').map(Number);
        const [x2, y2, z2] = end.split(',').map(Number);
        return new Brick(new Cube(x, y, z), new Cube(x2, y2, z2));
    }).sort((a, b) => Math.min(a.startCube.z, a.endCube.z) - Math.min(b.startCube.z, b.endCube.z));
}

function vis(bricks: Brick[]): void {
    const maxY = Math.max(...bricks.map(brick => Math.max(brick.startCube.y, brick.endCube.y)));
    const maxZ = Math.max(...bricks.map(brick => Math.max(brick.startCube.z, brick.endCube.z)));
    const maxX = Math.max(...bricks.map(brick => Math.max(brick.startCube.x, brick.endCube.x)));

    for (let z = maxZ; z >= 0; z--) {
        let row: string[] = Array(maxY + 1).fill('.');
        for (let y = maxY; y >= 0; y--) {
            const tileBricksSeen = new Set<string>();
            for (let x = 0; x <= maxX; x++) {
                const cube = `${x},${y},${z}`;
                const brick = bricks.find(brick => brick.cubes.has(cube));
                if (brick && tileBricksSeen.has(brick.id)) {
                    continue;
                }
                if (brick) {
                    tileBricksSeen.add(brick.id);
                }
                row[y] = brick ? (row[y] === '.' ? '1' : `${+row[y] + 1}`) : row[y];
            }
        }
        console.log(row.join(' '));
    }
}