# Proposal
## The Ebb and Flow of US States

### Basic Info
* Michael Mackliet [m.mackliet@gmail.com](mailto:m.mackliet@gmail.com)
* Kevin Reilly [reilly.w.kevin@gmail.com](mailto:reilly.w.kevin@gmail.com)

### Background and Motivation

Each year, roughly 40 million Americans move once. In 2016, Utah saw the most population growth, much 
of which was from out of state residents flocking to the state for new opportunities and adventures. 
Beneath the often cited economic indicators, such as gross product and consumer spending, are the shifting
tectonics of population migrations patterns.  A great deal of domestic discourse resides on conversations
dominated by these migration patters, their fundamental movers, and talk of decisive policy action to 
enable drivers of industrial growth and innovation. 

The overarching idea of this visualization is to provide viewers with a wide lens view of these migration
patterns that are often talked about only in glimpses in the public square.  If the user can see where people
are going to and coming from, and potentially see these patterns linked with economic data showing the various
driving forces, then this could enable consumers of the dataset to have a more rounded understanding of the 
interweaving complexities across the spectrum driving people to unproot their lives and migrate across the 
globe. 

### Project Objectives

The goal of this project will be to demonstrate visually the common questions about interstate migration
in such a manner that would support or dispose of common assumptions about these dynamics. The datasets 
available could easily answer questions such as:
* Which states have the fastest growing populations?
* Which states hae the fastest declining populations?
* For each state, where are people most likely to move to?
* For each state, where are people most likely to move from?
* Which states experienced the largest influx of migrants?
* Which states experienced the largest exodus of residents?
* How have these patterns changed over time, across different federal executive policy agendas?

A few bonus quesitons we would like to answer should time permit include:

* What factors in a state are the most likely to increase emmigration?
* What factors in a state are most likely to increase immigration?
* Are there multiple factors and causes for different regions?

### Data

The datasets that we will be using are maintained by the US government.  The US government census bureau 
keeps well curated data for various various purposes across the federal agencies and is regarded as accurate.
State to State migration pattern data can be found [here](https://www.census.gov/data/tables/time-series/demo/geographic-mobility/state-to-state-migration.html)

The US Buereau of Economic Development can be found [here](https://www.bea.gov/data/by-place-states-territories)

This page contains data for different economic indicators for each state every year. The data is separated into 
segregated spreadsheets for each indicator and year.  The indicators include GDP, copnsumer spending, personal income, 
cost of living, etc. 

### Data Processing 

The data is structured, so cleanup will not be too difficult, but the format will need to be adjusted. Currently all 
tables are saved as Excel spreadsheets and the formats will need to be adjusted. The interstate migration data tables 
have recurring headers to aid the reader as they scroll through the document which will need to be removed. All tables 
have titles and footnotes that will need to be removed as well. Data extraction and cleanup will be done in Python as 
follows:
* Download the spreadsheets for all the years in an automated way using the python requests module
* Convert each spreadsheet to a CSV file
* Clean up each spreadsheet into a standard CSV format with headers and values
* Convert the CSV to JSON for consumption by the project

While cleaning the data, a few derived quantities will also be calculated.  Among them are:
* For each state, the likelihood of moving to every other state for each year
* For each state, the likelihood of an immigrant being from every other state
* Overall likelihood of a foreign resident moving to a state (broken down by nations or regions)
* Overall likelihood of a foreign resident moving out of each state
* R correlation for net immigration rate and different economic indicators (broad brush)

### Visualization Design
We had a few different ideas for different ways we could display the data. Here are a few of them:
1. Chord diagram with migration from each state being encoded in the connection it has to every other sate. This can 
be aggregated to the 9 regions if it becomes to cluttered. A year slide will allow interaction with the chord diagram
transitioning from year to year. 
2. A US Map drawn as a heat map with red being net outflow and blue being net inflow. This can also be a flow map for a specific 
state when that state is clicked showing immigration patterns with its biggest outliers. 
3. A directed graph with edges to each state showing where residents flow from each other state, with thickness of the edge 
encoding the amount of migration between the two and color gradient showing the net direction
4. A line graph showing number of interstate migrants per year
5. A plot similar to homework 4 where we get economic indicators to go with population data for each state and make a scatter plot that can be updated over time
7. A sortable table with all the population and economic data along with numeric values also being shown as a proportion to the population (number of immigrants vs. percent of population that immigrated).

#### Prototype Sketch 1

Prototype 1 has a heat map of net immigration flow, a chord diagram, and a table. The user can sort 
economic/immigration/population data in the table and there would be a year slider to move the chords and heatmap by 
year. This design allows for the user to easily see the net immigration per state in the heat map, how people are moving 
using the chord diagram, and get an overview of economic factors related to immigration in the table. This design does 
not show relationships with economic data very well even though the data is in the table.

![alt text][img/proto1.jpg]

#### Prototype Sketch 2

Prototype 2 has a chord diagram, two directed graphs mapping most immigrated to and from states, and a table with all 
the economic/immigration/population data. This design shows movement between states/regions in the chord diagram as 
well as an overview of how the majority of immigration is happening via the directed graphs. The table shows the rest 
of the data. This does not give a good snapshot of overall immigration like the heat map nor does it show relationships 
with economic data very well.

![alt text][img/proto2.jpg]

#### Prototype Sketch 3

Prototype 3 has a chord diagram, a heat map, and a scatter plot with a year slider. This model effectively shows 
movement between regions with the chord diagram, snapshots of overall net immigration flows with the heat map, and it 
shows relationships with the economic data over time with the scatter plot. Unfortunately, it does not give raw data 
for the user to look at without the table.

![alt text][img/proto3.jpg]

#### Final Design

The Final Design has a chord diagram, a heat map, a scatter plot with a year slider, and a table with 
economic/immigration/population data. This final design, as described in the prototypes, will allow the user to see 
snapshots of immigration net flow by year, see where people are moving to, and see relationships with the economic data. 
The table will also allow the user to look at raw data.

![alt text][img/final.jpg]

### MUST HAVE

The chord diagram and scatter plot with a year slider are must-haves. Without them, the graphic would not effectively 
show where people are moving to and from and how the movement relates to economic factors.

### Optional Features

### Project Schedule/Deadlines
* Nov 1  - Data Downloaded and Cleaned into a CSV / Basic HTML layout and JS interface defined.  Basic CSS added. 
* Nov 8  - **MILESTONE** Data structures defined and ready in JSON format Nov 8.  Object Model Sketches Complete.  Scatter Plot and Table Functioning.
* Nov 15 - Chord Diagram functioning, integration with year slider
* Nov 27 - Heat map displayed, functional, interacts with year slider
* Dec 1  - Final touchups and layout finishing
* Dec 3  - Presentation

### Delegate modules/responsibilities
* Michael
    * Gather and clean data
    * Scatter Plot
    * View interaction
    * Heat map (Joint task)
    * Testing
* Kevin
    * HTML and JS interfaces
    * Table
    * Chord Diagram
    * Heat map (Joint task)
    * Testing
