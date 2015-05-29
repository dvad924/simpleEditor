var Osrm = require('./osrmapi');
var Graph = require('./miniGraph');
var fb 	=   require('./featurebuilder.js');
var updateObj = (function(){
	var graph = new Graph(); //graph to maintain the relationships of the current tripRoute with its stops
	var plotmod;
	var stops;
	var sDict;

	var reset = function(){
		graph = new Graph();
	}



	var processAccumulator = function(sDict, data){
		var routeGeo = data;
		var featColl = fb(sDict,{type:'osrm',object:routeGeo}); //build the feature collection
		console.log(routeGeo);
		var emptyGraph = graph.isEmpty();
		for(var i =0; i< stops.length-1; i++){//Go through the list of stops on our current route
			//Note that the via_points array in the routeGeo will be the associated with the same indicies;
			var p1 = routeGeo.via_indices[i];	//index of first stop
			
			var p2 = routeGeo.via_indices[i+1];	//index of second stop
			var point_range = routeGeo.route_geometry.slice(p1,p2+1);
			if(emptyGraph)
				graph.addEdge(stops[i],stops[i+1],{type:'Feature',properties:{},geometry:{type:'LineString',coordinates:point_range}});  
			else
				graph.updateEdge(stops[i],stops[i+1],{type:'Feature',properties:{},geometry:{type:'LineString',coordinates:point_range}})
		}
		console.log(graph);
		// stops.forEach(function(sid,i){
		// 	sDict[sid].geometry.coordinates = routeGeo.via_points[i];
		// })
		displayStops(sDict,stops);
		plotmod.plotFeats(graph.toFeatureCollection(),emptyGraph);
	}

	var requestPath = function(sDict, trajectory){
		var pathAccumulator ={};			//accumulator object for all the paths to be returned
		var osrm = new Osrm();				//create new instance of api module
		console.log(trajectory);
		osrm.addwaypoints(trajectory);		//add the coordinates as waypoints in the request
		osrm.handleRequest(function(data){	//request  callback for data from osrm server
			processAccumulator(sDict,data);
		});	
	}

	var displayStops = function(sDict,stops){
		var FeatColl = {type:'FeatureCollection', features:[]};
		stops.forEach(function(sid){
			FeatColl.features.push(sDict[sid]);
		})
		plotmod.clearStops();
		plotmod.plotStops(FeatColl);
	}

	//Function  to collect the stop paths traversed by each trip
	//into a single matrix;
	var processData = function(sDict, trip){	//get simple psuedo matrix of trip traversals
		var dataMatrix = {};
			var ids = JSON.parse(trip.id);	//get the list off stops it traverses in order of arrival
			stops = ids;
			var coorVector = [];			
			ids.forEach(function(id){		//for each stop that it visits
				coorVector.push(sDict[id].geometry.coordinates);	//push that stop's coordinates into the vector
			});
		return coorVector;
	}

	//function to kickstart the application
	var init = function(Dict,sched,plotter,routeData){
		sDict = Dict;
		plotmod = plotter;
		//process schedule data
		var waypoints = processData(Dict,sched);
		displayStops(sDict,stops);
		if(!routeData){	//if there was no route data to begin with just take the trajectory 
						//and build the route from scratch
			requestPath(sDict,waypoints);	
		}else{
			//siftAndMerge(Dict,sched,routeData,graph);
			//plotmod.plotFeats(graph.toFeatureCollection,true);
		}
		
	}
	var updateMap = function(stopObj){
		if(stopObj){
			var stopid = stopObj.properties.stop_id;
			console.log(stopid);
			sDict[stopid].geometry.coordinates = stopObj.geometry.coordinates;	
		}
		var reqobj = [];
		stops.forEach(function(sid){
			reqobj.push(sDict[sid].geometry.coordinates);
		})
		console.log(stops);
		requestPath(sDict,reqobj);
	}
	var save = function(){
		return {graph:graph,stops:stops,objects:sDict};
	}

	var addPoint = function(newStop){
		var qObj,i1,i2,i;
		var id = '';
		do{
			if(id !== '')
				alert('stop already exits');
			id = prompt('Please Enter new stop id');
			if(id === null)
				return;
		}while(sDict[id])//poll until a new ID has been entered
		newStop.properties.stop_id = id;
		qObj = graph.queryPoint(newStop.geometry.coordinates);	//find closest edge in the graph
		graph.splitEdge(qObj.v1,qObj.v2,newStop,qObj.position);
		i1 = stops.indexOf(qObj.v1);
		i2 = stops.indexOf(qObj.v2);
		i = Math.max(i1,i2);//The assumption is that since they are associated they are right next to eachother in the list;
		stops.splice(i,0,id);
		sDict[id] = newStop;
		return id;
	}

	var deletePoint = function(stopObj){
		var stopList = [],
		id = stopObj.properties.stop_id,
		inx = stops.indexOf(id);
		if(inx === 0)
			stopList.push(stops[1]);
		else if (inx === stops.length-1){
			stopList.push(stops[stops.length-2])
		}else{
			stopList.push(stops[inx-1])
			stopList.push(stops[inx+1])
		}
		stops.splice(inx,1); //remove the element from the stopList
		graph.deleteNode(id,stopList); //remove it's node from the graph
		delete sDict[id]
	}

	return {
		update:updateMap,
		init:init, 
		reset:reset, 
		save:save,
		addPoint,addPoint,
		deletePoint:deletePoint,
	};
})();


module.exports = updateObj;