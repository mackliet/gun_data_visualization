import * as d3 from 'd3';
import {MigrationPatterns} from "./Data/MigrationPatterns";
import {Table} from "./Views/Table";
import {HeatMap} from "./Views/HeatMap";
import {ChordDiagram} from "./Views/ChordDiagram";

const tableSelection = d3.select('.dataTable');
const tableDims = {
    height: 1000,
    width: 500
};
const geoSelection = d3.select('.geoHeat');
const geoDims = {
    height: 650,
    width: 1000
};

// TODO Chord Diagram Integration
// const chordSelection = d3.select('.chord');
// const chordDims = {
//     height: 500,
//     width: 1000
// };

d3.json('data/migration.json').then((data) => {
    const migrationPatterns = new MigrationPatterns(data);
    const table = new Table(migrationPatterns, tableSelection, tableDims);
    const geo = new HeatMap(migrationPatterns, geoSelection, geoDims);
    // TODO Chord Diagram Integration
    // const chord = new ChordDiagram(migrationPatterns, chordSelection, chordDims)
});
