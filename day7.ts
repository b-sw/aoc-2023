import * as fs from 'fs';

const file = fs.readFileSync('input.txt','utf8');

const CardScores = new Map([
    ['A', 13],
    ['K', 12],
    ['Q', 11],
    ['J', 10],
    ['T', 9],
    ['9', 8],
    ['8', 7],
    ['7', 6],
    ['6', 5],
    ['5', 4],
    ['4', 3],
    ['3', 2],
    ['2', 1],
]);

const Replacements = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'Q', 'K', 'A'];

function part1(): void {
    const handBids = getHandBids();
    const sortedHands = handBids.sort(compareHandFn);
    const totalWinnings = sortedHands.reduce((acc, cur, index) => acc + (index + 1) * +cur[1], 0);
    
    console.log(totalWinnings);
}

function getHandBids(): [string, number, number][] {
    const handBidsRaw = file.split('\n');
    return handBidsRaw.map(rawLine => {
        const [hand, bid] = rawLine.split(' ');
        return [hand, +bid, getHandStrength(hand)];
    });
}

function compareHandFn([handA,,strengthA]: [string, number, number], [handB,,strengthB]: [string, number, number]): number {
    if (strengthA !== strengthB) {
        return strengthB - strengthA;
    }
    
    // else compare the highest card
    for (let i = 0; i < 5; i++) {
        if (handA[i] !== handB[i]) {
            return CardScores.get(handA[i]) - CardScores.get(handB[i]);
        }
    }
    
    return 0;
}

function getCardsCounts(hand: string): Map<string, number> {
    return hand.split('').reduce((acc, cur) => {
        acc.set(cur, (acc.get(cur) ?? 0) + 1);
        return acc;
    }, new Map<string, number>());
}

function sortDescFn(a, b): number {
    return a > b ? -1 : 1;
}

function part2(): void {
    CardScores.set('J', 0);
    const handBids = getHandBids();
    const jokerFilledBids = getJokerFilledBids(handBids);
    const sortedHands = jokerFilledBids.sort(compareHandFn);
    const totalWinnings = sortedHands.reduce((acc, cur, index) => acc + (index + 1) * +cur[1], 0);
    
    console.log(totalWinnings);
}

function getJokerFilledBids(handBids: [string, number, number][]): [string, number, number][] {
    return handBids.map(([hand, bid]) => {
        if (hand.indexOf('J') === -1) {
            return [hand, bid, getHandStrength(hand)];
        }
        
        let strongestHand = 7;
        
        Replacements.forEach(replacement => {
            const newHand = hand.replaceAll('J', replacement);
            strongestHand = Math.min(strongestHand, getHandStrength(newHand));
        });
        
        return [hand, bid, strongestHand];
    });
}

function getHandStrength(hand: string): number {
    const handCards = getCardsCounts(hand);
    const handScores = [...handCards.values()].sort(sortDescFn);
    
    if (handScores[0] === 5) {
        return 1;
    }
    if (handScores[0] === 4) {
        return 2;
    }
    if (handScores[0] === 3) {
        if (handScores[1] === 2) {
            return 3;
        } else {
            return 4;
        }
    }
    if (handScores[0] === 2) {
        if (handScores[1] === 2) {
            return 5;
        } else {
            return 6;
        }
    }
    return 7;
}

part1();
part2();
