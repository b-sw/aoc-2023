import * as fs from 'fs';

const file = fs.readFileSync('input.txt','utf8');
type Node = {
    left: string;
    right: string;
}

function part1(): void {
    const [instruction, nodes] = getNodes();

    let currentNode = 'AAA';
    let stepsCount = 0;

    while (currentNode !== 'ZZZ') {
        const nextStep = instruction[stepsCount % instruction.length];
        const { left, right } = nodes.get(currentNode)!;
        currentNode = nextStep === 'L' ? left : right;
        stepsCount += 1;
    }

    console.log(stepsCount)
}

function getNodes(): [string, Map<string, Node>] {
    const [instruction, nodesRaw] = file.split('\n\n');
    const nodes = nodesRaw.split('\n').reduce((acc, node) => {
        const [key, subCoords] = node.split(' = ');
        const [left, right] = subCoords.replaceAll('(', '').replaceAll(')', '').split(', ');
        
        acc.set(key, { left, right });
        return acc;
    }, new Map<string, Node>());
    
    return [instruction, nodes]
}

function part2(): void {
    // Map<nodeName, Set<step, stepsCount>>
    const nodesVisits = new Map<string, Map<number, number>>();
    const [instruction, nodesMap] = getNodes();
    
    let currentNodes = [...nodesMap.keys()].filter(key => key[2] === 'A');
    const cyclesFound = currentNodes.map(_ => false);
    const pathsZIndices: number[][] = currentNodes.map(_ => []);
    // [cycleStartIndex, cycleLength][];
    const pathsCycles: ([number, number] | null)[] = currentNodes.map(_ => null);
    
    let stepsCount = 0;
    
    while (cyclesFound.some(found => !found)) {
        const step = stepsCount % instruction.length;
        
        currentNodes.forEach((nodeName, pathIndex) => {
            if (nodeName[2] === 'Z') {
                pathsZIndices[pathIndex].push(stepsCount);
            }

            // first time a node is visited
            if (!nodesVisits.has(nodeName)) {
                nodesVisits.set(nodeName, new Map([[step, stepsCount]]));
            } else { // node is re-visited, check if at the same instruction step
                const visits = nodesVisits.get(nodeName);
                
                // CYCLE DETECTED this terminal node is re-visited at the same step
                if (visits.has(step) && pathsCycles[pathIndex] === null) {
                    const previousVisitStepsCount = visits.get(step);
                    const cycleLength = stepsCount - previousVisitStepsCount;
                    
                    pathsCycles[pathIndex] = [stepsCount - cycleLength, cycleLength];
                    cyclesFound[pathIndex] = true;
                } else { // NO CYCLE
                    visits.set(step, stepsCount);
                }
            }
        });
        
        currentNodes = getNodesAfterMove(currentNodes, instruction[step] as 'L' | 'R', nodesMap)
        
        stepsCount += 1;
    }
    
    const clippedPathIndices = pathsZIndices.map((pathIndices, pathIndex) => {
        const [cycleStart, cycleLength] = pathsCycles[pathIndex];
        return pathIndices.filter(index => index >= cycleStart && index <= cycleStart + cycleLength);
    })
    
    // idk why this works
    const values = clippedPathIndices.reduce((acc, cur) => [...acc, cur[0]], []);
    console.log(lcmArray(values));
}

function gcd(a: number, b: number): number {
    return b === 0 ? a : gcd(b, a % b);
}

function lcm(a: number, b: number): number {
    return (a * b) / gcd(a, b);
}

function lcmArray(values: number[]): number {
    if (values.length === 0) {
        throw new Error("Array must not be empty");
    }
    
    let result = values[0];
    
    for (let i = 1; i < values.length; i++) {
        result = lcm(result, values[i]);
    }
    
    return result;
}

function getNodesAfterMove(nodesKeys: string[], step: 'L' | 'R', map: Map<string, Node>): string[] {
    return nodesKeys.map((nodeKey) => {
        const { left, right } = map.get(nodeKey)!;
        return step === 'L' ? left : right;
    }, []);
}

part1();
part2();
