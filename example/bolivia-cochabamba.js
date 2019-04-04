const osmToGeojson = require('..')

let bounds = {
    "N": -17.276198,
    "S": -17.57727,
    "E": -65.96397,
    "O": -66.376555
}

osmToGeojson(bounds, __dirname + "/out/bolivia-cochabamba")
    .then(response => {
        console.log("done")
    })
    .catch(console.log)