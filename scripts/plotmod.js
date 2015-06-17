//plotmod
var bundle = require('./leafletExt');
var Stop   = require('./gtfsapi/models/stop')
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
      var layer = Lext.getstopslayer();
      if(layer){
         map.removeLayer(layer);
      }
      Lext.purgeStops();
    }
    plotmod.clear = function(){
      plotmod.clearStops();
      Lext.getAllLayers().forEach(function(layer){
        map.removeLayer(layer);
      })
    }
    plotmod.initializeTrip = function(cb){
      var count = 0;
      Lext.toggleStopsEvents();
      function onClick(e){
        console.log(e);
        Lext.addStop(e,map);
        count++;
        if(count ===2){
          var newstops = Lext.getstoplayers().map(function(d){
            var s = new Stop();
            var lat = d._latlng.lat,lon = d._latlng.lng;
            s.setLat(d._latlng.lat);
            s.setLon(d._latlng.lng);
            return s;
          })
          cb(newstops);
          Lext.toggleStopsEvents();
          count = 0;
          map.off('click',onClick);
        }
          console.log('It kinda worked')
      }
      map.on('click',onClick);
    }
    plotmod.setSaver = function(saver){
      Lext.setSaver(saver);
    }

    return plotmod;
})();

module.exports = plotter;
