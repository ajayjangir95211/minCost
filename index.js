const express = require('express');

const app = express();
app.use('/assets', express.static('assets'));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send("< h2 > Minimum Cost API</h2 > < p > Use Post method to access the API</p > ");
});
function printGraph(graph) {
    for (const vertex in graph) {
        if (graph.hasOwnProperty(vertex)) {
            const { load, edges } = graph[vertex];
            console.log(`${vertex} (Weight: ${load})`);
            for (const edge in edges) {
                if (edges.hasOwnProperty(edge)) {
                    const edgeWeight = edges[edge];
                    console.log(`  -> ${edge} (Weight: ${edgeWeight})`);
                }
            }
        }
    }
}

const location = {
    C1: { load: 0, edges: { L1: 3, C2: 4 } },
    C2: { load: 0, edges: { L1: 2.5, C1: 4, C3: 3 } },
    C3: { load: 0, edges: { L1: 2, C2: 3 } },
    L1: { load: -1, edges: { C1: 3, C2: 2.5, C3: 2 } },
}

function calculateCost(distance, load) {
    rate = 10 + Math.floor(load / 5) * 8;
    return distance * rate;
}

function dfs(station, currentLoad, visitedNodes) {
    if (location[station].load == -1)
        currentLoad = 0;

    if (location[station].load >= 0) {
        currentLoad += location[station].load;
        visitedNodes.add(station);
    }
    minCost = Infinity;

    for (const neighbor in location[station].edges) {
        if (visitedNodes.has(neighbor) || location[neighbor].load == 0)
            continue;

        currentCost = calculateCost(location[neighbor].edges[station], currentLoad);
        minCost = Math.min(minCost, currentCost + dfs(neighbor, currentLoad, visitedNodes));
    }

    if (minCost === Infinity)
        minCost = 0;

    return minCost;
}

const weights = {
    "A": 3,
    "B": 2,
    "C": 8,
    "D": 12,
    "E": 25,
    "F": 15,
    "G": 0.5,
    "H": 1,
    "I": 2
};

app.post('/', (req, res) => {
    const items = {
        "A": 0,
        "B": 0,
        "C": 0,
        "D": 0,
        "E": 0,
        "F": 0,
        "G": 0,
        "H": 0,
        "I": 0
    };

    const requestData = req.body;

    for (const key in requestData) {
        if (items.hasOwnProperty(key)) {
            if (typeof requestData[key] === 'number' && requestData[key] >= 0) {
                items[key] = requestData[key];
            } else {
                return res.status(500).json({ error: `Value for property '${key}' is not a natural number: ${requestData[key]}` });
            }
        }
    }

    for (const key in items)
        items[key] = weights[key] * items[key];

    location.C1.load = items.A + items.B + items.C;
    location.C2.load = items.D + items.E + items.F;
    location.C3.load = items.G + items.H + items.I;

    printGraph(location);

    minCost = Infinity;
    visitedNodes = new Set()
    for (const station in location) {
        minCost = Math.min(minCost, dfs(station, 0, visitedNodes));
        visitedNodes.clear();
    }
    console.log(minCost);
    res.json({ minCost });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(
        `Hello from Cloud Run! The container started successfully and is listening for HTTP requests on ${PORT}`
    );
});
