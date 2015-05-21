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
    }
    //list of nodes for the current graph
    this.nodes = {}
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
    this.addEdge = function(v1,v2){
	if(!this.testEdge(v1,v2)){
	    var n1 = this.insertNode(v1);
	    var n2 = this.insertNode(v2);
	    n1.addadj(v2);
	    n2.addadj(v1);	
	    return true;
	}else{
	    return false;
	}
    };

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
