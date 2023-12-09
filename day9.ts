import * as fs from 'fs';

const file = fs.readFileSync('input.txt','utf8');

function part1(): void {
    const reports = getReports();

    const extrapolationSum = reports.reduce((acc, report) => {
        return acc + getReportExtrapolationSuffix(report);
    }, 0);

    console.log(extrapolationSum)
}

function getReports(): number[][] {
    return file.split('\n').map(report => report.split(' ').map(Number));
}

function getReportExtrapolationSuffix(report: number[]): number {
    const extrapolationSteps= getExtrapolationSteps(report);
    lastElement(extrapolationSteps).push(0);

    for (let i = extrapolationSteps.length - 2; i >= 0; i--) {
        const previousStep = extrapolationSteps[i + 1];
        const currentStep = extrapolationSteps[i];

        currentStep.push(lastElement(currentStep) + lastElement(previousStep));
    }

    return lastElement(extrapolationSteps[0]);
}

function getExtrapolationSteps(report: number[]): number[][] {
    const extrapolationSteps = [report];

    while (!lastElement(extrapolationSteps).every(stepValue => stepValue === 0)) {
        const previousStep = lastElement(extrapolationSteps);
        const newStep = [];

        for (let i = 1; i < previousStep.length; i++) {
            newStep.push(previousStep[i] - previousStep[i - 1]);
        }

        extrapolationSteps.push(newStep);
    }

    return extrapolationSteps;
}

function lastElement<T>(array: T[]): T {
    return array[array.length - 1];
}

function part2(): void {
    const reports = getReports();

    const extrapolationSum = reports.reduce((acc, report) => {
        return acc + getReportExtrapolationPrefix(report);
    }, 0);

    console.log(extrapolationSum)
}

function getReportExtrapolationPrefix(report: number[]): number {
    const extrapolationSteps= getExtrapolationSteps(report);

    for (let i = extrapolationSteps.length - 2; i >= 0; i--) {
        const previousStep = extrapolationSteps[i + 1];
        const currentStep = extrapolationSteps[i];

        extrapolationSteps[i] = [currentStep[0] - previousStep[0], ...currentStep];
    }

    return extrapolationSteps[0][0];
}

part1();
part2();
