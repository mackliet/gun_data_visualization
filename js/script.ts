import * as d3 from 'd3';
import {MigrationPatterns} from "./Data/MigrationPatterns";
import {Table} from "./Views/Table";
import {HeatMap} from "./Views/HeatMap";

const tableSelection = d3.select('.dataTable');
const tableDims = {
    height: 1000,
    width: 500
};
const geoSelection = d3.select('.geoHeat');
const geoDims = {
    height: 1000,
    width: 1000
};

d3.json('data/migration.json').then((data) => {
    const migrationPatterns = new MigrationPatterns(data);
    const table = new Table(migrationPatterns, tableSelection, tableDims);
    const geo = new HeatMap(migrationPatterns, geoSelection, geoDims);
    // console.log(migrationPatterns.yearsAsArray())
});
