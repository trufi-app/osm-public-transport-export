const axios = require('axios')
const stream = require('stream');

function axion_request(query) {
    return axios({
        method: 'post',
        url: 'http://www.overpass-api.de/api/interpreter',
        responseType: 'stream',
        data: query
    })
        .then(response => {
            return new Promise((resolve, reject) => {
                let tmp_element = ""
                let write_strem = new stream.Writable({
                    write(chunk, encoding, callback) {
                        tmp_element += chunk.toString()
                        callback();
                    }
                })
                response.data
                    .pipe(write_strem)
                    .on("finish", () => {
                        let tmp_json = JSON.parse(tmp_element)
                        let tmp_element_map = {}
                        tmp_json.elements.forEach(element => {
                            tmp_element_map[element.id] = element
                        });
                        resolve(tmp_element_map)
                    })
            })
        })
}

const getAllWays = function downloadWays(bounds) {
    if (!bounds) throw "missing bounds"
    if (!(bounds.N > bounds.S && bounds.E > bounds.O)) throw "wrong bounds"
    return axion_request(
        `[out:json];way["highway"~"residential|primary|secondary|tertiary|trunk|trunk-link|service"](${bounds.S},${bounds.O},${bounds.N},${bounds.E});out geom;`
    ).then(response => {
        return response
    })
}

const getWays = function downloadWays(bounds) {
    if (!bounds) throw "missing bounds"
    if (!(bounds.N > bounds.S && bounds.E > bounds.O)) throw "wrong bounds"
    return axion_request(
        `[out:json];rel["type"="route"]["route"~"bus|share_taxi"](${bounds.S},${bounds.O},${bounds.N},${bounds.E});way(r);out geom;`
    ).then(response => {
        return response
    })
}

const getRoutes = function downloadRoutes(bounds) {
    if (!bounds) throw "missing bounds"
    if (!(bounds.N > bounds.S && bounds.E > bounds.O)) throw "wrong bounds"
    return axion_request(
        `[out:json];rel["type"="route"]["route"~"bus|share_taxi"](${bounds.S},${bounds.O},${bounds.N},${bounds.E});out body;`
    ).then(response => {
        return response
    })
}

exports.getAllWays = getAllWays
exports.getWays = getWays
exports.getRoutes = getRoutes