const http = require('http');

function overpassRequest(query) {
    return new Promise((resolve, reject) => {
        const request = http.request({
            method: 'POST',
            host: 'www.overpass-api.de',
            path: '/api/interpreter',
        }, response => {
            response.setEncoding('utf8');

            let data = '';

            response.on('data', (chunk) => {
              data += chunk;
            });

            response.on('end', () => {
                const parsedData = JSON.parse(data);
                resolve(parsedData);
            });
        });

        request.on('error', reject);
        request.write(query);
        request.end();
    });
}

function indexElementsById(response) {
    const map = {};

    response.elements.forEach(element => {
        map[element.id] = element;
    });

    return map;
}

function checkBounds(bounds) {
    if (!bounds) {
        throw new Error('Missing bounds');
    }

    if (bounds.N < bounds.S || bounds.E < bounds.O) {
        throw new Error('Invalid bounds');
    }
}

function getAllWays(bounds) {
    checkBounds(bounds);
    const query = `[out:json];way["highway"~"residential|primary|secondary|tertiary|trunk|trunk-link|service"](${bounds.S},${bounds.O},${bounds.N},${bounds.E});out geom;`;
    return overpassRequest(query).then(indexElementsById);
}

function getWays(bounds) {
    checkBounds(bounds);
    const query = `[out:json];rel["type"="route"]["route"~"bus|share_taxi"](${bounds.S},${bounds.O},${bounds.N},${bounds.E});way(r);out geom;`;
    return overpassRequest(query).then(indexElementsById);
}

function getRoutes(bounds) {
    checkBounds(bounds);
    const query = `[out:json];rel["type"="route"]["route"~"bus|share_taxi"](${bounds.S},${bounds.O},${bounds.N},${bounds.E});out body;`;
    return overpassRequest(query).then(indexElementsById);
}

module.exports = {
    getAllWays,
    getWays,
    getRoutes,
};
