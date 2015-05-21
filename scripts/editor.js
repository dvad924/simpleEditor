var startApp = function(){
	var update = require('./update');
	var plotmod =require('./plotmod');
	var livegtfs = require('./livegtfsapi');
	var fb = require('./featurebuilder');
	

	var agency = 12;	
	var testR = "1-142";
	var fetcher = livegtfs.gtfsData; //get datamod for the gtfs api
    fetcher.getRoutes(agency,function(rdata){ //fetch the raw route data from the server
    	
    	fetcher.getStops(agency,{format:'geo'},function(stopData){		//fetch raw stop data
    		//Lext.addstops(stopData,map);
    		stopDict = {};												//define lookup dictionary for stops
    		stopData = fuzzyfixer(rdata,stopData);						//perform fuzzy fix to allow for better queries to osrm
    		stopData.features = stopData.features.filter(function(d){return d.properties.routes.indexOf(testR) >= 0})//filter stops to current route
    		console.log(stopData);
    		stopData.features.forEach(function(stop){	//build dictionary of stops
    			stopDict[stop.properties.stop_id] = stop;
    		})
    		console.log(stopDict)
    		fetcher.getSchedule(agency,{Day:'Monday'},function(scheds){	//request the schedule data from the server
    			console.log(scheds);
    			testObj ={};
    			testObj[testR] = scheds[testR];							//limit current view to 1 route for testing
    			console.log(testObj);					
    			initialfeatures = update.init(stopDict,testObj,{},plotmod);		//initialize map
    		})		
    	});
    });	
}

// bundle['edit'] = buildRoutes;
// bundle['topojson'] = topojson;
// bundle['osrm'] = Osrm;
// bundle['proc'] = processData;
// bundle['plotmod'] = plotmod;
module.exports= startApp;


