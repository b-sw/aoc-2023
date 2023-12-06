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
    let waysToBeat = 0;
    for (let speed = 0; speed <= raceTime; speed += 1) {
        const distanceTraveled = speed * (raceTime - speed);
        if (distanceTraveled > raceRecord) {
            waysToBeat += 1;
        }
    }
    return waysToBeat;
}

function part2(): void {
    const [timesRaw, recordsRaw] = file.split('\n');
    const raceTime = +timesRaw.split(/:\s+/)[1].split(/\s+/).join('');
    const raceRecord = +recordsRaw.split(/:\s+/)[1].split(/\s+/).join('');

    console.log(getWaysToBeat(raceTime, raceRecord));
}

part1();
part2();