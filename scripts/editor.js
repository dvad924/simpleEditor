var Stop = require('./gtfsapi/models/stop');
var Stops =require('./gtfsapi/models/stops');
var Trip = require('./gtfsapi/models/trip');
var Route =require('./gtfsapi/models/route').Route;
var Routes=require('./gtfsapi/models/route').Routes;
var buildModels = function(sdata,tdata,routes){
    var SColl = new Stops();
    sdata.features.forEach(function(d){
        var s = new Stop(d);
        SColl.addStop(s);
    });

    Object.keys(tdata).forEach(function(rid){
        var R = tdata[rid];
        var route = new Route(rid);
        R.trips.forEach(function(t){
            //Build Trip object from souce data
            var trip = new Trip();
            trip.setId(t.id);
            trip.setIntervals(t.intervals);
            trip.setStartTimes(t.start_times);
            trip.setStopTimes(t.stop_times);
            trip.setIds(t.tripids);
            //add the trip to the route object
            route.addTrip(trip);
            //set the many-to-many relationship 
            //stops <----> trips, by setting the trips ids of stops
            trip.getStops().forEach(function(sid){
                SColl.getStop(sid).addTrip(trip.getId());
            })
        })
        routes.addRoute(route);
    });
    return SColl
}

var startApp = function(){
	var update = require('./update');
	var plotmod =require('./plotmod');
	var fetcher = require('./gtfsapi/gtfsdata');
	var fb = require('./featurebuilder');
	var databox = require('./databox');
	var agency = 12;
    	fetcher.getStops(agency,{format:'geo'},function(stopData){		//fetch raw stop data
    		fetcher.getSchedule(agency,{Day:'Monday'},function(scheds){	//request the schedule data from the server
            var routes = new Routes();			
            var stops = buildModels(stopData,scheds,routes);
                databox.init(stops,routes,agency);
    			console.log(routes);
                console.log(stops);
    		})		
    	});
}

module.exports= startApp;


