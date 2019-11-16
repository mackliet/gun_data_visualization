import * as d3 from 'd3';
import {MigrationPatterns} from "./Data/MigrationPatterns";
import {Year_to_indicators_map, build_year_to_indicators_map} from "./Data/State_indicators";
import {Table} from "./Views/Table";
import {HeatMap} from "./Views/HeatMap";
import {ChordDiagram} from "./Views/ChordDiagram";
import {Scatterplot} from "./Views/Scatterplot";

// TODO Move this global stuff in some super utility class that is executed before everything else
declare global {
    interface String {
        clean(): string
    }
}

String.prototype.clean = function (this: string) {
    return this.replace(/\s/g, "_")
};

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

const scatterSelection = d3.select('.scatterplot');
const scatterDims = {
    height: 700,
    width: 700
};

// TODO Chord Diagram Integration
// const chordSelection = d3.select('.chord');
// const chordDims = {
//     height: 500,
//     width: 1000
// };

d3.json('data/migration_and_economic_data.json').then((data) => {
    const migrationPatterns = new MigrationPatterns(data);
    const table = new Table(migrationPatterns, tableSelection, tableDims);
    const geo = new HeatMap(migrationPatterns, geoSelection, geoDims);
    const scatter = new Scatterplot(build_year_to_indicators_map(data), scatterSelection, scatterDims);
    // TODO Chord Diagram Integration
    // const chord = new ChordDiagram(migrationPatterns, chordSelection, chordDims)
});
