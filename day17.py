# src: https://www.youtube.com/watch?v=2pDSooPLLkI&t=378s&ab_channel=HyperNeutrino
from heapq import heappush, heappop

grid = [list(map(int, line.strip())) for line in open('input.txt')]

seen = set()
# heatLoss, row, col, rowDir, colDir, steps, dirStepsCount
pq = [(0, 0, 0, 0, 0, 0)]

while pq:
    heatLoss, row, col, deltaRow, deltaCol, dirStepsCount = heappop(pq)

    if row == len(grid) - 1 and col == len(grid[0]) - 1 and dirStepsCount >= 4:
        print(heatLoss)
        break

    if row < 0 or row >= len(grid) or col < 0 or col >= len(grid[0]):
        continue

    if (row, col, deltaRow, deltaCol, dirStepsCount) in seen:
        continue

    seen.add((row, col, deltaRow, deltaCol, dirStepsCount))

    if dirStepsCount < 10 and (deltaRow, deltaCol) != (0, 0):
        nextRow = row + deltaRow
        nextCol = col + deltaCol

        if 0 <= nextRow < len(grid) and 0 <= nextCol < len(grid[0]):
            tileHeatLoss = grid[nextRow][nextCol]
            heappush(pq, (heatLoss + tileHeatLoss, nextRow, nextCol, deltaRow, deltaCol, dirStepsCount + 1))

    if dirStepsCount < 4 and (deltaRow, deltaCol) != (0, 0):
        continue
    for newDeltaRow, newDeltaCol in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
        if (newDeltaRow, newDeltaCol) != (deltaRow, deltaCol) and (newDeltaRow, newDeltaCol) != (-deltaRow, -deltaCol):
            nextRow = row + newDeltaRow
            nextCol = col + newDeltaCol

            # turn
            if 0 <= nextRow < len(grid) and 0 <= nextCol < len(grid[0]):
                tileHeatLoss = grid[nextRow][nextCol]
                heappush(pq, (heatLoss + tileHeatLoss, nextRow, nextCol, newDeltaRow, newDeltaCol, 1))