const { WayPartContainer } = require('./way_part_container')
exports.routeExtractor = async function (route_elements, ways, stop_map) {
    let list_double_sense = []
    let list_single_sense = []
    let check = {}
    for (let way of route_elements.members) {
        if (way.type == "way") {
            if (check[way.ref]) throw `duplicated street\n\nrel(${route_elements.id});out geom;\nway(${way.ref});out geom;`
            let tmp_way = ways[way.ref];
            if (!tmp_way) throw `undefined street\n\nrel(${route_elements.id});out geom;\nway(${way.ref});out geom;`
            tmp_way = JSON.parse(JSON.stringify(tmp_way));
            check[way.ref] = way
            let tmp_part_container = new WayPartContainer(tmp_way)
            if (tmp_part_container.oneway)
                list_single_sense.push(new WayPartContainer(tmp_way))
            else
                list_double_sense.push(new WayPartContainer(tmp_way))
        }
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
        res_error += `\nrel(${route_elements.id});out geom;`
        main_list.forEach(part => {
            res_error += `\n${part.toString()}`
        })
        throw res_error
    }
    let tmp_way = main_list[0].start
    let tmp_points = []
    //tmp_nodes is an array with nodes or points from osm it can be use as stops
    let tmp_nodes = []
    let result_way = []
    do {
        tmp_points = tmp_points.concat(tmp_way.geometry)
        tmp_nodes = tmp_nodes.concat(tmp_way.nodes)
        let way_tag_name = tmp_way.tags && tmp_way.tags.name ? tmp_way.tags.name : ""
        for (let way_node of tmp_way.nodes)
            add_stop(String(way_node), way_tag_name, stop_map)
        // tmp_way also has tags with some extra information like street name
        result_way.push(tmp_way)
        tmp_way = tmp_way.next
    } while (tmp_way)

    let res_points = []
    for (let point of tmp_points) {
        res_points.push([point.lon, point.lat])
    }
    return {
        ways: result_way,
        nodes: tmp_nodes,
        points: res_points
    }
}

const add_stop = (stop_id, stop_name, stop_map) => {
    if (!stop_map[stop_id])
        stop_map[stop_id] = {
            stop_id,
            stop_name: [stop_name]
        }
    else
        stop_map[stop_id].stop_name.push(stop_name)
}