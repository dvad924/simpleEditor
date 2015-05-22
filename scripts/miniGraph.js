var miniGraph = function(){
    //node object that will be verticies of a graph
    var node = function(v){
		this.val = v.toString();
		this.adjs = [];
		this.addadj = function(v){
		    this.adjs.push(v.toString());
		}
		this.isLinked = function(v){
		    return this.adjs.indexOf(v.toString()) >= 0;
		}
		this.getNeihbors = function(){
			return this.adjs;
		}
    }
    //An edge contains refereces to 2 nodes in the graph
    //as well as extra data that needs to be associated with them.
    var edge = function(n1,n2,data){
    	this.id = n1.val + n2.val; //concatenate identifying strings of the nodes to form an edge id
    	this.data = data;
    }
    //list of nodes for the current graph
    this.nodes = {};
    this.edges = {};
    this.numedges = 0;
    this.isEmpty = function(){
    	return this.numedges <= 0;
    }
    this.queryNode = function(v1){
		return this.nodes[v1.toString()];
    }
    this.insertNode = function(v1){
		var strrep = v1.toString();
		this.nodes[strrep] = this.nodes[strrep] || new node(v1);
		return this.nodes[strrep];
    }
    //Function to determine if a given edge
    //currently resides within the graph
    this.testEdge = function(v1,v2){
		var n1 = this.queryNode(v1);
		var n2 = this.queryNode(v2);
		if( n1 && n2 ){
		    return n1.isLinked(v2);
		}else{
		    return false;
		}
    };

    //Function to add an edge to the graph
    //Edge is determined by its 2 ending 
    this.addEdge = function(v1,v2,data){
		if(!this.testEdge(v1,v2)){
		    var n1 = this.insertNode(v1);
		    var n2 = this.insertNode(v2);
		    n1.addadj(v2);
		    n2.addadj(v1);	
		    var e = new edge(n1,n2,data);
		    this.edges[e.id] = e;
		    this.numedges++;
		    return true;
		}else{
		    return false;
		}
    };
   this.updateEdge = function(v1,v2,data){
   	var edge = this.getEdge(v1,v2);
   	if(edge){
   		edge.data = data;
   		return true;
   	}
   	else
   		return false;
   }
    //if the two vertex identifiers form an edge
    //retrieve their edge object.
    this.getEdge = function(v1,v2){
    	var retobj;
    	var id;
    	if(this.testEdge(v1,v2)){
    		id = v1.toString() + v2.toString();
    		retobj = this.edges[id];
    		if(retobj)
    			return retobj;
    		id = v2.toString() + v1.toString();
    		return this.edges[id];
    	}
    }
    this.toFeatureCollection = function(){
    	var featcoll = {type:'FeatureCollection',features:[]};
    	var graph = this;
    	Object.keys(this.edges).forEach(function(key){
    		var data = graph.edges[key].data;
    		if(data.type === 'Feature')
    			featcoll.features.push(data);
    	});
    	return featcoll;
    }

    //Perform breadth first search to find paths within the graph
    //Inputs starting point and ending point, returns all 
    //intermediary points inbetween
    this.bfs = function(v1,v2){
		v1 = v1.toString();
		v2 = v2.toString();
		var queue = [];
		var set = [];
		var parents = {};
		queue.push(v1);//push the starting point on 
		set.push(v1);  //both the queue and seen list
		while(queue.length != 0){
		    var t = queue.splice(0,1)[0] //get the oldes item in the queue
		    if(t === v2){                //if it is the endpoint
			var pathStack = [v2];    //initially add end point to pathlist 
			var child = v2, parent = parents[v2.toString()];//set it as the child and get its parent node in the path
			pathStack.unshift(parent);// add the parent to the list
			while(parent !== v1){
			    child = parent;      //set the child to the parent node.
			    parent = parents[child.toString()]; //get its parent node 
			    pathStack.unshift(parent);//add the parent to the list
			}
			return pathStack;        //return the final list
		    }
		    
		    var adjs = this.queryNode(t).adjs;      //if its not the end point
		    adjs.forEach(function(vert){ //get the nodes adjacent to the current node
			if(set.indexOf(vert) < 0){//if the current vertex hasn't been seen
			    queue.push(vert);     //add the vertex to the queue to be visited
			    set.push(vert);       //add it to the list of seen vertexes
			    parents[vert.toString()] = t;//note the current node as its parent
			}
		    });
		}
    }
    
    
}

module.exports = miniGraph
