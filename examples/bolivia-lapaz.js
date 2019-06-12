const osmToGeojson = require('..')

osmToGeojson({
    bounds: {
        south: -16.618585,
        west: -68.286253,
        north: -16.407350,
        east: -68.012835,
    },
    outputDir: __dirname + '/out/bolivia-lapaz',
    mapProperties: (tags) => ({
        ...tags,
        stroke: '#164154',
        "stroke-width": 5,
    }),
    stopNameSeparator: ' y ',
    stopNameFallback: 'innominada',
})
    .then(data => console.log("done"))
    .catch(error => console.error(error))