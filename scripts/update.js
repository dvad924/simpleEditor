var Osrm = require('./osrmapi');
var Graph = require('./miniGraph');
var fb 	=   require('./featurebuilder.js');
var updateObj = (function(){
	var graph = new Graph(); //graph to maintain the relationships of the current tripRoute with its stops
	var plotmod;
	var stops;
	var id;
	var sDict;
	var updatedStops;

	var reset = function(){
		graph = new Graph();
	}

	var processAccumulator = function(sDict, acc){

		var keys = Object.keys(acc);
		var routeGeo = acc[keys[0]];
		var featColl = fb(sDict,{type:'osrm',object:routeGeo}); //build the feature collection
		if(graph.isEmpty()){
			for(var i =0; i< stops.length-1; i++){//Go through the list of stops on our current route
				//Note that the via_points array in the routeGeo will be the associated with the same indicies;
				var p1 = routeGeo.via_indices[i];	//index of first stop
				var p2 = routeGeo.via_indices[i+1];	//index of second stop
				var point_range = routeGeo.route_geometry.slice(p1,p2+1);
				graph.addEdge(stops[i],stops[i+1],{type:'Feature',properties:{},geometry:{type:'LineString',coordinates:point_range}});  
			}
		}else{ // if the graph is not empty we only need to update two links
			for(var i = 0; i < updatedStops.length-1; i++){
				var p1 = routeGeo.via_indices[i];
				var p2 = routeGeo.via_indices[i+1];
				var point_range = routeGeo.route_geometry.slice(p1,p2+1);
				graph.updateEdge(updatedStops[i],updatedStops[i+1],{type:'Feature',properties:{},geometry:{type:'LineString',coordinates:point_range}})
			}
		}
		console.log(graph.toFeatureCollection());
		plotmod.plotFeats(graph.toFeatureCollection());
	}

	var requestPath = function(sDict, trajectory){
		var pathAccumulator ={};			//accumulator object for all the paths to be returned
		var osrm = new Osrm();				//create new instance of api module
		
		console.log(trajectory);
		osrm.addwaypoints(trajectory);		//add the coordinates as waypoints in the request
		osrm.handleRequest(function(data){	//request  callback for data from osrm server
			pathAccumulator[id] = data;		//add the data to the accumulator
			console.log(pathAccumulator);
			processAccumulator(sDict,pathAccumulator);
		});	
	}

	var displayStops = function(sDict,stops){
		var FeatColl = {type:'FeatureCollection', features:[]};
		
		stops.forEach(function(sid){
			FeatColl.features.push(sDict[sid]);
		})
		plotmod.plotStops(FeatColl);
	}

	//Function  to collect the stop paths traversed by each trip
	//into a single matrix;
	var processData = function(sDict, trip){	//get simple psuedo matrix of trip traversals
		var dataMatrix = {};
			id = trip.id;
			var ids = JSON.parse(trip.id);	//get the list off stops it traverses in order of arrival
			stops = ids;
			var coorVector = [];			
			ids.forEach(function(id){		//for each stop that it visits
				coorVector.push(sDict[id].geometry.coordinates);	//push that stop's coordinates into the vector
			
				dataMatrix[trip.id] = coorVector;	//push that vector into the matrix
			});
		return dataMatrix;
	}

	//function to kickstart the application
	var init = function(Dict,sched,tripid,plotter){
		sDict = Dict;
		tripid = Object.keys(sched)[0];				////////////////////////Set to first element for test, dev, and debug////////////////////////
		plotmod = plotter;
		//process schedule data
		var waypoints = processData(Dict,sched[tripid]);
		displayStops(sDict,stops);
		requestPath(sDict,waypoints[id]);
	}

	var updateMap = function(stopObj){
		var stopid = stopObj.properties.stop_id;
		console.log(stopid);
		sDict[stopid].geometry.coordinates = stopObj.geometry.coordinates;
		var inx = stops.indexOf(stopid);
		if(inx != 0 && inx != stops.length-1){
			updatedStops = stops.slice(inx-1,inx+2);
		}
		else if(inx > 0){
			updatesStops = stops.slice(inx-1,inx+1);
		}
		else{
			updatedStops = stops.slice(inx,inx+2);
		}
		var reqobj = [];
		debugger;
		updatedStops.forEach(function(sid){
			reqobj.push(sDict[sid].geometry.coordinates);
		});
		requestPath(sDict,reqobj);
	}
	return {update:updateMap, init:init, reset:reset};
})();


module.exports = updateObj;