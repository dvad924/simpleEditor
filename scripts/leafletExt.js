L = require('./bower_components/leaflet/dist/leaflet');
require('./node_modules/leaflet-path-drag/dist/L.Path.Drag');
require('./node_modules/leaflet-geometryutil/dist/leaflet.geometryutil');
// require('./Leaflet.Snap/leaflet.snap');
var update = require('./update');


var Lext = (function(L){
  var markerOptions = {                  
                   color: "#000",
                   weight: 1,
                   opacity: 1,
                   fillOpacity: 1,
                   stroke:false,
                   fillColor:'#000',
                   radius:5,
                   draggable:true,
               };
	var layers = {};
	var getStopLayer = function(){
    return layers['stops'];
  }
  var getPathLayer = function(){
    return layers['paths'];
  }
  var getBackgroundLayer = function(){
    return layers['background'];
  }
  var getFocusLayers = function(){
    return [getStopLayer(),getPathLayer()];
  }
  var getAllLayers = function(){
    var layerList = [];
    Object.keys(layers).forEach(function(id){
      if(layers[id])
        layerList.push(layers[id]);
    })
    return layerList;
  }
  var addroutes = function(rdata,map,fit){
		layers['paths'] = L.geoJson(rdata, {
			style:function(feature){
				return {
					//color:'#'+feature.properties.route_color,
					opacity: 1,
					weight:10,
				};
			},
      onEachFeature:function(feat,layer){
        var tempMarker;
        layer.on('click',function(){
          layers.stops.addLayer(tempMarker);
          tempMarker = undefined;
        });
        layer.on('mouseout',function(){
          if(tempMarker)
            map.removeLayer(tempMarker);
        })
        layer.on('mouseover',function(e){
          tempMarker = L.marker(e.latlng,markerOptions);
          tempMarker.addTo(map);
        })
        layer.on('mousemove',function(e){
          if(tempMarker)
            tempMarker.setLatLng(e.latlng);
        })
      }
		});
		layers.paths.addTo(map);
    layers.paths.bringToBack();
    if(fit){
      map.fitBounds(layers.paths.getBounds());  
    }	
	}
  var addroutesBack = function(rdata,map){
    layers['background'] = L.geoJson(rdata, {
      style:function(feature){
        return{
          opacity:0.2,
          weight:1,
        };
      },
    });
    layers.background.addTo(map);
  };
	var addstops = function(sdata,map){
		layers['stops'] = L.geoJson(sdata,{
   				pointToLayer: function (d, latlng) {
               	

               var obj = L.marker(latlng,markerOptions);
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
               obj.on('dblclick',function(){
                   map.removeLayer(layers.paths);
                   update.deletePoint(obj.feature);
                   update.update();
               })
               return obj;
			    },
          onEachFeature:function(f,layer){
            layer.bindPopup(f.properties.stop_id); 
          }
			})
      layers.stops.on('layeradd',function(e){
          var marker = e.layer; //This makes the reasonable assumption that the only layers to be added to this layer group will be markers
          var stopPoint = marker._latlng;
          var coors = [stopPoint.lng,stopPoint.lat];

          var buildFeat = function(id){
            var feature = {type:'Feature',geometry:{type:'Point',coordinates:coors},properties:{stop_id:id}};
            return feature;
          }
          var id = update.addPoint(buildFeat()); //id will be undefined when adding but it will be done in the update module.
          update.update();
      //     marker.on('drag',function(){
      //       var lat = marker._latlng.lat;
      //       var lng = marker._latlng.lng;
      //       var box = d3.select('#infobox');
      //       box.html('<h2>New Stop</h2><p> lat: '+lat+'</p><p> long: ',+lng+'</p>');
      //     })
      //     marker.on('dragend',function(){
      //       map.removeLayer(layers.paths);
      //       var lat = marker._latlng.lat;
      //       var lng = marker._latlng.lng;
      //       var feat = buildFeat(id)
      //       update.update(feat);
      //     })
      //     marker.on('dblclick',function(){
      //       map.removeLayer(layers.paths);
      //       update.deletePoint(buildFeat(id));
      //       update.update();
      //     })
      })
   		layers.stops.addTo(map);
	}
  
	return {
    addroutes:addroutes,
    addroutesBack:addroutesBack,
    addstops:addstops, 
    getstoplayer:getStopLayer,
    getpathlayer:getPathLayer,
    getAllLayers:getAllLayers,
    getFocusLayers:getFocusLayers,
  };
})(L);

module.exports = {extension:Lext , L:L};


