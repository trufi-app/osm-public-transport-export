const osmToGeojson = require('..')

let bounds = {
    "N": -17.450664,
    "S": -17.886393,
    "E": -63.012309,
    "O": -63.331502
}

osmToGeojson(bounds, __dirname + "/out/bolivia-santacruz")
    .then(response => {
        console.log("done")
    })
    .catch(console.log)