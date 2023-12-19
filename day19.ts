import * as fs from 'fs';

const file = fs.readFileSync('input.txt','utf8');

type Rule = {
    category: string;
    relation: '<' | '>';
    value: number;
    target: string;
} | {
    target: string;
}

type Workflow = {
    rules: Rule[];
}

type Rating = Map<string, number>;

function part1(): number {
    const workflows = getWorkflows();
    const ratings = getRatings();
    const acceptedRatings: Rating[] = [];

    ratings.forEach(rating => {
        let currentWorkflowName = 'in';

        while (!['A', 'R'].includes(currentWorkflowName)) {
            const currentWorkflow = workflows.get(currentWorkflowName);
            currentWorkflowName = currentWorkflow.rules.find(rule => {
                if ('category' in rule) {
                    const categoryValue = rating.get(rule.category);
                    return rule.relation === '<' ? categoryValue < rule.value : categoryValue > rule.value;
                }
                return true;
            }).target;
        }

        if (currentWorkflowName === 'A') {
            acceptedRatings.push(rating);
        }
    });

    return acceptedRatings.reduce((acc, rating) => {
        return acc + [...rating.values()].reduce((acc, value) => acc + value, 0);
    }, 0);
}

function getWorkflows(): Map<string, Workflow> {
    const [workflowsRaw] = file.split('\n\n').map(block => block.split('\n'));

    const workflows = workflowsRaw.map(workflowRaw => {
        const [name, rulesRaw] = workflowRaw.replace('}', '').split('{');
        const rules = rulesRaw.split(',').map(ruleRaw => {
            if (!ruleRaw.includes(':')) {
                return { target: ruleRaw };
            }

            const [condition, target] = ruleRaw.split(':');
            const [category, relation, value] = condition.split(/([<>])/);

            return {
                category,
                relation,
                value: +value,
                target
            };
        });
        return { name, rules };
    });

    return new Map(workflows.map(workflow => [workflow.name, workflow]));
}

function getRatings(): Rating[] {
    const [, ratingsRaw] = file.split('\n\n').map(block => block.split('\n'));

    return ratingsRaw.map(ratingRaw => {
        const ratingPartsRaw = ratingRaw.replaceAll(/([{}])/g, '').split(',');
        const ratingParts = ratingPartsRaw.map(ratingPart => {
            const [name, value] = ratingPart.split('=');
            return { name, value: +value };
        });

        return new Map(ratingParts.map(ratingPart => [ratingPart.name, ratingPart.value]));
    });
}

type CategoryBounds = {
    min: number;
    max: number;
}

function part2(): number{
    const workflows = getWorkflows();
    const terminalStates: Map<string, CategoryBounds>[] = [];

    const queue: [string, Map<string, CategoryBounds>][] = [['in', new Map([
        ['x', { min: 1, max: 4000 }],
        ['m', { min: 1, max: 4000 }],
        ['a', { min: 1, max: 4000 }],
        ['s', { min: 1, max: 4000 }]
    ])]];

    while (queue.length) {
        const [workflowName, categoriesBounds] = queue.shift();

        if (workflowName === 'A') {
            terminalStates.push(categoriesBounds);
            continue;
        }

        if (workflowName === 'R') {
            continue;
        }

        const workflow = workflows.get(workflowName);

        workflow.rules.forEach(rule => {
            if (!('category' in rule)) {
                if (rule.target === 'A') {
                    terminalStates.push(categoriesBounds);
                } else if (rule.target !== 'R') {
                    queue.push([rule.target, categoriesBounds]);
                }
                return;
            }

            if ('category' in rule) {
                const oldBounds = categoriesBounds.get(rule.category);

                const newBounds = rule.relation === '<' ? { min: oldBounds.min, max: Math.min(oldBounds.max, rule.value - 1) } : { min: Math.max(oldBounds.min, rule.value + 1), max: oldBounds.max };
                const newCategoriesBounds = new Map(categoriesBounds);

                newCategoriesBounds.set(rule.category, newBounds);
                queue.push([rule.target, newCategoriesBounds]);

                const continuedBounds = rule.relation === '<' ? { min: rule.value, max: oldBounds.max } : { min: oldBounds.min, max: rule.value };
                categoriesBounds.set(rule.category, continuedBounds);
            }
        });
    }

    return terminalStates.reduce((acc, categoriesBounds) => {
        const permutations = [...categoriesBounds.values()].reduce((acc, bounds) => {
            return acc * (bounds.max - bounds.min + 1);
        }, 1);

        return acc + permutations;
    }, 0);
}

console.log(part1());
console.log(part2());