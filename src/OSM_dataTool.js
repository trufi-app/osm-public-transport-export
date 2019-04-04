const { routeExtractor } = require('./route_extractor')
exports.convertGeoJSON = async function (data) {
    let routes = data.routes
    let ways = data.ways
    let routes_completes = 0
    let routes_incompletes = 0
    let log_file = ''
    let log_file_error = ''
    let routes_json = []
    const stop_map = {}
    
    for (let key in routes) {
        let current_route = routes[key]
        await routeExtractor(current_route, ways, stop_map)
            .then((reponse) => {
                routes_completes++
                log_file += `\nDone >>> ${current_route.tags.name}`
                let route_json = {
                    "type": "Feature",
                    "properties": {
                        "stroke-width": 5,
                        name: current_route.tags.ref,
                        route: current_route.tags.name,
                        stroke: '#164154'
                    },
                    "geometry": {
                        "type": "LineString",
                        "coordinates": reponse.points,
                        "nodes": reponse.nodes,
                    }
                }
                routes_json.push(route_json)
            })
            .catch(error => {
                routes_incompletes++
                log_file_error += `--->>>\n\n${current_route.tags.name}\nhttps://www.openstreetmap.org/relation/${current_route.id}\n${error}\n\n<<<---`
            })
    }
    let geojson_file = {
        "type": "FeatureCollection",
        "features": routes_json
    }
    log_file = `\nroutes dowloaded : ${routes_completes}\n\n${log_file}\n\n\nroutes to fix : ${routes_incompletes}\n\n${log_file_error}`
    let pretty_stops = make_stop_name_pretty(stop_map)
    return { geojson: geojson_file, stops: pretty_stops, log: log_file }
}

const make_stop_name_pretty = (data_map) => {
    const tmp_stop_map = {}
    Object.keys(data_map).forEach(key => {
        const orig = data_map[key]
        tmp_stop_map[key] = {
            stop_id: orig.stop_id,
            stop_name: orig.stop_name
                .filter((value, index, self) => self.indexOf(value) === index)
                .filter(value => value !== "")
                .join(" y ") ||
                "innominada"
        }
    })
    return tmp_stop_map
}