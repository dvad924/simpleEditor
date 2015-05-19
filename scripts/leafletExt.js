var Lext = (function(L){
	var stateLayer;
	var stopLayer;
	var addroutes = function(rdata,map){
		var bounds = [];
		bounds.push(rdata.bbox.splice(0,2).reverse());
		bounds.push(rdata.bbox.reverse());
		stateLayer = L.geoJson(rdata, {
			style:function(feature){
				return {
					color:'#'+feature.properties.route_color,
					opacity: 0.9,
					weight:5,

				};
			},

		});
		stateLayer.addTo(map);
		map.fitBounds(bounds);
	}
	var addstops = function(sdata,map){
		var stopLayer = L.geoJson(sdata,{
   				pointToLayer: function (d, latlng) {
               	var options = {                  
                   color: "#000",
                   weight: 3,
                   opacity: 1,
                   fillOpacity: 0.8,
                   stroke:false,
                   fillColor:'#a00',
                   radius:10,
                   draggable:true,

               };
               var obj = L.marker(latlng,options);
                obj.on('drag',function(){
               		var lat = obj._latlng.lat;
               		var lng = obj._latlng.lng;
               		var box = d3.select('#infobox');
               		box.html('<h2>'+d.properties.stop_id+'</h2><p> lat: '+lat+'</p><p> long: '+lng+'</p>')


                })
               obj.on('dragend',function(){
               		// console.log(obj.toGeoJSON())
               		// console.log(stopLayer.toGeoJSON())
               })
               return obj;
			    },
			    onEachFeature: function(f,layer){

			    }

			})
		console.log(stopLayer)
   		stopLayer.addTo(map);
   		Object.keys(stopLayer._layers).forEach(function(markerid){
   			marker = stopLayer._layers[markerid];
   			marker.snapediting = new L.Handler.MarkerSnap(map, marker);
        	marker.snapediting.addGuideLayer(stateLayer);
        	marker.snapediting.enable();
   		});
	}
	return {addroutes:addroutes,addstops:addstops}
})(L);

if(typeof modules !== 'undefined'){
	module.exports = Lext;
}

