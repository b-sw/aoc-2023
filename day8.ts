import * as fs from 'fs';

const file = fs.readFileSync('input.txt','utf8');
type Coord = {
    left: string;
    right: string;
}

function part1(): void {
    const [instruction, coordsRaw] = file.split('\n\n');
    const coords = coordsRaw.split('\n').reduce((acc, coord) => {
        const [key, subCoords] = coord.split(' = ');
        const [left, right] = subCoords.replaceAll('(', '').replaceAll(')', '').split(', ');

        acc.set(key, { left, right });
        return acc;
    }, new Map<string, Coord>());

    let currentCoord = 'AAA';
    let stepsCount = 0;

    while (currentCoord !== 'ZZZ') {
        const nextStep = instruction[stepsCount % instruction.length];
        const { left, right } = coords.get(currentCoord)!;
        currentCoord = nextStep === 'L' ? left : right;
        stepsCount += 1;
    }

    console.log(stepsCount)
}

function part2(): void {
    // todo: cycles?
    const [instruction, coordsRaw] = file.split('\n\n');
    const coords = coordsRaw.split('\n').reduce((acc, coord) => {
        const [key, subCoords] = coord.split(' = ');
        const [left, right] = subCoords.replaceAll('(', '').replaceAll(')', '').split(', ');

        acc.set(key, { left, right });
        return acc;
    }, new Map<string, Coord>());

    let currentNodes = [...coords.keys()].filter(key => key[2] === 'A');
    let stepsCount = 0;

    while (!doNodesEndOnZ(currentNodes)) {
        currentNodes = currentNodes.map((node) => {
            const nextStep = instruction[stepsCount % instruction.length];
            const { left, right } = coords.get(node)!;
            return nextStep === 'L' ? left : right;
        }, []);
        stepsCount += 1;
    }

    console.log(stepsCount)
}

function doNodesEndOnZ(nodes: string[]): boolean {
    return nodes.every(node => node[2] === 'Z');
}

// part1();
part2();