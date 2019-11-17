import {RegionEnum} from "../js/Data/DataUtils"
import {MigrationPatterns} from "../js/Data/MigrationPatterns";
const fs = require('fs');

let migrationPatterns: MigrationPatterns;
const totalNumberOfYears =  13;
const totalNumberOfRegions = 52;
const years = [...Array.from(Array(totalNumberOfYears).keys())].map((x) => { return x + 2005 });

describe('Test Migration Patterns Class Construct', () => {

    beforeAll(() => {
        // Ingest data
        try {
            let data = JSON.parse(fs.readFileSync('data/migration.json'));
            migrationPatterns = new MigrationPatterns(data);
        } catch (e) {
            console.error(e)
        }
    });

    it('make sure every year is included in the data set', async () => {

        for (const year of years) {
            expect(migrationPatterns.data).toHaveProperty(year.toString());
        }
    });

    it('make sure every year has each region', async () => {
        for (const year of years) {
            // Could not think of a better way to iterate through the enum object, unfortunately
            for (const regionEnumMap of Array.from(Array(totalNumberOfRegions).keys())) {
                expect(migrationPatterns.data[year]).toHaveProperty(regionEnumMap.toString());
            }
        }
    });

    it('make sure each region of every year had an edge to each other node', async () => {
        for (const year of years) {
            // Could not think of a better way to iterate through the enum object, unfortunately
            for (const regionEnumMap of Array.from(Array(totalNumberOfRegions).keys())) {
                expect(migrationPatterns.data[year][regionEnumMap]).toHaveProperty('edges');
                for (const regionEnumMapEdge of Array.from(Array(totalNumberOfRegions).keys())) {
                    if (regionEnumMapEdge !== regionEnumMap ) {
                        expect(migrationPatterns.data[year][regionEnumMap].toEdges)
                            .toHaveProperty(regionEnumMapEdge.toString());
                    }
                }
            }
        }
    });

});