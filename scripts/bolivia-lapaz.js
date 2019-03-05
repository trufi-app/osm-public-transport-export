const OSMDownloader = require('..')
async function main() {
    let bounds = {
        "N": -16.407350,
        "S": -16.618585,
        "E": -68.012835,
        "O": -68.286253
    }
    let out_folder = __dirname + "/out/bolivia-lapaz"
    let data_result = await OSMDownloader.getRoutesAndWays(bounds, out_folder)
    await OSMDownloader.convertGeoJSON(data_result, out_folder)
}
main().catch(console.log)