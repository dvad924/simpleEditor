if(typeof d3 === 'undefined'){
	throw {
		message:'module requires d3',
		name:'RequirementException',
	}
}
var buildStopsPane = require('./stopPane');
var plotmod = require('./plotmod');
var update = require('./update');
var analyzeIntervals = require('./analysisMod');
var upload = require('./gtfsapi/gtfsdata');
var Route = require('./gtfsapi/models/route').Route;
var Trip = require('./gtfsapi/models/trip');
var setTrip= function(id,newlist,trips){
	trips.forEach(function(trip){
		if(trip.id === id){
			trip.id = JSON.stringify(newlist);
		}
	})
}

var routeSelects = (function(){
	var ids ,opt0 = 'None', optN = 'Add New', options,
	stops,routes,select,tripbox;
	var createRoute = function(routes){
		var id='',route;
		id = interact('Please Enter a new Route Id',
			'Error Route exists',
			function(id){return routes.containsRoute(id)});
		if(id)
			routes.addRoute(new Route(id));//create a new route object
		return id;
	}
	var setRoutes = function(Routes){
		routes = Routes;
		ids=routes.cloneIds().sort();
		ids.unshift(opt0);
		ids.push(optN);
	}
	var setStops = function(Stops){
		stops=Stops;
	}
	var setSelect = function(S){
		select=S; 
	}
	var buildOptions = function(){
		options = select.selectAll('option').data(ids).attr('value',function(d){return d;})
				.html(function(d){
					return '<em>' + d + "</em>";									//set it's display value to it's id
				});
		options.enter().append('option')
				.attr('value',function(d){return d;})
				.html(function(d){
					return '<em>' + d + "</em>";									//set it's display value to it's id
				});
	}
	var setTripBox = function(T){
		tripbox = T;
	}
	var resetRoutes = function(){
		ids=routes.cloneIds().sort();
		ids.unshift(opt0);
		ids.push(optN);
	}
	var setOnSelectChange = function(){
		select.on('change',function(){											//when the option of the select box has changed
			var i = select.property('selectedIndex');							//get the index of the selected option
			var route_id = options[0][i].__data__;								//set the route_id to the one selected		
			tripbox.selectAll('div').data([]).exit().remove();
			if(route_id === opt0){											//if the selection was none to nothing
				return;
			}
			else if(route_id === optN){
				var id = createRoute(routes);
				resetRoutes();
				buildOptions();
				select.property('selectedIndex',ids.indexOf(id))
				select.on('change')(); //fire the event again
				return;
			}
			var route = routes.getRoute(route_id);
			var trips = route.trips,tripOptions,tripWindows;
			if(trips.length === 0){
				tripOptions = tripbox.selectAll('div').data([new Trip()]);
				tripWindows = tripOptions.enter().append('div').attr('class','tripinfo');
				tripWindows.append('button').html('Add New')
				.on('click',function(trip){
								update.reset();
								plotmod.clear();
								update.create(stops,trip,plotmod,route_id);
								// select.on('change')();
				});
			}else{
				var tripOptions = tripbox.selectAll('div').data(trips);	//set the trip divs
				tripOptions.exit().remove();
				var tripwindows = tripOptions.enter().append('div')						//for each trip append a div
					.attr('class','tripinfo'); 
				tripwindows.append('button').html(function(d,i){					//add an edit button to the trip's div
							return 'Edit ' + i;
						}).on('click',function(trip){								//when the button is clicked
							// var analysis = analyzeIntervals(trip);					//analyze the trip data
							var currstops={};
							update.reset();											//reset the update object
							plotmod.clear();										//clear the map
				    		update.init(stops,trip,plotmod);						//initialize the update object					
						});
			}
		});
	}
	return {
		setRoutes:setRoutes,
		setStops:setStops,
		setSelect:setSelect,
		buildOptions:buildOptions,
		setOnSelectChange:setOnSelectChange,
		setTripBox:setTripBox,
	}
})();

var databox = (function(){
	var dbox,select,tripbox,savebox,savebutton
	
	var init = function(stops,routes,agency){
		
		dbox = d3.select('#datawarehouse');					//create and paint the box.
		select = dbox.append('div').attr('id','selectbox').append('select'); //add a selectbox to the div
		tripbox = dbox.append('div').attr('id','tripbox');										//add a sub div that will contain a list of the trips	
		savebox = dbox.append('div');
		savebox.attr('id','savebox');
		savebutton = savebox.append('button');
		savebutton.html("Save");
		savebutton.attr('disabled','true');
		savebutton.on('click',function(){//REMEMBER, ONLY YOU CAN PREVENT USER ERRORS
							savebutton.attr('disabled','true'); //disable button, prevent accidents
							var saveobj = update.save(), reqobj = saveobj.getReqObj();
							reqobj.id=agency;
							var trip = saveobj.trip;
							var route_id = trip.getRouteId();
							console.log(reqobj);
							upload.editStops(reqobj,function(err,data){
								update.notify(!err);
								if(err){
									savebutton.attr('disabled',null); //disable button, prevent accidents
									alert(err);
								}else{
									if(trip.isNewTrip())
										routes.getRoute(route_id).addTrip(trip);
									saveobj.getAdded().forEach(function(d){stops.addStop(d)});
									saveobj.markSaved();
									setTrip(saveobj.path_id,saveobj.stops,routes.getRoute(route_id).trips);
								}
							});
						});
		plotmod.setSaver(savebutton);
		buildStopsPane(stops,d3);
		routeSelects.setRoutes(routes);
		routeSelects.setStops(stops);
		routeSelects.setSelect(select);
		routeSelects.buildOptions();
		routeSelects.setTripBox(tripbox);
		routeSelects.setOnSelectChange();
		
	};
	return {init:init}
})();

module.exports = databox;