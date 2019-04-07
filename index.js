const { getWays, getRoutes } = require('./src/OSM_downloader')
const convertGeoJSON = require('./src/OSM_dataTool')
const fs = require('fs')
const path = require('path')

async function osmToGeojson(bounds, outputDir) {
    const routes = await getRoutes(bounds)
    const ways = await getWays(bounds)
    const data = await convertGeoJSON({ routes, ways }, outputDir)

    if (outputDir) {
        if (!fs.existsSync(path.dirname(outputDir))) {
            throw new Error(`Output directory does not exist`)
        }
        
        fs.writeFileSync(path.join(outputDir, "routes.geojson"), JSON.stringify(data.geojson))
        fs.writeFileSync(path.join(outputDir, "log.text"), data.log)
        fs.writeFileSync(path.join(outputDir, "stops.json"), JSON.stringify(data.stops))
    }

    return data
}

module.exports = osmToGeojson
