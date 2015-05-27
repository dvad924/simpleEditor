//plotmod
var bundle = require('./leafletExt');
L = bundle.L;
Lext = bundle.extension;

var plotter = (function(){
	var plotmod = {};
	var mapquestOSM = L.tileLayer("http://{s}.tiles.mapbox.com/v3/am3081.h0po4e8k/{z}/{x}/{y}.png");
    L.Icon.Default.imagePath= 'scripts/bower_components/leaflet/dist/images';
    var map = L.map("map", {
          center: [39.8282, -98.5795], //center on the US
          zoom: 4,
          layers: [mapquestOSM],	//use the tilelayer png as map background layer
          zoomControl: false,		//show zoom buttons
          attributionControl:false
        });
    new L.Control.Zoom({position:'topright'}).addTo(map);
    plotmod.plotFeats = function(FeatColl,fit){
    	var layer = Lext.addroutes(FeatColl,map,fit);
    }
    plotmod.plotFeatsBack = function(FeatColl){
      var layer = Lext.addroutesBack(FeatColl,map);
    };
    plotmod.plotStops = function(FeatColl){
    	Lext.addstops(FeatColl,map);
    }
    plotmod.foregroundClear = function(){
      Lext.getFocusLayers().forEach(function(layer){
        map.removeLayer(layer);
      })
    }
    plotmod.clearStops = function(){
      var layer = Lext.getstoplayer();
      if(layer){
         map.removeLayer(layer);
      }
    }
    plotmod.clear = function(){
      Lext.getAllLayers().forEach(function(layer){
        map.removeLayer(layer);
      })
    }

    return plotmod;
})();

module.exports = plotter;
