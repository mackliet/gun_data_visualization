import {MigrationPatterns} from "../js/Data/MigrationPatterns";
import * as d3 from "d3";
import {Year} from "../js/Data/ImportData";
// Required for testing locally
const fs = require('fs');

describe('Test Migration Patterns Class Construct', () => {


    it('Test Example', async () => {
        try {
            let data = JSON.parse(fs.readFileSync('data/migration.json')) as Year[];
            const migrationPatterns = new MigrationPatterns(data);
            migrationPatterns.data.forEach((value, key) => {
                console.log(key);
            });
            for (const year of migrationPatterns.years) {
                expect(migrationPatterns.data).toHaveProperty(year.toString());
            }


        } catch (e) {
            console.error(e)
        }
    })

});