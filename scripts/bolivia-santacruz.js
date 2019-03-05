const OSMDownloader = require('..')
async function main() {
    let bounds = {
        "N": -17.450664,
        "S": -17.886393,
        "E": -63.012309,
        "O": -63.331502
    }
    let out_folder = __dirname + "/out/bolivia-santacruz"
    let data_result = await OSMDownloader.getRoutesAndWays(bounds, out_folder)
    await OSMDownloader.convertGeoJSON(data_result, out_folder)
}
main().catch(console.log)