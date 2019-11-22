import os
import csv
import json
import re
from functools import reduce
import pandas as pd

def main():
    # change directory to where this file is
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    states = get_states()
    data = create_migration_json(states)
    add_data_SAGDP10N(data)
    add_data_SAGDP11N(data)
    add_data_SAEMP25N(data)
    add_data_SAINC50(data)
    write_data_to_json_file(data)
    print(list(data[0]['data'][0].keys()))

def create_migration_json(states):
    complete_data = []
    migration_data_dir = 'raw_data/migration/'
    for _, _, files in os.walk(migration_data_dir):
        for filename in sorted(files):
            path = f'{migration_data_dir}{filename}'
            convert_migration_csv(complete_data, path, states)
    return complete_data

def write_data_to_json_file(complete_data):
    data_dir = '../../data/'
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
    with open(f'{data_dir}migration_and_economic_data.json', 'w') as data_file:
        json.dump(complete_data, data_file, indent=2, sort_keys=True)    

def convert_migration_csv(complete_data, path, states):
    state_columns = {}
    state_values = []
    year = re.search(r'[0-9]{4}', path).group(0)
    file_contents_json = {}
    file_contents_json['year'] = year
    file_contents_json['data'] = state_values
    for state in states:
        state_values.append({'state' : state})
    with open(path) as uncleaned_csv_file:
        csv_reader = csv.reader(uncleaned_csv_file)
        for row_num, row in enumerate(csv_reader):
            if row_num == 6:
                for state in states:
                    state_columns[state] = row.index(state)
                if len(state_columns) < 50:
                    print(f'Error processing {path}! Aborting...')
                    exit(1)
            elif row[1] in states:
                state = next(filter(lambda obj: obj['state'] == row[1], state_values))
                state['came_from'] = []
                for other_state in state_columns:
                    if state['state'] == other_state:
                        if row[state_columns[other_state]] != '':
                            state['population'] = int(row[state_columns[other_state]])
                        else:
                            state['population'] = int(row[2])
                    else:
                        other_state_values = {}
                        other_state_values['state'] = other_state
                        other_state_values['estimate'] = int(row[state_columns[other_state]])
                        state['came_from'].append(other_state_values)
                        
                        other_state_obj = next(filter(lambda obj: obj['state'] == other_state, state_values))
                        if 'left_to' not in other_state_obj.keys():
                            other_state_obj['left_to'] = []
                        other_state_obj['left_to'].append({'state' : state['state'], 'estimate' : other_state_values['estimate']})
    
    # Derived values        
    for state_obj in state_values:
        state_obj['total_left'] = reduce(lambda current,other_state: other_state['estimate'] + current, state_obj['left_to'], 0)
        state_obj['total_came'] = reduce(lambda current,other_state: other_state['estimate'] + current, state_obj['came_from'], 0)
        state_obj['net_immigration_flow'] = state_obj['total_came'] - state_obj['total_left']
    complete_data.append(file_contents_json)

# Add GDP data
# per capita
def add_data_SAGDP10N(complete_data):
    dataframe = pd.read_csv('raw_data/economy/SAGDP10N__ALL_AREAS_1997_2018.csv', delimiter=',')
    for year in complete_data:
        year_data = dataframe.filter(regex=f'(GeoName)|({year["year"]})|(Region)')
        for state in year['data']:
            state_indicators = year_data[year_data.GeoName == state['state']].filter(regex=f'(GeoName)|({year["year"]})')
            if state_indicators.empty:
                continue

            region_info = year_data.filter(regex=f'(GeoName)|(Region)')
            region_map = {}
            for area in get_geographic_areas():
                area_frame = region_info[region_info.GeoName == area]
                region_map[int(area_frame.iat[0,1])] = area

            state['GDP_per_capita'] = int(state_indicators.iat[0, 1])
            state['geographic_area'] = region_map[int(region_info[region_info.GeoName == state['state']].iat[0,1])]

# Add GDP data
# % change
def add_data_SAGDP11N(complete_data):
    dataframe = pd.read_csv('raw_data/economy/SAGDP11N__ALL_AREAS_1998_2018.csv', delimiter=',')
    for year in complete_data:
        year_data = dataframe[dataframe.Description.str.contains('All industry total', regex= True, na=False)].filter(regex=f'(GeoName)|{year["year"]}')
        for state in year['data']:
            state_data = year_data[year_data.GeoName == state['state']]
            if state_data.empty:
                continue
            state['GDP_percent_change'] = float(state_data.iat[0, 1])


# Jobs data
# number jobs
# percent change jobs
# jobs to population ratio    
def add_data_SAEMP25N(complete_data):
    dataframe = pd.read_csv('raw_data/economy/SAEMP25N__ALL_AREAS_1998_2018.csv', delimiter=',')
    for year in complete_data:
        year_data = dataframe[dataframe.Description.str.contains('Total employment', regex= True, na=False)].filter(regex=f'(GeoName)|{year["year"]}')
        for state in year['data']:
            state_data = year_data[year_data.GeoName == state['state']]
            if state_data.empty:
                continue
            state['jobs'] = int(state_data.iat[0, 1])
            state['jobs_per_capita'] = state['jobs']/state['population']


# Persional income data
# Per capita personal income
# Per capita disposable income
# Per capita taxes (personal - disposable)
def add_data_SAINC50(complete_data):
    dataframe = pd.read_csv('raw_data/economy/SAINC50__ALL_AREAS_1948_2018.csv', delimiter=',')
    for year in complete_data:
        year_data = dataframe[dataframe.Description.str.contains('Per capita personal income', regex= True, na=False)].filter(regex=f'(GeoName)|{year["year"]}')
        for state in year['data']:
            state_data = year_data[year_data.GeoName == state['state']]
            if state_data.empty:
                continue
            state['personal_income_per_capita'] = int(state_data.iat[0, 1])
        
        year_data = dataframe[dataframe.Description.str.contains('Per capita disposable personal income', regex= True, na=False)].filter(regex=f'(GeoName)|{year["year"]}')
        for state in year['data']:
            state_data = year_data[year_data.GeoName == state['state']]
            if state_data.empty:
                continue
            state['personal_disposable_income_per_capita'] = int(state_data.iat[0, 1])
            state['personal_taxes_per_capita'] = state['personal_income_per_capita'] - state['personal_disposable_income_per_capita']

def get_states():
    return ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'District of Columbia ', 'Florida',
'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts',
'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee',
'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'] 

def get_geographic_areas():
    return ['New England', 'Mideast', 'Great Lakes', 'Plains', 'Southeast', 'Southwest', 'Rocky Mountain', 'Far West']

if __name__ == '__main__':
    main()
