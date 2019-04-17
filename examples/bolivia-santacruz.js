const osmToGeojson = require('..')

osmToGeojson({
    bounds: {
        south: -17.886393,
        west: -63.331502,
        north: -17.450664,
        east: -63.012309,
    },
    outputDir: __dirname + '/out/bolivia-santacruz',
    mapProperties: (tags) => ({
        ...tags,
        stroke: '#164154',
        "stroke-width": 5,
    }),
    stopNameSeparator: ' y ',
    stopNameFallback: 'innominada',
})
    .then(data => {
        console.log("done")
    })
    .catch(console.log)