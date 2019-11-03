(function (d3) {
    'use strict';

    String.prototype.clean = function () {
        return this.replace(/\s/g, "");
    };
    /**
     * Enumerator representing all 50 States, and other migration regions
     */
    var MigrationNodeId;
    (function (MigrationNodeId) {
        MigrationNodeId[MigrationNodeId["Alabama"] = 0] = "Alabama";
        MigrationNodeId[MigrationNodeId["Alaska"] = 1] = "Alaska";
        MigrationNodeId[MigrationNodeId["Arizona"] = 2] = "Arizona";
        MigrationNodeId[MigrationNodeId["Arkansas"] = 3] = "Arkansas";
        MigrationNodeId[MigrationNodeId["California"] = 4] = "California";
        MigrationNodeId[MigrationNodeId["Colorado"] = 5] = "Colorado";
        MigrationNodeId[MigrationNodeId["Connecticut"] = 6] = "Connecticut";
        MigrationNodeId[MigrationNodeId["Delaware"] = 7] = "Delaware";
        MigrationNodeId[MigrationNodeId["DistrictofColumbia"] = 8] = "DistrictofColumbia";
        MigrationNodeId[MigrationNodeId["Florida"] = 9] = "Florida";
        MigrationNodeId[MigrationNodeId["Georgia"] = 10] = "Georgia";
        MigrationNodeId[MigrationNodeId["Hawaii"] = 11] = "Hawaii";
        MigrationNodeId[MigrationNodeId["Idaho"] = 12] = "Idaho";
        MigrationNodeId[MigrationNodeId["Illinois"] = 13] = "Illinois";
        MigrationNodeId[MigrationNodeId["Indiana"] = 14] = "Indiana";
        MigrationNodeId[MigrationNodeId["Iowa"] = 15] = "Iowa";
        MigrationNodeId[MigrationNodeId["Kansas"] = 16] = "Kansas";
        MigrationNodeId[MigrationNodeId["Kentucky"] = 17] = "Kentucky";
        MigrationNodeId[MigrationNodeId["Louisiana"] = 18] = "Louisiana";
        MigrationNodeId[MigrationNodeId["Maine"] = 19] = "Maine";
        MigrationNodeId[MigrationNodeId["Maryland"] = 20] = "Maryland";
        MigrationNodeId[MigrationNodeId["Massachusetts"] = 21] = "Massachusetts";
        MigrationNodeId[MigrationNodeId["Michigan"] = 22] = "Michigan";
        MigrationNodeId[MigrationNodeId["Minnesota"] = 23] = "Minnesota";
        MigrationNodeId[MigrationNodeId["Mississippi"] = 24] = "Mississippi";
        MigrationNodeId[MigrationNodeId["Missouri"] = 25] = "Missouri";
        MigrationNodeId[MigrationNodeId["Montana"] = 26] = "Montana";
        MigrationNodeId[MigrationNodeId["Nebraska"] = 27] = "Nebraska";
        MigrationNodeId[MigrationNodeId["Nevada"] = 28] = "Nevada";
        MigrationNodeId[MigrationNodeId["NewHampshire"] = 29] = "NewHampshire";
        MigrationNodeId[MigrationNodeId["NewJersey"] = 30] = "NewJersey";
        MigrationNodeId[MigrationNodeId["NewMexico"] = 31] = "NewMexico";
        MigrationNodeId[MigrationNodeId["NewYork"] = 32] = "NewYork";
        MigrationNodeId[MigrationNodeId["NorthCarolina"] = 33] = "NorthCarolina";
        MigrationNodeId[MigrationNodeId["NorthDakota"] = 34] = "NorthDakota";
        MigrationNodeId[MigrationNodeId["Ohio"] = 35] = "Ohio";
        MigrationNodeId[MigrationNodeId["Oklahoma"] = 36] = "Oklahoma";
        MigrationNodeId[MigrationNodeId["Oregon"] = 37] = "Oregon";
        MigrationNodeId[MigrationNodeId["Pennsylvania"] = 38] = "Pennsylvania";
        MigrationNodeId[MigrationNodeId["RhodeIsland"] = 39] = "RhodeIsland";
        MigrationNodeId[MigrationNodeId["SouthCarolina"] = 40] = "SouthCarolina";
        MigrationNodeId[MigrationNodeId["SouthDakota"] = 41] = "SouthDakota";
        MigrationNodeId[MigrationNodeId["Tennessee"] = 42] = "Tennessee";
        MigrationNodeId[MigrationNodeId["Texas"] = 43] = "Texas";
        MigrationNodeId[MigrationNodeId["Utah"] = 44] = "Utah";
        MigrationNodeId[MigrationNodeId["Vermont"] = 45] = "Vermont";
        MigrationNodeId[MigrationNodeId["Virginia"] = 46] = "Virginia";
        MigrationNodeId[MigrationNodeId["Washington"] = 47] = "Washington";
        MigrationNodeId[MigrationNodeId["WestVirginia"] = 48] = "WestVirginia";
        MigrationNodeId[MigrationNodeId["Wisconsin"] = 49] = "Wisconsin";
        MigrationNodeId[MigrationNodeId["Wyoming"] = 50] = "Wyoming";
        MigrationNodeId[MigrationNodeId["PuertoRico"] = 51] = "PuertoRico";
    })(MigrationNodeId || (MigrationNodeId = {}));
    /**
     * Data structure that contains all the state migration data, immutable
     */
    var MigrationPatterns = /** @class */ (function () {
        function MigrationPatterns(data) {
            // console.log(data);
            this.data = new Map();
            for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                var o = data_1[_i];
                var curYear = +o.year;
                this.data[curYear] = new Map();
                for (var _a = 0, _b = o.data; _a < _b.length; _a++) {
                    var d = _b[_a];
                    var id = MigrationNodeId[d.state.clean()];
                    var node = {
                        nodeId: MigrationNodeId[d.state.clean()],
                        netImmigrationFlow: d.net_immigration_flow,
                        totalPopulation: +d.population,
                        totalCame: d.total_came,
                        totalLeft: d.total_left,
                        edges: new Map()
                    };
                    for (var _c = 0, _d = d.left_to; _c < _d.length; _c++) {
                        var edge = _d[_c];
                        var toNodeId = MigrationNodeId[edge.state.clean()];
                        var migrationEdge = {
                            fromMigrationRegion: id,
                            toMigrationRegion: toNodeId,
                            moe: 0,
                            estimate: +edge.estimate
                        };
                        node.edges[toNodeId] = migrationEdge;
                    }
                    this.data[curYear][id] = node;
                }
                console.log(this.data[curYear]);
            }
        }
        return MigrationPatterns;
    }());

    d3.json('data/migration.json').then(function (data) {
        new MigrationPatterns(data);
    });

}(d3));
