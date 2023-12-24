import * as fs from 'fs';

const file = fs.readFileSync('input.txt','utf8');

function part1(): number {
    const hails = getHailstones();
    const seen = new Set<string>();

    return hails.reduce((totalSum, hail, i) => {
        let partialSum = 0;

        hails.forEach((otherHail, j) => {
            if (i === j) {
                return;
            }
            if (hail.xyIntersectsInArea(otherHail) && !seen.has(`${[i, j].sort().join(',')}`)) {
                partialSum ++;
                seen.add(`${[i, j].sort().join(',')}`);
            }
        });

        return totalSum + partialSum;
    }, 0);
}

console.log(part1());

class Hailstone {
    constructor(public start: Vector, public dir: Vector) {}

    xyIntersectsInArea(other: Hailstone, minVal = 200000000000000, maxVal = 400000000000000): boolean {
        const intersection = findIntersection(this, other);
        if (!intersection) {
            return false;
        }

        const { x, y } = intersection;
        return [x, y].every(coord => coord >= minVal && coord <= maxVal);
    }

    parametric(t: number): Vector {
        return this.start.add(this.dir.scale(t));
    }
}

class Vector {
    constructor(public x: number, public y: number, public z: number) {}

    add(v: Vector): Vector {
        return new Vector(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    scale(scalar: number): Vector {
        return new Vector(this.x * scalar, this.y * scalar, this.z * scalar);
    }
}


function findIntersection(ray1: Hailstone, ray2: Hailstone): Vector | null {
    const epsilon = 1e-6; // Small value to account for floating-point errors

    const denominator = ray1.dir.x * ray2.dir.y - ray1.dir.y * ray2.dir.x;
    if (Math.abs(denominator) < epsilon) {
        // Rays are parallel or collinear, no unique intersection point
        return null;
    }

    const deltaStart = new Vector(ray2.start.x - ray1.start.x, ray2.start.y - ray1.start.y, ray2.start.z - ray1.start.z);

    const t = (deltaStart.x * ray2.dir.y - deltaStart.y * ray2.dir.x) / denominator;
    const s = (deltaStart.x * ray1.dir.y - deltaStart.y * ray1.dir.x) / denominator;

    if (t < 0 || s < 0) {
        return null; // Rays do not intersect within valid parameters
    }

    return ray1.parametric(t);
}

function getHailstones(): Hailstone[] {
    return file.split('\n').map(line => {
        const [posRaw, velRaw] = line.split(' @ ');

        const pos = posRaw.split(',').map(Number);
        const vel = velRaw.split(',').map(Number);

        return new Hailstone(new Vector(pos[0],pos[1],pos[2]), new Vector(vel[0], vel[1], vel[2]));
    })
}
