
### Project Details
This is a simple visualization that allows the user to interact with migration data coupled with derived metrics and 
economic data for the US States. 

[Project Website](https://mackliet.github.io/ebb_and_flow_of_states/) [Project Video](https://youtu.be/_aI_LE6FmMo)

### Get Started

To install typescript and rollup globally 
``` 
npm install -g typescript rollup
```

To install packages, from root directory type
```
npm i 
```

To build the main.js for the project simply type
```
npm run build
```

To run unit tests
```
npm run test
```

Transpile typescript
```
tsc
tsc -w
```

### [Data Utils](js/Data/)
The typescript data classes used to parse and transform the data to their expecetd types. 

### [Data Utils](js/Utils/)
Small utility for shared objects

### [View Classes](js/Views/)
Where the heavy lifting takes place.  The views are classes that build each component and provide 
public methods for state modification. 

### [main.js](js/main.js)
A rollup artifact that the main index.html references.  All of the code is compiled into this file. 
```npm run build``` will build the artifact and needs to be run anytime there is a change. 

### [Test](test/)
Just a real quick and dirty test file that checks that the data is in the right format.  This is helpful when making changes 
upstream to make sure expected form doesn't change for the views that are utlizing it. 

### [script.ts](js/script.ts)
The main entrypoint for the application.  This fiule consumes the data and builds each of the view classes.  Any
global operations, such as sharing of event handlers, is done here. 

### [Data Scripts](scripts/)
These are all the scripts that pull the data from the various sources and build the required json and csv files. 
They are written in python. 

