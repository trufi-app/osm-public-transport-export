const routeExtractor = require('./route_extractor')

module.exports = function ({ routes, ways, assumeFirstWayIsStart, mapProperties, formatStopName }) {
    const stops = {}
    const geojson_features = []
    let routes_complete = 0
    let routes_incomplete = 0
    let log_file = ''
    let log_file_error = ''

    for (let key in routes) {
        const current_route = routes[key]

        try {
            const data = routeExtractor(current_route, ways, assumeFirstWayIsStart)

            routes_complete++
            log_file += `\nDone >>> ${current_route.tags.name}`

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
            routes_incomplete++
            log_file_error += `--->>>\n\n${current_route.tags.name}\nhttps://www.openstreetmap.org/relation/${current_route.id}\n${error.message}\n\n<<<---`
        }
    }

    log_file = `\nroutes downloaded : ${routes_complete}\n\n${log_file}\n\n\nroutes to fix : ${routes_incomplete}\n\n${log_file_error}`

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