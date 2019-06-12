const osmToGeojson = require('..')

osmToGeojson({
    bounds: {
        south: -17.57727,
        west: -66.376555,
        north: -17.276198,
        east: -65.96397,
    },
    outputDir: __dirname + '/out/bolivia-cochabamba',
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