//
//CSE 470 HW 1 Explode!  
//
/*
Written by: HW470:YOUR NAME HERE
Date: Jan 2019

Description: 
This program ..... HW470: COMPLETE THIS. DESCRIBE WHAT YOU DID.
*/

var canvas;
var gl;

//store the vertices
//Each triplet represents one triangle
var vertices = [];
var normals = [];
var animationFlag = [];

//store a color for each vertex
var colors = [];

//HW470: control the explosion
var timeLocation;
 

//HW470: control the redraw rate
var delay = 20;

// =============== function init ======================
 
// When the page is loaded into the browser, start webgl stuff
window.onload = function init()
{
	// notice that gl-canvas is specified in the html code
    canvas = document.getElementById( "gl-canvas" );
    
	// gl is a canvas object
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

	// Track progress of the program with print statement
    console.log("Opened canvas");

    // Generate the core shape
    function generatePointOnCircle (i, n, radius) {
        let x = Math.cos(2*Math.PI/n * i) * radius;
        let y = Math.sin(2*Math.PI/n * i) * radius;
        return vec2(x,y);
    }

    let centerTriangles = 16;
    let radius = 0.4;
    
    // we generate points on a circle to get triangles facing inward for the core
    // at the same time we generate an outward facing triangle 
    // we fill the animation flag buffer with ones and zero's depending on if the 
    // triangle is part of the core or not

    // added normals so that the outer triangles seperate 
    for(i = 1; i <= centerTriangles; i++) {
        // inner part
        vertices.push(vec2(0,0));
        vertices.push( generatePointOnCircle(i-1, centerTriangles, radius) );
        vertices.push( generatePointOnCircle(i, centerTriangles, radius) );
        normals.push ( generatePointOnCircle(i, centerTriangles, 1) );
        normals.push ( generatePointOnCircle(i, centerTriangles, 1) );
        normals.push ( generatePointOnCircle(i, centerTriangles, 1) );
        
        // outer part
        vertices.push( generatePointOnCircle(i, centerTriangles, radius) );
        vertices.push( generatePointOnCircle(i-1, centerTriangles, radius) );
        vertices.push( generatePointOnCircle(i/2, centerTriangles/2, radius*2) );
        normals.push( generatePointOnCircle(i/2, centerTriangles/2, radius) );
        normals.push( generatePointOnCircle(i/2, centerTriangles/2, radius) );
        normals.push( generatePointOnCircle(i/2, centerTriangles/2, radius) );
        
        // fill flag
        animationFlag = animationFlag.concat([0,0,0,1,1,1]);
    }
	
	//HW470: Create colors for the core and outer parts
	// See HW specs for the number of colors needed
	for(var i=0; i < vertices.length; i++) {
		colors.push(vec3( Math.floor((i/3))%2, 0.5, Math.floor((i/6))%2   ));
    };

	// HW470: Print the input vertices and colors to the console
	console.log("Input vertices and colors:");
    console.log("Verticies: ",vertices);
    console.log("Colors: ", colors);
	 

    //  Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
	// Background color to white
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Define shaders to use  
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU
	//
	// color buffer: create, bind, and load
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
	
	// Associate shader variable for  r,g,b color
	var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
    
    // vertex buffer: create, bind, load
    var vbuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vbuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate shader variables for x,y vertices	
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    // extra flag buffer
    var fBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, fBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(animationFlag), gl.STATIC_DRAW );
    
    var vFlag = gl.getAttribLocation( program, "vFlag" );
    gl.vertexAttribPointer( vFlag, 1, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vFlag );

    // normal buffer
    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );
	
	// Associate shader variable for normals
	var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    timeLocation = gl.getUniformLocation(program, "time");
	
    console.log("Data loaded to GPU -- Now call render");

    render();
};

const speed = 0.07;
var currentTime = 0;

function render()
{
    // clear the screen 
    gl.clear( gl.COLOR_BUFFER_BIT );
    
    currentTime += speed;
    
    // offset the time before passing it in (we offset in a way thats uneven to skip the end of the loop)
    gl.uniform1f(timeLocation, (currentTime % (2*Math.PI) < 1.5) ? 0 : currentTime-1.5) ;
	 
	//HW470: draw the object
	// You will need to change this to create the exploding outer parts effect
    // Hint: you will need more than one draw function call
    // Hint: no I will not
    gl.drawArrays( gl.TRIANGLES, 0, vertices.length );
	
	//re-render after delay
	setTimeout(function (){requestAnimFrame(render);}, delay);
}

