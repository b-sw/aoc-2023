nodesRaw = [line.strip() for line in open("input.txt")]

edges: dict[str, [str]] = {}

for nodeRaw in nodesRaw:
    node, connectionsRaw = nodeRaw.split(": ")
    connections = connectionsRaw.split(" ")

    if node not in edges:
        edges[node] = []

    for connection in connections:
        if connection not in edges:
            edges[connection] = []

        edges[node].append(connection)
        edges[connection].append(node)


def bfs(start_node):
    paths = {start_node: []}
    visited = set()
    queue = [(start_node, [])]

    while queue:
        node, path = queue.pop(0)

        if node in visited:
            continue

        visited.add(node)

        for neighbor in edges[node]:
            if neighbor not in visited:
                queue.append((neighbor, path + [neighbor]))

                if neighbor not in paths or len(paths[neighbor]) > len(path) + 1:
                    paths[neighbor] = path + [neighbor]

    return paths

freqCounts = {}
for node in edges:
    node_paths = bfs(node)

    for path in node_paths.values():
        for i, path_node in enumerate(path[1:]):
            edge = tuple(sorted([path[i], path_node]))
            freqCounts[edge] = freqCounts.get(edge, 0) + 1

freqCounts = dict(sorted(freqCounts.items(), key=lambda item: item[1], reverse=True))
edgesToRemove = (list(edge[0] for edge in freqCounts.items())[:3])

for edge in edgesToRemove:
    edges[edge[0]].remove(edge[1])
    edges[edge[1]].remove(edge[0])


def bfs2():
    sizes = []
    visited = set()
    queue = []

    for node in edges:
        if node in visited:
            continue

        queue.append(node)
        size = 0

        while queue:
            node = queue.pop(0)

            if node in visited:
                continue

            visited.add(node)
            size += 1

            for neighbor in edges[node]:
                if neighbor not in visited:
                    queue.append(neighbor)

        sizes.append(size)

    assert len(sizes) == 2

    return sizes[0] * sizes[1]


print(bfs2())