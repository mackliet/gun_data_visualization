from html.parser import HTMLParser
import urllib.request
import re
import zipfile
import io
import pandas as pd
import os

def main():
    census_bureau = Census_bureau_data_handler().download()
    Bureau_economic_development_data_handler(census_bureau.get_year_range()).download()
    

class Census_bureau_data_handler(HTMLParser):
    def __init__(self):
        HTMLParser.__init__(self)
        self.spreadsheet_links = set()
        self.directory = 'raw_data/migration/'
        if not os.path.exists(self.directory):
            os.makedirs(self.directory)
        self.start_year = float('inf')
        self.end_year = float('-inf')

    def download(self):
        with urllib.request.urlopen('https://www.census.gov/data/tables/time-series/demo/geographic-mobility/state-to-state-migration.html') as response:
            self.feed(response.read().decode())
            for link in self.spreadsheet_links:
                with urllib.request.urlopen('https:' + link) as spreadsheet_response:
                    csv_filename = f'{self.directory}{link.split("/")[-1]}'.lower().replace('.xls', '.csv')
                    spreadsheet = pd.read_excel(io.BytesIO(spreadsheet_response.read()), 'Table', index_col=None)
                    spreadsheet.to_csv(csv_filename)
                        
        return self        

    def get_year_range(self):
        return self.start_year, self.end_year

    def handle_starttag(self, tag, attrs):
        # Only parse the 'anchor' tag.
        if tag == "a":
            # Check the list of defined attributes.
            for name, value in attrs:
                # Check if href and if link matches regex for migration data spreadsheet
                if name == "href" and re.search(r"[T,t]able_[0-9]{4}\.xls$", value):
                    self.spreadsheet_links.add(value)
                    year = int(re.search(r'[0-9]{4}', value.split('/')[-1]).group(0))
                    self.end_year = max(year, self.end_year)
                    self.start_year = min(year, self.start_year)



class Bureau_economic_development_data_handler(HTMLParser):
    def __init__(self, year_range):
        HTMLParser.__init__(self)
        self.csv_zip_links = set()
        self.directory = 'raw_data/economy/'
        if not os.path.exists(self.directory):
            os.makedirs(self.directory)
        self.start_year = year_range[0]
        self.end_year = year_range[1]

    def download(self):
        with urllib.request.urlopen('https://apps.bea.gov/regional/downloadzip.cfm') as response:
            self.feed(response.read().decode())
            for link in self.csv_zip_links:
                with urllib.request.urlopen(link) as zip_response:
                    with zipfile.ZipFile(io.BytesIO(zip_response.read()), 'r') as zip_file:
                        file_filter = lambda x : re.search(r"ALL_AREAS.*\.csv", x)
                        for zipped_file_name in filter(file_filter, zip_file.namelist()):
                            years = [int(year) for year in re.search(r'[0-9]{4}_[0-9]{4}', zipped_file_name).group(0).split('_')]
                            if years[0] <= self.end_year and years[-1] >= self.start_year:
                                with open(f'{self.directory}{zipped_file_name}', 'wb') as csv_file:
                                    csv_file.write(zip_file.read(zipped_file_name))
        return self       

    def handle_starttag(self, tag, attrs):
        # Only look at option for select boxes
        if tag == "option":
            for name, value in attrs:
                # Only look at value of option tag where value has SA (State annual)
                if name == 'value' and 'SA' in value:
                    self.csv_zip_links.add(f'https://apps.bea.gov/regional/zip/{value}.zip')


if __name__ == '__main__':
    main()