const {
    getRoutesAndWays,
    getWays,
    getRoutes
} = require('./src/OSM_downloader')
const {
    convertGeoJSON
} = require('./src/OSM_dataTool')

module.exports = {
    convertGeoJSON: convertGeoJSON,
    getRoutesAndWays: getRoutesAndWays,
    getWays: getWays,
    getRoutes: getRoutes
}