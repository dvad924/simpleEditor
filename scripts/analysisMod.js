var analysisMod = (function(){

	var dotprod = function(l1,l2){
			var sum =0;
			for(var i =0, max = Math.min(l1.length,l2.length); i< max; i++){
				sum += l1[i]*l2[i];
			}
			return sum
	}
	
	var diffMins = function(t1,t2){
		factors = [3600,60,1]
		t1 = t1.split(':');
		t2 = t2.split(':');
		var parseI = function(x){return parseInt(x)}
		var p1= t1.map(parseI);
		var p2 = t2.map(parseI);
		var ctime1 = dotprod(factors,p1);
		var ctime2 = dotprod(factors,p2);
		return (ctime2 - ctime1)/60
	}

	var analyzeIntervals = function(trip){
		var intervals = trip.intervals;
		var difftotal = 0, lentotal=0;
		var len = trip.intervals.length-1;
		for(var i = 0; i<len; i++){
			var cur = intervals[i],next = intervals[i+1];
			var delta = diffMins(cur[0],next[0]);  	//diff in start times
			difftotal += delta;			            //average time between trip starts
			delta = diffMins(intervals[i][0],intervals[i][1]);
			lentotal += delta;
		}
		lentotal += diffMins(intervals[i][0],intervals[i][1]);
		return {
				start:intervals[0][0],
				end:intervals[intervals.length-1][0],
				averageInterval:difftotal/len,
				averageLength:lentotal/(len+1),
				}
	}
	return{
		analyzeIntervals:analyzeIntervals,
	}
})()

module.exports = analysisMod.analyzeIntervals;