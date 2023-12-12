import * as fs from 'fs';

const file = fs.readFileSync('input.txt','utf8');

function part1(factor = 1): number {
    const springsLines = file.split('\n');

    return springsLines.reduce((acc, springsLine) => {
        let [springs, groupsRaw] = springsLine.split(' ');
        let groups = groupsRaw.split(',').map(group => +group);
        springs = Array.from({length: factor}, _ => springs).join('?');
        groups = Array.from({length: factor}, _ => groups).flat();

        const cache = new Map<string, number>();
        const springsLineResult = dfs(springs, groups, [], cache);

        return acc + springsLineResult;
    }, 0);
}

function dfs(springs: string, groups: number[], createdGroups: string[], cache: Map<string, number>): number {
    if (cache.has(`${springs.length},${groups.length}`)) {
        return cache.get(`${springs.length},${groups.length}`);
    }
    if (groups.length === 0) {
        return springs.indexOf('#') === -1 ? 1 : 0;
    }

    if (!springs) {
        return 0;
    }

    const [groupLength, ...restGroups] = groups;
    let result = 0;
    let remainingGroups = restGroups;

    for (let i = 0; i < springs.length; i++) {
        const groupIsPrecededBySeparator = i === 0 || ['.', '?'].includes(springs[i - 1]);
        const groupIsTail = i + groupLength === springs.length;
        const groupIsSeparated = ['.', '?'].includes(springs[i + groupLength]);

        const isValidHead = isValidGroup(springs.slice(i, i + groupLength), groupLength) && (groupIsSeparated || groupIsTail) && groupIsPrecededBySeparator;

        if (springs.slice(0, i).indexOf('#') !== -1) {
            break;
        }

        if (!isValidHead) {
            continue;
        }

        if (groupIsTail) {
            result += dfs('', remainingGroups, [...createdGroups, springs.slice(i, i + groupLength)], cache);
        } else {
            result += dfs(springs.slice(i + groupLength + 1), remainingGroups, [...createdGroups, springs.slice(i, i + groupLength)], cache);
        }
    }

    cache.set(`${springs.length},${groups.length}`, result);
    return result;
}

function isValidGroup(group: string, targetLength: number): boolean {
    return group.indexOf('.') === -1 && group.length === targetLength;
}

function part2(): number {
    return part1(5)
}

console.log(part1());
console.log(part2());