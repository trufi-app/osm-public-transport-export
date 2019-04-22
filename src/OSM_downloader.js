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

function getAllWays(bbox) {
    const query = `[out:json];way["highway"~"residential|primary|secondary|tertiary|trunk|trunk-link|service"](${bbox});out geom;`;
    return overpassRequest(query).then(indexElementsById);
}

function getWays(bbox) {
    const query = `[out:json];rel["type"="route"]["route"~"bus|share_taxi"](${bbox});way(r);out geom;`;
    return overpassRequest(query).then(indexElementsById);
}

function getRoutes(bbox) {
    const query = `[out:json];rel["type"="route"]["route"~"bus|share_taxi"](${bbox});out body;`;
    return overpassRequest(query).then(indexElementsById);
}

module.exports = {
    getAllWays,
    getWays,
    getRoutes,
};
