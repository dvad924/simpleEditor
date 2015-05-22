L = require('./bower_components/leaflet/dist/leaflet');
// require('./node_modules/leaflet-path-drag/dist/L.Path.Drag');
require('./node_modules/leaflet-geometryutil/dist/leaflet.geometryutil');
// require('./Leaflet.Snap/leaflet.snap');
var update = require('./update');


var Lext = (function(L){
	var layers = {};
	var getStopLayer = function(){
    return layers['stops'];
  }
  var getPathLayer = function(){
    return layers['paths'];
  }

  var getAllLayers = function(){
    var layerList = [];
    Object.keys(layers).forEach(function(id){
      if(layers[id])
        layerList.push(layers[id]);
    })
    return layerList;
  }

  var addroutes = function(rdata,map){
		var bounds = [];

		// bounds.push(rdata.bbox.splice(0,2).reverse());
		// bounds.push(rdata.bbox.reverse());
		layers['paths'] = L.geoJson(rdata, {
			style:function(feature){
				return {
					//color:'#'+feature.properties.route_color,
					opacity: 0.9,
					weight:5,

				};
			},

		});
		layers.paths.addTo(map);
		map.fitBounds(layers.paths.getBounds());
	}
	var addstops = function(sdata,map){

		layers['stops'] = L.geoJson(sdata,{
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
                  map.removeLayer(layers.paths);
                  obj.feature.geometry.coordinates[0] = obj._latlng.lng;
                  obj.feature.geometry.coordinates[1] = obj._latlng.lat;
                  update.update(obj.feature);

               })
               return obj;
			    },
			    onEachFeature: function(f,layer){

			    }

			})
   		layers.stops.addTo(map);
   		//make each stop marker snapable to the routes.
   		// Object.keys(stopLayer._layers).forEach(function(markerid){
   		// 	marker = stopLayer._layers[markerid];
   		// 	marker.snapediting = new L.Handler.MarkerSnap(map, marker);
     //    	marker.snapediting.addGuideLayer(stateLayer);
     //    	marker.snapediting.enable();
   		// });
	}
  
	return {
    addroutes:addroutes,
    addstops:addstops, 
    getstoplayer:getStopLayer,
    getpathlayer:getPathLayer,
    getAllLayers:getAllLayers
  };
})(L);

module.exports = {extension:Lext , L:L};


