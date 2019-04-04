const osmToGeojson = require('..')
const geojsonToGtfs = require('geojson-to-gtfs');

let bounds = {
    "N": -17.276198,
    "S": -17.57727,
    "E": -65.96397,
    "O": -66.376555
}

osmToGeojson(bounds, __dirname + "/out/bolivia-cochabamba")
    .then(response => {
        geojsonToGtfs(response.geojson, __dirname + "/out/bolivia-cochabamba/gtfs");
    })
    .catch(console.log)