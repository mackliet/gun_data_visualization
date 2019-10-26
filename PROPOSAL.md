#Proposal
## The Ebb and Flow of US States
###Basic Info
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
A plot similar to homework 4 where we get economic indicators to go with population data for each state and make a scatter plot that can be updated over time
A sortable table with all the population and economic data along with numeric values also being shown as a proportion to the population (number of immigrants vs. percent of population that immigrated).


 


