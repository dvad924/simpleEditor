var swap = function(point){
	return [point[1],point[0]];
}

var decode = function(encoded, precision) {
			var len = encoded.length,
			    index=0,
			    lat=0,
			    lng = 0,
			    array = [];

			precision = Math.pow(10, -precision);

			while (index < len) {
				var b,
				    shift = 0,
				    result = 0;
				do {
					b = encoded.charCodeAt(index++) - 63;
					result |= (b & 0x1f) << shift;
					shift += 5;
				} while (b >= 0x20);
				var dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
				lat += dlat;
				shift = 0;
				result = 0;
				do {
					b = encoded.charCodeAt(index++) - 63;
					result |= (b & 0x1f) << shift;
					shift += 5;
				} while (b >= 0x20);
				var dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
				lng += dlng;
				//array.push( {lat: lat * precision, lng: lng * precision} );
				array.push( [lat * precision, lng * precision] );
			}
			return array;
		}

var osrmApi = (function(){
		var osrm = {};
		// Taken from 
		// https://github.com/mapzen/routing/blob/gh-pages/js/leaflet_rm/L.Routing.OSRM.js
		// Adapted from
		// https://github.com/DennisSchiefer/Project-OSRM-Web/blob/develop/WebContent/routing/OSRM.RoutingGeometry.js
		
		osrm.baseUrl = 'http://osrm.mapzen.com/psv/viaroute?'
		osrm.addwaypoints = function(pointList){
			var str = '';
			pointList.forEach(function(point){
				str += '&loc=' + point[1] + '%2C' + point[0];
			});
			this.locs = str;
		}
		osrm.addwaypoint = function(p1,p2){
			this.locs = '&loc='+p1[1]+'%2C'+p1[0];
			this.locs += '&loc='+p2[1]+'%2C'+p2[0];
		}
		osrm.getUrl = function(){
			return this.baseUrl+this.locs;
		}
		osrm.handleRequest= function(id,callback){				//Function to handle request to the osrm webservers
			d3.json(osrm.getUrl(),function(err,resp){			//request via d3 json  method
				if(resp.status_message !== "Found route between points"){	//if given a bad status message, log it and end
					console.log("Error",resp.status_message)
					console.log(osrm.getUrl())
					return;
				}
				resp.route_geometry = decode(resp.route_geometry,6).map(swap);	//otherwise decode it's geometry
				resp.via_points = resp.via_points.map(swap);
				callback(id,resp);									//and pass the response object to the callback
			})		
		}
		return osrm;
	});

	module.exports = osrmApi