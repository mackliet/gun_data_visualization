import * as d3 from 'd3';
import {MigrationPatterns} from "./Data/MigrationPatterns";
import {Table} from "./Views/Table";

const tableSelection = d3.select('.dataTable');
const tableDims = {
    height: 1000,
    width: 500
}


d3.json('data/migration.json').then((data) => {
    const migrationPatterns = new MigrationPatterns(data);
    const table = new Table(migrationPatterns, tableSelection, tableDims);
    console.log(migrationPatterns.yearsAsArray())
});
