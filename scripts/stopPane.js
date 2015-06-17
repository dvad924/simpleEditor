var stopPane = function(stops,d3){
	var stopbox = d3.select('#stopbox').append('div');
	var stopDivs = stopbox.selectAll('div')
	var stopOptions = stopDivs.data(stops.list);
	stopOptions.enter().append('div').attr('class','stop')
						.attr('id',function(d){ return 'stop_'+d.getId()})
						.html(function(d){
							return 	"<h2>" +d.getId()+"</h2>"
								+  	"<p>"+ d.getRoutes() +"</p>"
						});
	var filterbox = d3.select('#filtertext');
	filterbox.on('keyup',function(){
		var val = filterbox[0][0].value;
		stopOptions.data([]).exit().remove();
		var subset = stops.list.filter(function(d){return d.getId().startsWith(val);})
		stopOptions = stopDivs.data(subset).attr('class','stop')
		.attr('id',function(d){ return 'stop_'+d.getId()})
		.html(function(d){
			return 	"<h2>" +d.getId()+"</h2>"
				+  	"<p>"+ d.getRoutes() +"</p>"
		});
		stopOptions.enter().append('div').attr('class','stop')
		.attr('id',function(d){ return 'stop_'+d.getId()})
		.html(function(d){
			return 	"<h2>" +d.getId()+"</h2>"
				+  	"<p>"+ d.getRoutes() +"</p>"
		});
		stopOptions.exit().remove();
	})
}

module.exports=stopPane;