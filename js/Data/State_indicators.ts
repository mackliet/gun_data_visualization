import {RegionEnum, GeographicAreaEnum} from "./DataUtils"

export interface State_indicators 
{
    state: RegionEnum;
    population: number;
    total_came: number;
    total_left: number
    net_immigration_flow: number;
    total_came_per_capita: number;
    total_left_per_capita: number
    net_immigration_flow_per_capita: number;
    geographic_area: GeographicAreaEnum;
    GDP_per_capita: number;
    GDP_percent_change: number;
    jobs: number;
    jobs_per_capita: number;
    personal_income_per_capita: number;
    personal_disposable_income_per_capita: number;
    personal_taxes_per_capita: number;     
}

export type Year_to_indicators_map = {[key:number]:Array<State_indicators>};

export function build_year_to_indicators_map(json_data: Array<any>)
{
    let year_to_indicators: Year_to_indicators_map = {};
    for (const o of json_data) 
    {
        const curYear = +o.year;
        year_to_indicators[curYear] = [];
        for (const d of o.data)
        {
            const state_indicators: State_indicators = 
            {
                state: d.state,
                population: d.population,
                total_came: d.total_came,
                total_left: d.total_left,
                net_immigration_flow: d.net_immigration_flow,
                total_came_per_capita: d.total_came/d.population,
                total_left_per_capita: d.total_left/d.population,
                net_immigration_flow_per_capita: d.net_immigration_flow/d.population,
                geographic_area: d.geographic_area,
                GDP_per_capita: d.GDP_per_capita,
                GDP_percent_change: d.GDP_percent_change,
                jobs: d.jobs,
                jobs_per_capita: d.jobs_per_capita,
                personal_income_per_capita: d.personal_income_per_capita,
                personal_disposable_income_per_capita: d.personal_disposable_income_per_capita,
                personal_taxes_per_capita: d.personal_taxes_per_capita,  
            }
            year_to_indicators[curYear].push(state_indicators);
        }
    }
    return year_to_indicators;
}



