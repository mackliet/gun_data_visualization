import os
import csv
import json
import re
from functools import reduce

def main():
    convert_migration_data()

def convert_migration_data():
    states = get_states()
    complete_data = []
    economy_data_dir = 'raw_data/migration/'
    for _, _, files in os.walk(economy_data_dir):
        for filename in sorted(files):
            path = f'{economy_data_dir}{filename}'
            convert_migration_csv(complete_data, path, states)
    data_dir = 'data/'
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
    with open(f'{data_dir}migration.json', 'w') as economy_file:
        json.dump(complete_data, economy_file, indent=2, sort_keys=True)

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
                            state['population'] = row[state_columns[other_state]]
                        else:
                            state['population'] = row[2]
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


def get_states():
    return ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'District of Columbia ', 'Florida',
'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts',
'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee',
'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming', 'Puerto Rico'] 

if __name__ == '__main__':
    main()
