const fs = require('fs')
const path = require('path');
const {
    routeExtractor
} = require('./route_extractor')
exports.convertGeoJSON = async function (data, out_folder) {
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
                console.log(`Done  >>> ${current_route.tags.name}`)
                log_file += `\nDone >>> ${current_route.tags.name}`
                let route_json = {
                    "type": "Feature",
                    "properties": {
                        "stroke-width": 5,
                        name: current_route.tags.ref,
                        route: current_route.tags.name,
                        stroke: '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6)
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
                log_file_error += `>>>\n${current_route.tags.name}\nhttps://www.openstreetmap.org/relation/${current_route.id}\n${error}\n\n<<<`
            })
    }
    let geojson_file = {
        "type": "FeatureCollection",
        "features": routes_json
    }
    log_file += `\nroutes dowloaded : ${routes_completes}\nroutes to fix : ${routes_incompletes}`
    console.log(`routes dowloaded : ${routes_completes}`, `routes to fix : ${routes_incompletes}`)
    fs.writeFileSync(path.join(out_folder, "geojson.json"), JSON.stringify(geojson_file))
    fs.writeFileSync(path.join(out_folder, "log.text"), log_file)
    fs.writeFileSync(path.join(out_folder, "log_error.text"), log_file_error)
    fs.writeFileSync(path.join(out_folder, "stops.json"), JSON.stringify(make_stop_name_pretty(stop_map)))
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