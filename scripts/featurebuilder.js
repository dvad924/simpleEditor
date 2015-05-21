var featurebuilder = function(sDict, Obj){

	var fbosrm = function(sDict,osrm){
		var featColl = {type:"FeatureCollection", features:[]};
		var feat = {type:"Feature",properties:{},geometry:{type:'LineString'}}; //create a feature;
		feat.geometry.coordinates = osrm.route_geometry;
		featColl.features.push(feat);
		return  featColl;
	};

	if(Obj.type === 'osrm'){
		return fbosrm(sDict, Obj.object);
	}
}

module.exports = featurebuilder;