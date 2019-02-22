const axios = require('axios')
const fs = require('fs')

// if (bounds.N > bounds.S && bounds.E > bounds.O)
const make_query_busses = (bounds) => `[out:csv(::id,"name")];relation["type"="route_master"]["route_master"="bus"];relation(r)(${bounds.S},${bounds.O},${bounds.N},${bounds.E});._;out;`
const make_query_route = (id_relation) => `[out:json];relation(${id_relation});way(r);out geom;`

const fetch_busses = (bounds) => fetch_overpass(make_query_busses(bounds))
const fetch_route = (id_relation) => fetch_overpass(make_query_route(id_relation))

const timeout = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const stop_map = {}
const add_stop = (stop_id, stop_name) => {
    if (!stop_map[stop_id])
        stop_map[stop_id] = { stop_id: stop_id, stop_name: [stop_name] }
    else
        stop_map[stop_id].stop_name.push(stop_name)

}
const make_stop_name_pretty = () => {
    let tmp_stop_map = stop_map
    for (let stop_index in tmp_stop_map) {
        let tmp_stop_name = {}
        let tmp_pretty_name = ""
        tmp_stop_map[stop_index].stop_name.forEach(value => {
            if (!tmp_stop_name[value] && tmp_stop_name[value] != "innominada")
                tmp_stop_name[value] = value
        })
        for (let name_index in tmp_stop_name) {
            tmp_pretty_name += tmp_stop_name[name_index] + " y "
        }
        tmp_pretty_name = tmp_pretty_name.slice(0, -3);
        tmp_stop_map[stop_index].stop_name = tmp_pretty_name
    }
    return JSON.stringify(tmp_stop_map)
}


const fetch_overpass = (query) => axios
    .post('http://www.overpass-api.de/api/interpreter', query)
    .then(response => {
        if (response.status == 200 && response.data) {
            return response.data
        } else {
            throw `error server : ${response.status}`
        }
    })

const osm_to_geojson = async (bounds) => {
    let data_busses = await fetch_busses(bounds)
        .then(response => {
            let content = response.split("\n")
            content.shift()
            content.pop()
            return content
        })
    let res_busses = {}

    let routes_completes = 0
    let routes_incompletes = 0
    let routes_json = []

    let log_file = ""
    let log_file_error = ""

    for (let bus of data_busses) {
        let bus_info = bus.split("\t")
        let bus_name = bus_info[1].split(':')
        let tmp_route = { id: bus_info[0], name: bus_name[1] }
        await load_route(tmp_route.id)
            .then(route => {
                console.log(`Done  >>> ${bus_name}`)
                log_file += `\nDone >>> ${bus_name}`
                let route_json = {
                    "type": "Feature",
                    "properties": { name: bus_name[0], route: bus_name[1], stroke: "blue" },
                    "geometry": {
                        "type": "LineString",
                        "coordinates": route.points
                    }
                }
                routes_json.push(route_json)
                routes_completes++
                tmp_route.route = route.points
                if (!res_busses[bus_name[0]]) {
                    res_busses[bus_name[0]] = { name: bus_name[0], routes: [tmp_route] }
                } else {
                    res_busses[bus_name[0]].routes.push(tmp_route)
                }
            })
            .catch((error) => {
                console.log(`Error --- ${bus_name}`)
                log_file_error += `>>>\n${bus_name}\nhttps://www.openstreetmap.org/relation/${tmp_route.id}\n${error}\n\n<<<`
                routes_incompletes++
            })
        await timeout(1000);
    }
    let geojson_file = {
        "type": "FeatureCollection",
        "features": routes_json
    }
    console.log(`routes dowloaded : ${routes_completes}`, `routes to fix : ${routes_incompletes}`)
    fs.writeFileSync(`./out/routes.geojson`, JSON.stringify(geojson_file))
    fs.writeFileSync(`./out/log.txt`, log_file)
    fs.writeFileSync(`./out/log_error.txt`, log_file_error)
    fs.writeFileSync(`./out/stops.json`, make_stop_name_pretty(stop_map))
    return res_busses

}
async function load_route(id_relation) {
    let route_elements = await fetch_route(id_relation).then(response => response.elements)
    let list_double_sense = []
    let list_single_sense = []
    for (let way of route_elements) {
        let tmp_part_container = new PartContainer(way)
        if (tmp_part_container.oneway)
            list_single_sense.push(new PartContainer(way))
        else
            list_double_sense.push(new PartContainer(way))
    }
    let main_list
    if (list_single_sense.length > 0)
        main_list = list_single_sense.concat(list_double_sense)
    else
        throw ("**************** route undefined **************")

    let part_pos = 0;
    let main_list_tam = main_list.length
    while (part_pos < main_list_tam) {
        let tmp_way = main_list[part_pos]
        part_pos++
        for (let way_to_join of main_list) {
            if (tmp_way.merge(way_to_join)) {
                let index = main_list.indexOf(way_to_join);
                main_list.splice(index, 1);
                main_list_tam = main_list.length
                part_pos = 0;
                break
            }
        }
    }
    if (main_list.length > 1) {
        let res_error = ""
        res_error += `\nrel(${id_relation});out geom;`
        main_list.forEach(part => {
            res_error += `\n${part.toString()}`
        })
        throw res_error
    }
    let tmp_way = main_list[0].start
    let tmp_points = []
    //tmp_nodes is an array with nodes or points from osm it can be use as stops
    let tmp_nodes = []
    do {
        tmp_points = tmp_points.concat(tmp_way.geometry)
        tmp_nodes = tmp_nodes.concat(tmp_way.nodes)
        let way_tag_name = tmp_way.tags && tmp_way.tags.name ? tmp_way.tags.name : "innominada"
        for (let way_node of tmp_way.nodes)
            add_stop(way_node + "", way_tag_name)
        // tmp_way also has tags with some extra information like street name
        tmp_way = tmp_way.next
    } while (tmp_way)

    let res_points = []
    for (let point of tmp_points) {
        res_points.push([point.lon, point.lat])
    }
    return { nodes: tmp_nodes, points: res_points }
}

class PartContainer {
    constructor(end) {
        this.setValues(end)
        this.size = 1
    }
    toString() {
        return `way(${this.start.id});out geom;way(${this.end.id});out geom;`
    }
    setValues(end) {
        this.end = end
        let start = end
        let oneway = start.tags && start.tags.oneway && start.tags.oneway == "yes"
        this.start = start
        this.oneway = oneway
        this.node_start = this.start.nodes[0]
        this.node_end = this.end.nodes[this.end.nodes.length - 1]
    }
    merge(toJoin) {
        if (this.start.id != toJoin.start.id) {
            if (this.node_end == toJoin.node_start) {
                this.end.next = toJoin.start
                toJoin.start.last = this.end
                this.end = toJoin.end
                this.node_end = this.end.nodes[this.end.nodes.length - 1]
                this.size += toJoin.size
                return true
            } else if (!toJoin.oneway && this.node_end == toJoin.node_end) {
                toJoin.reverse()
                this.end.next = toJoin.end
                toJoin.end.last = this.end
                this.end = toJoin.start
                this.node_end = toJoin.node_start
                this.size += toJoin.size
                return true
            } else if (!toJoin.oneway && this.node_start == toJoin.node_start) {
                toJoin.reverse()
                this.start.last = toJoin.start
                toJoin.start.next = this.start
                this.start = toJoin.end
                this.node_start = toJoin.node_end
                this.size += toJoin.size
                return true
            } else {
                return false
            }
        }
    }

    reverse() {
        let tmp_start_next = this.start
        do {
            let tmp_start = tmp_start_next
            tmp_start_next = tmp_start.next
            tmp_start.geometry.reverse()
            tmp_start.nodes.reverse()
            let tmp_next = tmp_start.next
            let tmp_last = tmp_start.last
            if (tmp_next)
                tmp_start.last = tmp_next
            else
                delete tmp_start.last
            if (tmp_last)
                tmp_start.next = tmp_last
            else
                delete tmp_start.next
        } while (tmp_start_next)
    }
}

module.exports = ({ bounds }) => osm_to_geojson(bounds)