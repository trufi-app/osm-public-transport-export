# OSM Public Transport Downloader
Download the public transport data from [OpenStreetMaps](https://www.openstreetmap.org/#layers=T) in countries where the public transport works with demand of users. Where does not exist buss stops, neither timetable.
### Prerequisites
Make sure you have the following tools installed:
* [git](https://git-scm.com/)
* [Node.js](https://nodejs.org/)
### Installation
After cloning the repository, install all dependencies:
```sh
npm install # install new dependencies
```
### Generate GeoJSON
Generate GeoJSON for all cities:
```sh
npm start
```
Generate GeoJSON for specific city:

| City | Command |
| ------ | ------ |
| Cochabamba | `npm run bolivia:cochabamba` |
| La Paz | `npm run bolivia:lapaz` |
| Santa Cruz | `npm run bolivia:santacruz` |

The the files will be written to `scripts/out/<<city-name>>/geojson.json`. You can preview the data with several tools such as [http://geojson.io/](http://geojson.io/).

![example](/img/routes_geojson_cochabamba.JPG)

### Error handler
The file `scripts/out/<<city-name>>/log_error.text` contains queries with the route errors. You can use [overpass-turbo](http://overpass-turbo.eu/) to run the query.