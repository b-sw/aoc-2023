import * as fs from 'fs';
import * as assert from "assert";

const file = fs.readFileSync('input.txt','utf8');

interface Module {
    name: string;
    targets: string[];
    receive(pulse: Pulse): Pulse[];
}

interface Pulse {
    source: string;
    frequency: 'low' | 'high';
    target: string;
}

class FlipFlop implements Module {
    isOn = false;

    constructor(readonly name: string, readonly targets: string[]) {}

    receive(pulse: Pulse): Pulse[] {
        if (pulse.frequency === 'high') {
            return [];
        }

        this.isOn = !this.isOn;
        const responseFrequency = this.isOn ? 'high' : 'low';

        return this.targets.map(target => ({
            source: this.name,
            frequency: responseFrequency,
            target
        }));
    }
}

class Conjunction implements Module {
    #recentPulses: Map<string, Pulse['frequency']>;

    constructor(readonly name: string, readonly targets: string[], readonly sources: string[]) {
        this.#recentPulses = new Map(sources.map(source => [source, 'low']));
    }

    receive(pulse: Pulse): Pulse[] {
        this.#recentPulses.set(pulse.source, pulse.frequency);

        const responseFrequency = [...this.#recentPulses.values()].every(pulseFrequency => pulseFrequency === 'high') ? 'low' : 'high';

        return this.targets.map(target => ({
            source: this.name,
            frequency: responseFrequency,
            target
        }));
    }
}

class Broadcaster implements Module {
    constructor(readonly name: string, readonly targets: string[]) {}

    receive(pulse: Pulse): Pulse[] {
        return this.targets.map(target => ({
            source: this.name,
            frequency: pulse.frequency,
            target
        }));
    }
}

function part1(): number {
    const modules = getModules();
    const queue: Pulse[] = [{ source: 'button', frequency: 'low', target: 'broadcaster' }];
    let buttonPressCount = 1;
    let [lowPulsesCount, highPulsesCount] = [0, 0]

    while (buttonPressCount < 1000 || queue.length !== 0) {
        if (queue.length === 0) {
            buttonPressCount+=1;
            queue.push({ source: 'button', frequency: 'low', target: 'broadcaster' });
        }

        const pulse = queue.shift();

        if (pulse.frequency === 'low') {
            lowPulsesCount++;
        } else {
            highPulsesCount++;
        }

        const module = modules.get(pulse.target);
        if (!module) {
            continue;
        }

        const responses = module.receive(pulse);
        queue.push(...responses);
    }

    return lowPulsesCount * highPulsesCount;
}

function part2(): number {
    const modules = getModules();
    const feed = [...modules.values()].find(module => module.targets.includes('rx')).name;
    const cycleLengths = new Map<string, number>();
    const seen = new Map([...modules.values()].filter(module => module.targets.includes(feed)).map(module => [module.name, 0]));

    const queue: Pulse[] = [{ source: 'button', frequency: 'low', target: 'broadcaster' }];
    let buttonPressCount = 1;

    while (true) {
        if (queue.length === 0) {
            buttonPressCount+=1;
            queue.push({ source: 'button', frequency: 'low', target: 'broadcaster' });
        }

        const pulse = queue.shift();

        const module = modules.get(pulse.target);
        if (!module) {
            continue;
        }

        if (module.name === feed && pulse.frequency === 'high') {
            seen.set(pulse.source, seen.get(pulse.source)! + 1);

            if (!cycleLengths.has(pulse.source)) {
                cycleLengths.set(pulse.source, buttonPressCount);
            } else {
                assert(seen.get(pulse.source) * cycleLengths.get(pulse.source) === buttonPressCount);
            }

            if ([...seen.values()].every(count => count > 0)) {
                return [...cycleLengths.values()].reduce(lcm);
            }
        }

        const responses = module.receive(pulse);
        queue.push(...responses);
    }
}

function gcd(a: number, b: number): number {
    if (b === 0) return a;
    return gcd(b, a % b);
}

function lcm(a: number, b: number): number {
    return (a * b) / gcd(a, b);
}

console.log(part1());
console.log(part2());

function getModules(): Map<string, Module> {
    const conjunctionsSources = new Map<string, string[]>();
    const conjunctionsTargets = new Map<string, string[]>();
    const modules = new Map<string, Module>();

    file.split('\n').forEach(line => {
        const [moduleName, targetsRaw] = line.split(' -> ');
        const targets = targetsRaw.split(', ');

        if (moduleName === 'broadcaster') {
            modules.set(moduleName, new Broadcaster('broadcaster', targets));
        } else if (moduleName[0] === '%') {
            modules.set(moduleName.slice(1), new FlipFlop(moduleName.slice(1), targets));
        } else {
            conjunctionsTargets.set(moduleName.slice(1), targets);
        }
    });

    modules.forEach((module, sourceModuleName) => {
        module.targets.filter(targetName => conjunctionsTargets.has(targetName)).forEach(targetName => {
            const currentSources = conjunctionsSources.get(targetName) ?? [];
            conjunctionsSources.set(targetName, [...currentSources, sourceModuleName]);
        });
    });

    conjunctionsTargets.forEach((targets, name) => {
        modules.set(name, new Conjunction(name, targets, conjunctionsSources.get(name) ?? []));
    });

    return modules;
}