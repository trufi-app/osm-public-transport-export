const osmToGeojson = require('..')

let bounds = {
    "N": -16.407350,
    "S": -16.618585,
    "E": -68.012835,
    "O": -68.286253
}

osmToGeojson(bounds, __dirname + "/out/bolivia-lapaz")
    .then(response => {
        console.log("done")
    })
    .catch(console.log)