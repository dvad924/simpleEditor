var DSource = require('./hereapi');
var Graph = require('./miniGraph');
var SaveTracker = require('./savetracker');
var SaveObj = require('./savemod');
var Stop 	= require('./gtfsapi/models/stop');
var StopCls = require('./gtfsapi/models/stops');
var range = function(min,max){
	min = Math.max(min,0);
	var list = [];
	for(var i = min; i<= max; i++){
		list.push(i);
	}
	return list;
}
var updateObj = (function(){
	var graph = new Graph(); //graph to maintain the relationships of the current tripRoute with its stops
	var plotmod;
	var Stops;
	var buffStops;
	var saveTracker;
	var deltas;
	var Trip;
	var reset = function(){
		graph = new Graph();
		buffStops = new StopCls();
	}
	var processResponse = function(Stops, data){
		var routeGeo = data;
		var emptyGraph = graph.isEmpty();
		var stops = Trip.getStops();
		for(var i =0; i< stops.length-1; i++){//Go through the list of stops on our current route
			var point_range = routeGeo.getPath(i);
			var data = {type:'Feature',properties:{},geometry:{type:'LineString',coordinates:point_range}}
			if(emptyGraph)
				graph.addEdge(stops[i],stops[i+1],data);  
			else
				graph.updateEdge(stops[i],stops[i+1],data)
		}
		deltas = routeGeo.getAllDeltas();
		displayStops(Stops,Trip);
		plotmod.plotFeats(graph.toFeatureCollection(),emptyGraph);
	}

	var requestPath = function(Stops, trajectory){
		var dsource = new DSource();				//create new instance of api module
		dsource.addwaypoints(trajectory);		//add the coordinates as waypoints in the request
		dsource.handleRequest(function(data){	//request  callback for data from datasource server
			processResponse(Stops,data);
		});	
	}

	var getStop = function(id){
		var stop = Stops.getStop(id);
		if(!stop){
			stop = buffStops.getStop(id);
		}
		return stop;
	}

	var displayStops = function(Stops,Trip){
		var FeatColl = {type:'FeatureCollection', features:[]};
		Trip.getStops().forEach(function(sid){
			var stop = getStop(sid);
			FeatColl.features.push(stop.getFeature());
		})
		plotmod.clearStops();
		plotmod.plotStops(FeatColl);
	}

	//Function  to collect the stop paths traversed by each trip
	//into a single matrix;
	var getWaypoints = function(Stops,Trip){	//get simple psuedo matrix of trip traversals
		var coorVector = [];			
		Trip.getStops().forEach(function(id){		//for each stop that it visits
			var stop = getStop(id);
			coorVector.push(stop.getPoint());	//push that stop's coordinates into the vector
		});
		return coorVector;
	}

	//function to kickstart the application
	var init = function(Dict,trip,plotter){
		Stops = Dict;
		plotmod = plotter;
		Trip = trip
		//process schedule data
		var waypoints = getWaypoints(Stops,Trip);
		displayStops(Stops,trip);
		requestPath(Stops,waypoints);	
		saveTracker = new SaveTracker();
	}

	var create = function(Dict,trip,plotter,route_id){
		saveTracker = new SaveTracker();
		Stops = Dict;
		buffStops = new StopCls();
		plotmod = plotter;
		Trip = trip;
		plotmod.initializeTrip(function(stopList){
			var stopids = [],service_id;
			stopList.forEach(function(d,i){
				var id = interact('Please Enter Stop ' + i+1 +'Id',
								'Error Stop exists',
								function(id){return Stops.hasStop(id)
												||  buffStops.hasStop(id)});
				d.setId(id);
				d.addRoute(route_id);
				buffStops.addStop(d);
				saveTracker.addEvent('i',{id:id,position:i+1,data:d});
			});
			service_id = interact('Please Enter Service Id','invalid service id',function(d){return false});
			stopids = stopList.map(function(d){return d.getId();})
			trip.setStops(stopids);
			trip.setRouteId(route_id);
			trip.setNew();
			trip.setServiceId(service_id);
			stopList.forEach(function(d){
				d.addTrip(trip.getId());
			});
			if(trip.isNewTrip()){
				id = interact('Please Enter new trip_id','trip already exists',function(d){return d !== 'NewTripTest';})
				trip.setIds([id])
			}
			var waypoints = getWaypoints(Stops,trip);
			displayStops(Stops,trip);
			requestPath(Stops,waypoints);
		});
	}

	var updateMap = function(stopObj){
		if(stopObj){
			var s = new Stop(stopObj);
			s.setNew(true);
			s.setEdited();
			// Stops[stopid].properties.edited = true;
			debugger;
			var stop = getStop(s.getId())	//try to get the stop
			if( !stop )	//if it isn't there
				buffStops.addStop(s);	//add it
			else{ //otherwise update the coordinates
				stop.setPoint(s.getPoint());
				stop.setEdited();
				stop.setNew(true);
			}	
		}
		var reqobj = [];
		Trip.getStops().forEach(function(sid){
			var stop = getStop(sid);
			reqobj.push(stop.getPoint());
		})
		requestPath(Stops,reqobj);
	}

	var save = function(){
		// return {graph:,stops:,objects:,ids:,path_id:,changelog:,deltas:};
		return new SaveObj(graph,
							Trip.getStops(),
							Stops,
							Trip.getIds(),
							Trip.getId(),
							saveTracker.getEventList(),
							deltas,
							Trip
							);
	}

	var notify = function(success){
		if(success){
			saveTracker = new SaveTracker(); //if a save was successful reset the tracker to the new state.
			Stops.addStops(buffStops.getStops());
		}
	}

	var addPoint = function(newStop){
		var qObj,i1,i2,i;
		var nStop = new Stop(newStop);
		var stops = Trip.getStops();
		var id = '';
		do{
			if(id !== '')
				alert('stop already exits');
			id = prompt('Please Enter new stop id');
			if(id === null)
				return;
		}while(Stops.hasStop(id))//poll until a new ID has been entered
		nStop.setId(id);
		nStop.setNew(true); //mark that this stop is new
		nStop.setEdited(true); //mark that it needs to be commited.
		nStop.addRoute(Trip.getRouteId());
		nStop.addTrip(Trip.getId());
		qObj = graph.queryPoint(nStop.getPoint());	//find closest edge in the graph
		graph.splitEdge(qObj.v1,qObj.v2,newStop,qObj.position);
		i1 = stops.indexOf(qObj.v1);
		i2 = stops.indexOf(qObj.v2);
		i = Math.max(i1,i2); //The assumption is that since they are associated they are right next to eachother in the list;
		stops.splice(i,0,id);
	
		buffStops.addStop(nStop); 
		saveTracker.addEvent('i',{id:id,position:i+1,data:nStop});
		return id;
	}

	var deletePoint = function(stopObj){
		var stopList = [],
		stops = Trip.getStops(),
		oStop = new Stop(stopObj),
		id = oStop.getId(),
		inx = stops.indexOf(id);
		if(inx === 0)
			stopList.push(stops[1]);
		else if (inx === stops.length-1){
			stopList.push(stops[stops.length-2])
		}else{
			stopList.push(stops[inx-1])
			stopList.push(stops[inx+1])
		}
		victimid = stops.splice(inx,1); //remove the element from the stopList
		victim = getStop(victimid[0]);
		victim.setDeleted(true);
		victim.setEdited();
		saveTracker.addEvent('d',{id:id,position:inx+1,data:victim});
		graph.deleteNode(id,stopList); //remove it's node from the graph
		Stops.deleteStop(id);
	}

	return {
		update:updateMap,
		create:create,
		init:init, 
		reset:reset, 
		save:save,
		addPoint,addPoint,
		deletePoint:deletePoint,
		notify:notify,
	};
})();


module.exports = updateObj;