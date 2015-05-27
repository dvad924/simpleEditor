if(typeof d3 === 'undefined'){
	throw {
		message:'module requires d3',
		name:'RequirementException',
	}
}

var plotmod = require('./plotmod');
var update = require('./update');

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

	var init = function(routes,stops,scheds){
		var route_ids = Object.keys(scheds);	//get the list of route iDs to be displayed
		route_ids.unshift('None');
		var dbox = create();
		var select = dbox.append('div').attr('id','selectbox').append('select');
		var options = select.selectAll('option').data(route_ids);
		options.enter().append('option')
			.attr('value',function(d){return d;})
			.html(function(d){
				return '<em>' + d + "</em>";
			});
		var tripbox = dbox.append('div');
		tripbox.attr('id','tripbox');
		select.on('change',function(){
			var i = select.property('selectedIndex');
			var route_id = options[0][i].__data__;
			tripbox.selectAll('div').data([]).exit().remove();
			if(route_id === 'None'){
				return;
			}
			plotmod.plotFeatsBack(routes);
			console.log(scheds[route_id]);
			var trips = tripbox.selectAll('div').data(scheds[route_id].trips);
			var tripwindows = trips.enter().append('div')
					.attr('class','tripinfo')
					.style({
						position:'relative',
						'border-style':'solid',
						'background-color':'green',
						overflow:'hidden',
					})
			tripwindows.append('button').html(function(d,i){
						return 'Edit ' + i;
					}).on('click',function(trip){
						var currstops={type:'FeatureCollection',features:[]},stopDict = {},buildobj ={};
						console.log(trip.id);
						update.reset();
						plotmod.clear();
						//filter stops to current route
						currstops.features = stops.features.filter(function(d){return d.properties.routes.indexOf(route_id) >= 0})
	    				console.log(currstops);
	    				currstops.features.forEach(function(stop){	//build dictionary of stops
		    				stopDict[stop.properties.stop_id] = stop;
			    		});
			    		buildobj[route_id] = trip;
			    		update.init(stopDict,buildobj,{},plotmod);
					});
			tripwindows.append('button').html('<em>Save</em>')
						.on('click',function(trip){
							console.log(update.save());
						});
			trips.exit().remove();
		});
	};

	return {
		init:init,
	}
})();

module.exports = databox;