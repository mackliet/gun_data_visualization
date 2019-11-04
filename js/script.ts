import * as d3 from 'd3';
import {MigrationPatterns} from "./Data/MigrationPatterns";


d3.json('data/migration.json').then((data) => {
    new MigrationPatterns(data);
});
