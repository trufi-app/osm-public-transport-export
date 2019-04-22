const WayPartContainer = require('./way_part_container')

module.exports = function (route_elements, ways) {
    const way_parts_unidirectional = []
    const way_parts_bidirectional = []
    const ways_processed = {}

    for (const member of route_elements.members) {
        if (member.type == "way") {
            if (ways_processed[member.ref]) {
                throw new Error(`duplicated street\n\nrel(${route_elements.id});out geom;\nway(${member.ref});out geom;`)
            }
            
            if (!ways[member.ref]) {
                throw new Error(`undefined street\n\nrel(${route_elements.id});out geom;\nway(${member.ref});out geom;`)
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

    if (way_parts_unidirectional.length === 0) {
        throw new Error("**************** route undefined **************")
    }

    let way_parts = way_parts_unidirectional.concat(way_parts_bidirectional)
    let part_pos = 0;
    let way_parts_tam = way_parts.length

    while (part_pos < way_parts_tam) {
        let tmp_way = way_parts[part_pos]
        part_pos++

        for (let way_to_join of way_parts) {
            if (tmp_way.merge(way_to_join)) {
                const index = way_parts.indexOf(way_to_join);
                way_parts.splice(index, 1);
                way_parts_tam = way_parts.length
                part_pos = 0;
                break
            }
        }
    }

    if (way_parts.length > 1) {
        let res_error = `\nrel(${route_elements.id});out geom;`

        way_parts.forEach(part => {
            res_error += `\n${part.toString()}`
        })

        throw new Error(res_error)
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
