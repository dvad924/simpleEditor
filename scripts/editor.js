var startApp = function(){
	var update = require('./update');
	var plotmod =require('./plotmod');
	var livegtfs = require('./livegtfsapi');
	var fb = require('./featurebuilder');
	var databox = require('./databox');

	var agency = 12;	
	var fetcher = livegtfs.gtfsData; //get datamod for the gtfs api
    fetcher.getRoutes(agency,function(rdata){ //fetch the raw route data from the server
    	
    	fetcher.getStops(agency,{format:'geo'},function(stopData){		//fetch raw stop data
    		stopDict = {};												//define lookup dictionary for stops
    		stopData = fuzzyfixer(rdata,stopData);						//perform fuzzy fix to allow for better queries to osrm

    		
    		console.log(stopDict)
    		fetcher.getSchedule(agency,{Day:'Monday'},function(scheds){	//request the schedule data from the server
    			databox.init(rdata,stopData,scheds);
    			console.log(scheds);
    		})		
    	});
    });	
}

module.exports= startApp;


