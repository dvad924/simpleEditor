var Osrm = require('./osrmapi');
var updateObj = (function(){
	var stopLocs;
	var plotmod;
	var stops;
	var id;
	var processAccumulator = function(sDict, acc){
		var featColl = {type:"FeatureCollection", features:[]};
		var keys = Object.keys(acc);
		keys.forEach(function(key){						//for each collection of stop ids
			var feat = {type:"Feature",properties:{},geometry:{type:'LineString'}}; //create a feature
			var routeGeo = acc[key];
			feat.geometry.coordinates = routeGeo.route_geometry;
			featColl.features.push(feat);
		});
		plotmod.plotFeats(featColl);
	}

	var requestPaths = function(sDict, trajData,tripid){
		var pathAccumulator ={};			//accumulator object for all the paths to be returned
		var osrm = new Osrm();				//create new instance of api module
		var keys = (tripid)? [Object.keys(trajData)[0]] : Object.keys(trajData);
		var numTrajs = keys.length;
		var inx = 0;
		var seen =0;
		var interval = setInterval(function(){
			if(inx < numTrajs){
				trajectory = trajData[keys[inx]];		//get  the next trajectory;
				console.log(trajectory);
				osrm.addwaypoints(trajectory);		//add the coordinates as waypoints in the requested
				osrm.handleRequest(inx,function(i,data){	//request  callback for data from osrm server
					pathAccumulator[keys[i]] = data;		//add the data to the accumulator
					seen++;							//note that we have seen another response
					console.log(seen,numTrajs);
					if(seen >= numTrajs){			//if all the trajectories have be en requested and responded further process them.
						console.log(pathAccumulator);
						processAccumulator(sDict,pathAccumulator);
					}
				});	
				inx++;								//increment key counter;
			}else{
				clearInterval(interval);
			}
		},5);
	}

	var displayStops = function(sDict,stops){
		var FeatColl = {type:'FeatureCollection', features:[]};
		debugger;
		stops.forEach(function(sid){
			FeatColl.features.push(sDict[sid]);
		})
		plotmod.plotStops(FeatColl);
	}

	//Function  to collect the stop paths traversed by each trip
	//into a single matrix;
	var processData = function(sDict, scheds){	//get simple psuedo matrix of trip traversals
		var dataMatrix = {};
		var rids = Object.keys(scheds);			//get every route id
		rids.forEach(function(rid){				//for each id
			var route = scheds[rid];			//get the schedule associated with it
			var trip = route.trips[0];
				id = trip.id;
				var ids = JSON.parse(trip.id);	//get the list off stops it traverses in order of arrival
				stops = ids;
				var coorVector = [];			
				ids.forEach(function(id){		//for each stop that it visits
					coorVector.push(sDict[id].geometry.coordinates);	//push that stop's coordinates into the vector
				
				dataMatrix[trip.id] = coorVector;	//push that vector into the matrix
			});
		});
		return dataMatrix;
	}

	//function to kickstart the application
	var init = function(sDict, scheds,tripid,plotter){
		debugger;
		tripid = Object.keys(scheds)[0];				////////////////////////Set to first element for test, dev, and debug////////////////////////
		plotmod = plotter;
		stopLocs = sDict; //set the modules dictionary of stops
		//process schedule data
		var waypoints = processData(stopLocs,scheds);
		displayStops(sDict,stops);
		requestPaths(sDict,waypoints,tripid);
	}

	var updateMap = function(StopJson){
		var miniTable = {}, coorlist = [];
		StopJson.features.forEach(function(stop){
			miniTable[stop.properties.stop_id] = stop.geometry.coordinates;
		});

		stops.forEach(function(sid){
			coorlist.push(miniTable[sid]);
		});
		var strlist = JSON.stringify(stops);
		var reqobj = {}
		reqobj[id] = coorlist;
		requestPaths(miniTable,reqobj,id);

	}
	return {update:updateMap, init:init};
})();


module.exports = updateObj;