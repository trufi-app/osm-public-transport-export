const osmToGeojson = require('./app/osm-to-geojson')

// Export routes of Cochabamba, Bolivia
osmToGeojson({
    "bounds": {
        "N": -17.276198,
        "S": -17.57727,
        "E": -65.96397,
        "O": -66.376555
    }
})