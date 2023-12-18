import * as fs from 'fs';

const file = fs.readFileSync('input.txt','utf8');

type DigStep = {
    dir: 'R' | 'L' | 'U' | 'D';
    length: number;
    color: string;
}

function part1(getStepsFn = getDigSteps): number {
    const digSteps = getStepsFn();
    const vertices: [number, number][] = [];
    let borderPointsCount = 0;

    let node: [number, number] = [0, 0];
    vertices.push(node);

    for (let step of digSteps) {
        switch (step.dir) {
            case 'R':
                node[1] += step.length;
                break;
            case 'L':
                node[1] -= step.length;
                break;
            case 'U':
                node[0] += step.length;
                break;
            case 'D':
                node[0] -= step.length;
                break;
        }
        borderPointsCount += step.length;
        vertices.push([...node]);
    }

    // Shoelace formula
    const realArea = Math.abs(vertices.reduce((acc, [row, col], i) => {
        const next = vertices[(i + 1) % vertices.length];
        const prev = vertices[(i - 1 + vertices.length) % vertices.length];
        return acc + (next[0] - prev[0]) * col;
    }, 0) / 2);

    // Pick's theorem
    const interiorPointsCount = realArea - borderPointsCount / 2 + 1;

    return interiorPointsCount + borderPointsCount;
}

function getDigSteps(): DigStep[] {
    const stepsRaw = file.split('\n').map(line => line.split(' '));

    return stepsRaw.map(step => ({
        dir: step[0],
        length: +step[1],
        color: step[2].replaceAll(/[)(]/g, '')
    }) as DigStep);
}

function part2(): number {
    return part1(getDigSteps2);
}

function getDigSteps2(): DigStep[] {
    const stepsRaw = file.split('\n').map(line => line.split(' '));

    return stepsRaw.map(step => {
        const hex = step[2].replaceAll(/[)(]/g, '');
        let dir;
        switch (hex[hex.length - 1]) {
            case '0':
                dir = 'R';
                break;
            case '1':
                dir = 'D';
                break;
            case '2':
                dir = 'L';
                break;
            case '3':
                dir = 'U';
                break;
        }
        const length = parseInt(hex.slice(1, hex.length - 1), 16);

        return {
            dir,
            length,
            color: step[2].replaceAll(/[)(]/g, '')
        } as DigStep;
    });
}

console.log(part1());
console.log(part2());