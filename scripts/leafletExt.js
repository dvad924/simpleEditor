L = require('./bower_components/leaflet/dist/leaflet');
// require('./node_modules/leaflet-path-drag/dist/L.Path.Drag');
require('./node_modules/leaflet-geometryutil/dist/leaflet.geometryutil');
// require('./Leaflet.Snap/leaflet.snap');
var update = require('./update');


var Lext = (function(L){
  var divmarker = L.divIcon({
    className:'divMarker',
    iconSize:[10,10],
  });
  var saver;
	var layers = {};
  var setSaver = function(saveObj){
    saver = saveObj;
  }
	var getStopLayers = function(){
    return layers['stops'].getLayers();
  }
  var getStopsLayer = function(){
    return layers['stops'];
  }
  var purgeStops = function(){
    if(layers.stops)
      layers['stops'].clearLayers();
    layers['stops'] = undefined;
  }
  var toggleStopsEvents = function(){
    if(layers.stops && layers.stops.toggleAdd)
      layers['stops'].toggleAdd();
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
        layer.on('click',function(e){
          tempMarker = L.marker(e.latlng,{icon:divmarker, draggable:true});
          layers.stops.addLayer(tempMarker);
          tempMarker = undefined;
        });
      }
		});
		layers.paths.addTo(map);
    layers.paths.bringToBack();
    if(fit){
      map.fitBounds(layers.paths.getBounds());  
    }	
	}
  var addStop = function(e,map){
    var marker = L.marker(e.latlng,{icon:divmarker,draggable:true});
    if(layers.stops) 
      layers.stops.addLayer(marker)
    else{
       layers.stops=L.layerGroup([marker]);
       layers.stops.addTo(map);
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
               var obj = L.marker(latlng,{icon:divmarker,draggable:true});
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
                  saver.attr('disabled',null);
               })
               obj.on('dblclick',function(){
                   map.removeLayer(layers.paths);
                   update.deletePoint(obj.feature);
                   update.update();
                   saver.attr('disabled',null);
               })
               return obj;
			    },
          onEachFeature:function(f,layer){

            layer.bindPopup(f.properties.stop_id,{
                offset:[0,-10]
            }); 
          }
			})

      function addLayer(e){
          var marker = e.layer; //This makes the reasonable assumption that the only layers to be added to this layer group will be markers
          var stopPoint = marker._latlng;
          var coors = [stopPoint.lng,stopPoint.lat];
          var buildFeat = function(id){
            var feature = {type:'Feature',geometry:{type:'Point',coordinates:coors},properties:{stop_id:id}};
            return feature;
          }
          var id = update.addPoint(buildFeat()); //id will be undefined when adding but it will be done in the update module.
          if(id != undefined){
            map.removeLayer(layers.paths);
            update.update();  
            saver.attr('disabled',null);  //allow for saving of the data once a stop is added.
          }else{
            layers.stops.removeLayer(marker);
          }
      }
      layers.stops.on('layeradd',addLayer);
      layers.stops.toggleAdd = function(){
        if(layers.stops.hasEventListeners('layeradd'))
          layers.stops.off('layeradd',addLayer);
        else
          layers.stops.on('layeradd',addLayer);
      }
   		layers.stops.addTo(map);
	}
  
	return {
    setSaver:setSaver,
    addroutes:addroutes,
    addroutesBack:addroutesBack,
    addstops:addstops, 
    addStop:addStop,
    getstoplayers:getStopLayers,
    getpathlayer:getPathLayer,
    getAllLayers:getAllLayers,
    getFocusLayers:getFocusLayers,
    getstopslayer: getStopsLayer,
    toggleStopsEvents:toggleStopsEvents,
    purgeStops:purgeStops,
  };
})(L);

module.exports = {extension:Lext , L:L};


