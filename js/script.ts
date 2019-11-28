import * as d3 from 'd3';
import {MigrationPatterns} from "./Data/MigrationPatterns";
import {build_year_to_indicators_map} from "./Data/State_indicators";
import {Table} from "./Views/Table";
import {HeatMap} from "./Views/HeatMap";
import {Scatterplot} from "./Views/Scatterplot";
import {ViewState} from "./Views/ViewUtils";

// TODO Move this global stuff in some super utility class that is executed before everything else
declare global {
    interface String {
        clean(): string
    }
}

String.prototype.clean = function (this: string) {
    return this.replace(/\s|%/g, "_")
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

let slider = document.getElementById("myRange");
//@ts-ignore

var geo: HeatMap;
var table: Table;
var scatter: Scatterplot;
var migrationPatterns: MigrationPatterns;

d3.json('data/migration_and_economic_data.json').then((data) => {
    migrationPatterns = new MigrationPatterns(data);
    table = new Table(migrationPatterns, tableSelection, tableDims);
    geo = new HeatMap(migrationPatterns, geoSelection, geoDims);
    scatter = new Scatterplot(build_year_to_indicators_map(data), scatterSelection, scatterDims);
    // TODO Chord Diagram Integration
    // const chord = new ChordDiagram(migrationPatterns, chordSelection, chordDims)
});

// Bind year event to various views
// TODO Bind to scatterplot and table
slider.oninput = function() {
    //@ts-ignore
    const minYear = Math.min(...migrationPatterns.years);
    const maxYear = Math.max(...migrationPatterns.years);
    const scale = d3.scaleLinear().domain([1, 13]).range([minYear,maxYear]);
    //@ts-ignore
    const curYear = Math.round(scale(this.value));
    geo.changeYear(curYear);
    scatter.change_year(curYear);
    for (const obj of Array.from([geo, table])) {
        obj.changeYear(curYear);
    }
    console.log(`Year: ${curYear}`)
};

// Bind migration statistic to event listeners on the migration statistic dropdown
d3.selectAll('.dropdown-item').data([ViewState.net, ViewState.in, ViewState.out]).on('click', (d) => {
    geo.toggleMigrationStatistic(d);
});
