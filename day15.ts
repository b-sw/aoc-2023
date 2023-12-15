import * as fs from 'fs';

const file = fs.readFileSync('input.txt','utf8');

function part1(): number {
    const sequences = file.split(',');

    return sequences.reduce((acc, sequence) => {
        return acc + calculateSequenceValue(sequence);
    }, 0);
}

function calculateSequenceValue(sequence: string): number {
    const chars = sequence.split('');

    return chars.reduce((acc, char) => {
        const ascii = char.charCodeAt(0);
        return (acc + ascii) * 17 % 256; // Fix the order of operations
    }, 0);
}

function part2(): number {
    const sequences = file.split(',');
    const boxes = new Map<number, Map<string, number>[]>();

    for (let i = 0; i < 256; i++) {
        boxes.set(i, []);
    }

    sequences.forEach(sequence => {
        const sequenceLen = sequence.length;
        const label = sequence[sequenceLen - 1] === '-' ? sequence.slice(0, sequenceLen - 1) : sequence.slice(0, sequenceLen - 2);
        const boxIndex = calculateSequenceValue(label);
        const box = boxes.get(boxIndex);

        if (sequence[sequenceLen - 1] === '-') {
            boxes.set(boxIndex, box.filter(lens => [...lens.keys()][0] !== label));
        } else {
            const focalLen = +sequence[sequenceLen - 1];
            const currentBoxLens = box.find(lens => [...lens.keys()][0] === label);

            if (currentBoxLens) {
                currentBoxLens.set(label, focalLen);
            } else {
                box.push(new Map([[label, focalLen]]));
            }
        }
    });

    return [...boxes.values()].reduce((acc, lenses, boxIndex) => {
        return acc + lenses.reduce((boxSum, lens, lensIndex) => {
            return boxSum + (boxIndex + 1) * (lensIndex + 1) * [...lens.values()][0];
        }, 0);
    }, 0);
}

console.log(part1());
console.log(part2());