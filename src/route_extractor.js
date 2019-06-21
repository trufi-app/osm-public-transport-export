const WayPartContainer = require('./way_part_container')
const extractor_error = require('./extractor_error')

module.exports = function (route_elements, ways, assumeFirstWayIsStart) {
    const way_parts_unidirectional = []
    const way_parts_bidirectional = []
    const ways_processed = {}

    for (const member of route_elements.members) {
        if (member.type == "way") {
            if (ways_processed[member.ref]) {
                throw { extractor_error: extractor_error.duplicated, uri: `https://overpass-turbo.eu/?Q=${encodeURI(`//${extractor_error.duplicated}\nrel(${route_elements.id});out geom;\nway(${member.ref});out geom;`)}&R` }
            }

            if (!ways[member.ref]) {
                throw { extractor_error: extractor_error.undefined_street, uri: `https://overpass-turbo.eu/?Q=${encodeURI(`//${extractor_error.undefined_street}\nrel(${route_elements.id});out geom;\nway(${member.ref});out geom;`)}&R` }

            }

            const way = JSON.parse(JSON.stringify(ways[member.ref]))
            const part_container = new WayPartContainer(way)

            if (part_container.oneway) {
                way_parts_unidirectional.push(part_container)
            } else {
                way_parts_bidirectional.push(part_container)
            }

            ways_processed[member.ref] = true
        }
    }

    if (way_parts_unidirectional.length === 0 && !assumeFirstWayIsStart) {
        throw { extractor_error: extractor_error.undefined, uri: `https://overpass-turbo.eu/?Q=${encodeURI(`//${extractor_error.undefined}\nrel(${route_elements.id});out geom;`)}&R` }
    }

    let way_parts = way_parts_unidirectional.concat(way_parts_bidirectional)
    let part_pos = 0

    // For each way part, try to combine it with all other way parts.
    // If for a part A, a part B can be found that can be merged into A,
    // we merge, keep the new part A' and remove part B from the list.
    // Two parts can be merged if the start node of a part A is the same
    // as the end node of a part B or vice versa. We continue doing this
    // until we cannot merge any two parts in the list anymore.
    while (part_pos < way_parts.length) {
        let tmp_way = way_parts[part_pos]
        part_pos++

        for (let way_to_join of way_parts) {
            if (tmp_way.merge(way_to_join)) {
                // Remove merged item from the list and start at the beginning
                const index = way_parts.indexOf(way_to_join)
                way_parts.splice(index, 1)
                part_pos = 0
                break
            }
        }
    }

    // Remaining parts that could not be merged will result
    // in an error (route will be skipped).
    if (way_parts.length > 1) {
        let res_error = `\nrel(${route_elements.id});out geom;`

        way_parts.forEach(part => {
            res_error += `\n${part.toString()}`
        })

        throw { extractor_error: extractor_error.no_mergeable, uri: `https://overpass-turbo.eu/?Q=${encodeURI(`//${extractor_error.no_mergeable}\n${res_error}`)}&R` }
    }

    const result_way = []
    const tmp_stops = []
    let tmp_way = way_parts[0].start
    let tmp_points = []
    let tmp_nodes = []

    do {
        tmp_points = tmp_points.concat(tmp_way.geometry)
        tmp_nodes = tmp_nodes.concat(tmp_way.nodes)

        for (const node_id of tmp_way.nodes) {
            const stop_id = String(node_id)
            const stop_name = tmp_way.tags && tmp_way.tags.name || ""

            if (!tmp_stops[stop_id]) {
                tmp_stops[stop_id] = [stop_name]
            } else {
                tmp_stops[stop_id].push(stop_name)
            }
        }

        // tmp_way also has tags with some extra information like street name
        result_way.push(tmp_way)
        tmp_way = tmp_way.next
    } while (tmp_way)

    return {
        ways: result_way,
        nodes: tmp_nodes,
        stops: tmp_stops,
        points: tmp_points.map(point => ([point.lon, point.lat])),
    }
}
