L = require('./bower_components/leaflet/dist/leaflet');
// require('./node_modules/leaflet-path-drag/dist/L.Path.Drag');
require('./node_modules/leaflet-geometryutil/dist/leaflet.geometryutil');
// require('./Leaflet.Snap/leaflet.snap');
var update = require('./update');
var Lext = (function(L){
	var stateLayer;
	var stopLayer;
	var getStopLayer = function(){
    return stopLayer;
  }
  var getPathLayer = function(){
    return stateLayer;
  }

  var addroutes = function(rdata,map){
		var bounds = [];
		// bounds.push(rdata.bbox.splice(0,2).reverse());
		// bounds.push(rdata.bbox.reverse());
		stateLayer = L.geoJson(rdata, {
			style:function(feature){
				return {
					//color:'#'+feature.properties.route_color,
					opacity: 0.9,
					weight:5,

				};
			},

		});
		stateLayer.addTo(map);
		//map.fitBounds(bounds);
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
               //While dragging populate the infobox with imperative info.
                obj.on('drag',function(){
               		var lat = obj._latlng.lat;
               		var lng = obj._latlng.lng;
               		var box = d3.select('#infobox');
               		box.html('<h2>'+d.properties.stop_id+'</h2><p> lat: '+lat+'</p><p> long: '+lng+'</p>')
                  

                })
               obj.on('dragend',function(){
               		// console.log(obj.toGeoJSON())
               		// console.log(stopLayer.toGeoJSON())
                  map.removeLayer(stateLayer);
                  update.update(stopLayer.toGeoJSON());


               })
               return obj;
			    },
			    onEachFeature: function(f,layer){

			    }

			})
		console.log(stopLayer)
   		stopLayer.addTo(map);
   		//make each stop marker snapable to the routes.
   		// Object.keys(stopLayer._layers).forEach(function(markerid){
   		// 	marker = stopLayer._layers[markerid];
   		// 	marker.snapediting = new L.Handler.MarkerSnap(map, marker);
     //    	marker.snapediting.addGuideLayer(stateLayer);
     //    	marker.snapediting.enable();
   		// });
	}
  
	return {addroutes:addroutes,addstops:addstops, getstoplayer:getStopLayer,getpathlayer:getPathLayer};
})(L);

module.exports = {extension:Lext , L:L};


