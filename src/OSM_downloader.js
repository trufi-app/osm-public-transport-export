const fs = require('fs')
const axios = require('axios')
const stream = require('stream');
const path = require('path');

function axion_request(query, outFile) {
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
        .then(data => {
            if (outFile) fs.writeFileSync(outFile, JSON.stringify(data))
            return data
        })
}

const getWays = function downloadWays(bounds, outfolder) {
    if (!bounds) throw "missing bounds"
    if (!(bounds.N > bounds.S && bounds.E > bounds.O)) throw "wrong bounds"
    if (!fs.existsSync(outfolder)) fs.mkdirSync(outfolder);
    console.time("ways downloaded")
    return axion_request(
        `[out:json];way["highway"~"residential|primary|secondary|tertiary|trunk|trunk-link|service"](${bounds.S},${bounds.O},${bounds.N},${bounds.E});out geom;`,
        outfolder ? path.join(outfolder, 'ways.json') : null
    ).then(response => {
        console.timeEnd("ways downloaded")
        return response
    })
}

const getOnlyRoutesWays = function downloadWays(bounds, outfolder) {
    if (!bounds) throw "missing bounds"
    if (!(bounds.N > bounds.S && bounds.E > bounds.O)) throw "wrong bounds"
    if (!fs.existsSync(outfolder)) fs.mkdirSync(outfolder);
    console.time("ways downloaded")
    return axion_request(
        `[out:json];rel["type"="route"]["route"~"bus|share_taxi"](${bounds.S},${bounds.O},${bounds.N},${bounds.E});way(r);out geom;`,
        outfolder ? path.join(outfolder, 'ways.json') : null
    ).then(response => {
        console.timeEnd("ways downloaded")
        return response
    })
}

const getRoutes = function downloadRoutes(bounds, outfolder) {
    if (!bounds) throw "missing bounds"
    if (!(bounds.N > bounds.S && bounds.E > bounds.O)) throw "wrong bounds"
    if (!fs.existsSync(outfolder)) fs.mkdirSync(outfolder);
    console.time("routes downloaded")
    return axion_request(
        `[out:json];rel["type"="route"]["route"~"bus|share_taxi"](${bounds.S},${bounds.O},${bounds.N},${bounds.E});out body;`,
        outfolder ? path.join(outfolder, 'routes.json') : null
    ).then(response => {
        console.timeEnd("routes downloaded")
        return response
    })
}

exports.getRoutesAndWays = async function (bounds, outfolder) {
    let routes = await getRoutes(bounds, outfolder)
    let ways = await getOnlyRoutesWays(bounds, outfolder)
    return {
        routes: routes,
        ways: ways
    }
}

exports.getWays = getWays
exports.getRoutes = getRoutes