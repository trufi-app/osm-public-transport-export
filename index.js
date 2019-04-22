const { getWays, getRoutes } = require('./src/OSM_downloader')
const convertGeoJSON = require('./src/OSM_dataTool')
const fs = require('fs')
const path = require('path')

const defaultOptions = {
    bounds: null,
    outputDir: null,
    assumeFirstWayIsStart: false,
    geojsonFilename: 'routes.geojson',
    logFilename: 'log.txt',
    stopsFilename: 'stops.json',
    stopNameSeparator: ' and ',
    stopNameFallback: 'Unnamed Street',
    formatStopName: function (names) { return names.join(this.stopNameSeparator) || this.stopNameFallback },
    mapProperties: function (tags) { return tags },
}

async function osmToGeojson(options = {}) {
    options = Object.assign({}, defaultOptions, options)

    // Rebind functions to new options object
    Object.keys(options).forEach(key => {
        if (typeof options[key] === "function") {
            options[key] = options[key].bind(options)
        }
    });

    const {
        bounds,
        outputDir,
        assumeFirstWayIsStart,
        geojsonFilename,
        logFilename,
        stopsFilename,
        formatStopName,
        mapProperties,
    } = options;

    if (!bounds) {
        throw new Error('Missing bounds')
    }

    if (typeof bounds !== "object" || bounds.north < bounds.south || bounds.east < bounds.west) {
        throw new Error('Invalid bounds')
    }

    if (outputDir !== null && typeof outputDir !== "string") {
        throw new Error('Invalid outputDir');
    }

    if (outputDir && !fs.existsSync(path.dirname(outputDir))) {
        throw new Error('Output directory does not exist')
    }

    const bbox = `${bounds.south},${bounds.west},${bounds.north},${bounds.east}`
    const routes = await getRoutes(bbox)
    const ways = await getWays(bbox)
    const data = convertGeoJSON({ routes, ways, assumeFirstWayIsStart, mapProperties, formatStopName })

    if (outputDir) {
        fs.writeFileSync(path.join(outputDir, geojsonFilename), JSON.stringify(data.geojson))
        fs.writeFileSync(path.join(outputDir, logFilename), data.log)
        fs.writeFileSync(path.join(outputDir, stopsFilename), JSON.stringify(data.stops))
    }

    return data
}

module.exports = osmToGeojson
