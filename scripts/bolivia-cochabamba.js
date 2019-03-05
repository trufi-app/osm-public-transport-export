const OSMDownloader = require('..')
async function main() {
    let bounds = {
        "N": -17.276198,
        "S": -17.57727,
        "E": -65.96397,
        "O": -66.376555
    }
    let out_folder = __dirname + "/out/bolivia-cochabamba"
    let data_result = await OSMDownloader.getRoutesAndWays(bounds, out_folder)
    await OSMDownloader.convertGeoJSON(data_result, out_folder)
}
main().catch(console.log)