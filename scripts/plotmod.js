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
          zoomControl: true,		//show zoom buttons
          attributionControl:false
        });
    plotmod.plotFeats = function(FeatColl){
    	var layer = Lext.addroutes(FeatColl,map);
    }
    plotmod.plotStops = function(FeatColl){
    	Lext.addstops(FeatColl,map);
    }
    return plotmod;
})();

module.exports = plotter;
