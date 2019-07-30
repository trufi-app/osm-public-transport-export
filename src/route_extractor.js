const WayPartContainer = require('./way_part_container')
const extractor_error = require('./extractor_error')
const reverseWay = (current_way) => {
    current_way.geometry = current_way.geometry.reverse()
    current_way.nodes = current_way.nodes.reverse()
}
const isNextWay = (last_way, current_way) => {
    let res = last_way.nodes[last_way.nodes.length - 1] == current_way.nodes[0]
    if (!res && current_way && current_way.tags && current_way.tags.oneway != "yes") {
        reverseWay(current_way)
        res = last_way.nodes[last_way.nodes.length - 1] == current_way.nodes[0]
    }
    return res
}
const isPreviousWay = (last_way, current_way) => {
    let res = last_way.nodes[0] == current_way.nodes[current_way.nodes.length - 1]
    if (!res && current_way && current_way.tags && current_way.tags.oneway != "yes") {
        reverseWay(current_way)
        res = last_way.nodes[0] == current_way.nodes[current_way.nodes.length - 1]
    }
    return res
}
module.exports = function (route_elements, ways) {
    const way_res = []
    let indexFirstOneWay
    for (const index in route_elements.members) {
        const element = route_elements.members[index]
        if (element.type == "way") {
            let current_way = ways[element.ref]
            if (current_way && current_way.tags && current_way.tags.oneway == "yes") {
                indexFirstOneWay = index
                break;
            }
        }
    }
    if (!indexFirstOneWay) {
        throw { extractor_error: extractor_error.undefined, uri: `https://overpass-turbo.eu/?Q=${encodeURI(`//${extractor_error.undefined}\nrel(${route_elements.id});out geom;`)}&R` }
    }
    let last_way
    let current_way
    for (let index = indexFirstOneWay; index < route_elements.members.length; index++) {
        last_way = current_way
        let tmp_member = route_elements.members[index]
        if (tmp_member.type == "way") {
            current_way = Object.assign({}, ways[tmp_member.ref])
            if (!last_way || isNextWay(last_way, current_way)) {
                way_res.push(current_way)
            } else {
                throw { extractor_error: extractor_error.not_next, uri: `https://overpass-turbo.eu/?Q=${encodeURI(`//${extractor_error.not_next}\nrel(${route_elements.id});out geom;\nway(${last_way.id});out geom;out geom;\nway(${current_way.id});out geom;`)}&R` }
            }
        }
    }
    current_way = way_res[0]
    for (let index = indexFirstOneWay - 1; index >= 0; index--) {
        last_way = current_way
        let tmp_member = route_elements.members[index]
        if (tmp_member.type == "way") {
            current_way = Object.assign({}, ways[tmp_member.ref])
            if (isPreviousWay(last_way, current_way)) {
                way_res.unshift(current_way)
            } else {
                throw { extractor_error: extractor_error.not_next, uri: `https://overpass-turbo.eu/?Q=${encodeURI(`//${extractor_error.not_next}\nrel(${route_elements.id});out geom;\nway(${last_way.id});out geom;out geom;\nway(${current_way.id});out geom;`)}&R` }
            }
        }
    }
    let res_nodes = way_res.map(element => element.id)
    let tmp_stops = {}
    let tmp_pointss = []
    way_res.forEach(element => {
        for (const node_id of element.nodes) {
            const stop_id = String(node_id)
            const stop_name = element.tags && element.tags.name || ""

            if (!tmp_stops[stop_id]) {
                tmp_stops[stop_id] = [stop_name]
            } else {
                tmp_stops[stop_id].push(stop_name)
            }
        }
        tmp_pointss = tmp_pointss.concat(element.geometry.map(point => ([point.lon, point.lat])))
    })
    return {
        nodes: res_nodes,
        stops: tmp_stops,
        points: tmp_pointss,
    }
}
