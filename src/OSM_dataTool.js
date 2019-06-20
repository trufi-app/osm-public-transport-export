const { point } = require('@turf/helpers')
const isEqual = require('@turf/boolean-equal').default
const debug = require('./debug')
const routeExtractor = require('./route_extractor')

module.exports = function ({ routes, ways, assumeFirstWayIsStart, mapProperties, formatStopName }) {
    const stops = {}
    const geojson_features = []
    let routes_complete = 0
    let routes_incomplete = 0
    let log_file = []
    let log_file_error = []

    for (let key in routes) {
        const current_route = routes[key]
        const name = current_route.tags.name
        debug(`Processing route ${name}`)

        try {
            const data = routeExtractor(current_route, ways, assumeFirstWayIsStart)

            routes_complete++
            log_file.push(Object.assign({ id: current_route.id }, current_route.tags))

            debug(`${data.points.length} points in route`)
            data.points = filterPoints(data.points)
            debug(`${data.points.length} points after filtering`)

            geojson_features.push({
                "type": "Feature",
                "properties": mapProperties(current_route.tags),
                "geometry": {
                    "type": "LineString",
                    "coordinates": data.points,
                    "nodes": data.nodes,
                }
            })

            // Merge stop names
            Object.keys(data.stops).forEach(stop_id => {
                if (stops[stop_id]) {
                    stops[stop_id] = stops[stop_id].concat(data.stops[stop_id])
                } else {
                    stops[stop_id] = data.stops[stop_id]
                }
            })
        } catch (error) {
            debug(`Error: ${error.extractor_error || error.message}`)
            log_file_error.push(Object.assign({
                id: current_route.id,
                error_log: error.extractor_error ? error : "not controlled"
            }, current_route.tags))
            routes_incomplete++
        }
    }

    log_file = { completed: log_file, with_error: log_file_error }

    const geojson_feature_collection = {
        "type": "FeatureCollection",
        "features": geojson_features
    }
    const formatted_stops = format_stop(stops, formatStopName)

    return {
        geojson: geojson_feature_collection,
        stops: formatted_stops,
        log: log_file,
    }
}

function format_stop(stops, formatStopName) {
    const result = {}

    Object.keys(stops).forEach(stop_id => {
        const stop_names = stops[stop_id]
        const stop_names_filtered = stop_names
            .filter((value, index, self) => self.indexOf(value) === index)
            .filter(value => value !== "")
        const stop_name = formatStopName(stop_names_filtered);

        result[stop_id] = stop_name
    })

    return result
}

function filterPoints(points) {
    const result = []
    let last = null

    for (let i = 0; i < points.length; i++) {
        const cur = points[i]

        if (last) {
            if (isEqual(point(last), point(cur))) {
                continue
            }
        }

        last = cur
        result.push(cur)
    }

    return result
}
