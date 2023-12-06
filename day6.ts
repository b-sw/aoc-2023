import * as fs from 'fs';

const file = fs.readFileSync('input.txt','utf8');

function part1(): void {
    const [timesRaw, recordsRaw] = file.split('\n');
    const raceTimes = timesRaw.split(/:\s+/)[1].split(/\s+/).map(Number);
    const raceRecords = recordsRaw.split(/:\s+/)[1].split(/\s+/).map(Number);

    const score = raceTimes.reduce((acc, raceTime, index) => {
        return acc * getWaysToBeat(raceTime, raceRecords[index]);
    }, 1);

    console.log(score);
}

function getWaysToBeat(raceTime: number, raceRecord: number): number {
    const delta = raceTime * raceTime - 4 * raceRecord;
    const sqrt = Math.sqrt(delta);
    const [t1, t2] = [(-raceTime + sqrt) / -2, (-raceTime - sqrt) / -2]
    const [start, end] = [Math.min(t1, t2), Math.max(t1, t2)];

    return Math.floor(end - 0.0001) - Math.ceil(start + 0.0001) + 1;
}

function part2(): void {
    const [timesRaw, recordsRaw] = file.split('\n');
    const raceTime = +timesRaw.split(/:\s+/)[1].split(/\s+/).join('');
    const raceRecord = +recordsRaw.split(/:\s+/)[1].split(/\s+/).join('');

    console.log(getWaysToBeat(raceTime, raceRecord));
}

part1();
part2();