const osmToGeojson = require('..')

osmToGeojson({
    bounds: {
        south: 5.509657,
        west: -0.316450,
        north: 5.886880,
        east: 0.120503,
    },
    assumeFirstWayIsStart: true,
    outputDir: __dirname + '/out/ghana-accra',
    mapProperties: (tags) => ({
        ...tags,
        stroke: '#164154',
        "stroke-width": 5,
    }),
})
    .then(data => {
        console.log("done")
    })
    .catch(console.log)