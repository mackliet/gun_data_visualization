/**
 * Enumerator representing all 50 States
 */
export enum RegionEnum {
    Alabama,
    Alaska,
    Arizona,
    Arkansas,
    California,
    Colorado,
    Connecticut,
    Delaware,
    'District of Columbia',
    Florida,
    Georgia,
    Hawaii,
    Idaho,
    Illinois,
    Indiana,
    Iowa,
    Kansas,
    Kentucky,
    Louisiana,
    Maine,
    Maryland,
    Massachusetts,
    Michigan,
    Minnesota,
    Mississippi,
    Missouri,
    Montana,
    Nebraska,
    Nevada,
    'New Hampshire',
    'New Jersey',
    'New Mexico',
    'New York',
    'North Carolina',
    'North Dakota',
    Ohio,
    Oklahoma,
    Oregon,
    Pennsylvania,
    'Rhode Island',
    'South Carolina',
    'South Dakota',
    Tennessee,
    Texas,
    Utah,
    Vermont,
    Virginia ,
    Washington,
    'West Virginia',
    Wisconsin,
    Wyoming,
}

export enum GeographicAreaEnum
{
    'New England', 
    Mideast, 
    'Great Lakes', 
    Plains, 
    Southeast, 
    Southwest, 
    'Rocky Mountain', 
    'Far West'
}

export function getRegionStrings()
{
    const regions = [];
    for(let val in RegionEnum)
    {
        if(isNaN(Number(val)))
        {
            regions.push(val);
        }
    }
    return regions;
}

export function getGeographicAreaStrings()
{
    const geographic_areas = [];
    for(let val in GeographicAreaEnum)
    {
        if(isNaN(Number(val)))
        {
            geographic_areas.push(val);
        }
    }
    return geographic_areas;
}