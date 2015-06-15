if(typeof d3 === 'undefined'){
	throw {
		message:'module requires d3',
		name:'RequirementException',
	}
}

var plotmod = require('./plotmod');
var update = require('./update');
var analyzeIntervals = require('./analysisMod');
var upload = require('./gtfsapi/gtfsdata');
var setTrip= function(id,newlist,trips){
	trips.forEach(function(trip){
		if(trip.id === id){
			trip.id = JSON.stringify(newlist);
		}
	})
}
var databox = (function(){
	var create = function(){
		var dbox = d3.select('body').append('div').attr('id','datawarehouse');
    		dbox.style(function(){
	    		var Wheight = window.outerHeight;
				var Wwidth = window.outerWidth;
	    		var width = 400;
	    		var height = 500;
	    		var pos = Wheight - height - 50;	
    			return{
	    			position:'absolute',
	    			height: height,
	    			width: width,
	    			top: 0,
	    			padding:0,
	    			margin:0,
	    			'text-align':'center',
	    			'background-color':'#ddd',
	    			'overflow':'hidden',
	    		}
	    	}());
	    	return dbox;
	}
	var init = function(stops,routes,agency){
		var route_ids = routes.cloneIds().sort();	//get the list of route iDs to be displayed
		route_ids.unshift('None');				//Add the None option to the data
		var dbox = create();					//create and paint the box.
		var select = dbox.append('div').attr('id','selectbox').append('select'); //add a selectbox to the div
		var options = select.selectAll('option').data(route_ids);				//for each route_id add an option to the select box
		options.enter().append('option')								
			.attr('value',function(d){return d;})
			.html(function(d){
				return '<em>' + d + "</em>";									//set it's display value to it's id
			});
		var tripbox = dbox.append('div');										//add a sub div that will contain a list of the trips
		tripbox.attr('id','tripbox');
		tripbox.style({
			position:'relative',
			overflow:'hidden',
			height:'90%'
		})
		var savebox = dbox.append('div');
		savebox.attr('id','savebox');
		var savebutton = savebox.append('button');
		savebutton.html("Save");
		savebutton.attr('disabled','true');
		plotmod.setSaver(savebutton);
														
		select.on('change',function(){											//when the option of the select box has changed
			var i = select.property('selectedIndex');							//get the index of the selected option
			var route_id = options[0][i].__data__;								//set the route_id to the one selected
			tripbox.selectAll('div').data([]).exit().remove();					//clear the div
			if(route_id === 'None'){											//if the selection was none to nothing
				return;
			}
		
			savebutton.on('click',function(){//REMEMBER, ONLY YOU CAN PREVENT USER ERRORS
							savebutton.attr('disabled','true'); //disable button, prevent accidents
							var saveobj = update.save(), reqobj = saveobj.getReqObj();
							reqobj.id=agency;
							console.log(reqobj);
							upload.editStops(reqobj,function(err,data){
								update.notify(!err);
								if(err){
									alert(err);
									savebutton.attr('disabled','false');
								}else{
									saveobj.getAdded().forEach(function(d){stops.addStop(d)});
									saveobj.markSaved();
									setTrip(saveobj.path_id,saveobj.stops,routes.getRoute(route_id).trips);
								}
							});
						});
			var trips = tripbox.selectAll('div').data(routes.getRoute(route_id).trips);	//set the trip divs
			var tripwindows = trips.enter().append('div')						//for each trip append a div
				.attr('class','tripinfo')
				.style({
						position:'relative',
						'border-style':'solid',
						'background-color':'green',
						overflow:'hidden',
					})
			tripwindows.append('button').html(function(d,i){					//add an edit button to the trip's div
						return 'Edit ' + i;
					}).on('click',function(trip){								//when the button is clicked
						var analysis = analyzeIntervals(trip);					//analyze the trip data
						var currstops={};
						update.reset();											//reset the update object
						plotmod.clear();										//clear the map
			    		update.init(stops,trip,plotmod);						//initialize the update object
					});
			trips.exit().remove();
		});
	};
	return {init:init}
})();

module.exports = databox;