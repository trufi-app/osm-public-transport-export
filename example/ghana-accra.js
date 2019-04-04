const osmToGeojson = require('..')

let bounds = {
    "N": 5.886880,
    "S": 5.509657,
    "E": 0.120503,
    "O": -0.316450
}

osmToGeojson(bounds, __dirname + "/out/ghana-accra")
    .then(response => {
        console.log("done")
    })
    .catch(console.log)