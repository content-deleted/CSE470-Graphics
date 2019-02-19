
//
//CSE 470 HW 2
//
/*
Written by: Jacob Hann
Date: Feb 2019

Description: 
This program displays some cubes
*/

// These are the cube vertices and cube definition that must be used for HW 2.//


var vertices = [
	vec3( 0.0, 0.0,  0.0),
	vec3( 0.0, 1.0,  0.0 ),
	vec3( 1.0, 1.0,  0.0 ),
	vec3( 1.0, 0.0,  0.0 ),
	vec3( 0.0, 0.0, -1.0 ),
	vec3( 0.0, 1.0, -1.0),
	vec3( 1.0, 1.0, -1.0 ),
	vec3( 1.0, 0.0, -1.0 )
];


var oneColor = [ 0.0, 0.5, 0.2, 1.0 ];
 
	
function createCube( obj )
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function quad(a, b, c, d) 
{

    // We need to partition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices
    
    //vertex color assigned by the index of the vertex
    
    let indices = [ a, b, c, a, c, d ];

    //console.log("CreateCube: indices = ",indices);

    for ( let i = 0; i < indices.length; ++i ) {
        cubeVertices.push( vertices[indices[i]] );
		cubeColor.push([d/7,0.5,a/14 + b /14, 1.0]);
    }
}

var cubeObjects = [];
var cubeVertices = [];
var cubeColor = [];

var canvas;
var gl;

// Changing Uniforms
var timeLocation;
var worldMatrixLocation;
 

//HW470: control the redraw rate
var delay = 20;

var slider;

// =============== function init ======================
 
// When the page is loaded into the browser, start webgl stuff
window.onload = function init()
{
	// notice that gl-canvas is specified in the html code
    canvas = document.getElementById( "gl-canvas" );

    canvas.addEventListener('click', function(event) {
        var rect = this.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        console.log("x: " + x + " y: " + y); 
    }, false);

    slider = document.getElementById("size");

	// gl is a canvas object
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

	// Track progress of the program with print statement
    console.log("Opened canvas");

    //  Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
	// Background color to white
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Define shaders to use  
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Setup the cubes
    for(let i = 0; i < 8; i++)
        cubeObjects.push
        (
            {
                indexStart:cubeObjects.length*36,
                position: generatePointOnCircle(i+1, 8, 0.75),
                rotation: 0.0,
            }
        );
        
    createCube();

    // Load the data into the GPU
	//
	// color buffer: create, bind, and load
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cubeColor), gl.STATIC_DRAW );
	
	// Associate shader variable for  r,g,b color
	var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
    
    // vertex buffer: create, bind, load
    var vbuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vbuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cubeVertices), gl.STATIC_DRAW );

    // Associate shader variables for x,y vertices	
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    timeLocation = gl.getUniformLocation(program, "time");

    worldMatrixLocation = gl.getUniformLocation(program, "World");
    
    // These uniforms do not change
    let viewMatrix = lookAt(vec3(0,0,-1), vec3(0,0,0), vec3(0,1,0));
    let viewLocation = gl.getUniformLocation(program, "View");
    gl.uniformMatrix4fv(viewLocation, false, flatten(viewMatrix));

    let projectionMatrix = perspective(100, 1, 0.1, 100);
    let projectionLocation = gl.getUniformLocation(program, "Projection");
    gl.uniformMatrix4fv(projectionLocation, false, flatten(projectionMatrix));
    


    console.log("Data loaded to GPU -- Now call render");

    // enable depth buffer
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    
    // set custom clear color
    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    
    // set slider
    slider.value = 20;

    render();
};

const speed = 0.07;
var currentTime = 0;

function render()
{
    // clear the screen 
    gl.clear( gl.COLOR_BUFFER_BIT );
    
    currentTime += speed;

    slider.value;
    
    let currentScale = slider.value/100.0;

    cubeObjects.forEach( cube => {
       // let World = rotate(cube.rotation, normalize(cube.position) );
        let Model = rotate(cube.rotation, normalize(cube.position) );
        let World = mult(translate(cube.position),scalem(currentScale,currentScale,currentScale));
        World = mult(Model, World);
        
        gl.uniformMatrix4fv(worldMatrixLocation, false, flatten(World));

        gl.drawArrays( gl.TRIANGLES, 0, 36 );

        // update rotation
        cube.rotation += 0.5;
    });

    // Draw the middle cube
    let World = scalem(currentScale,currentScale,currentScale)
    gl.uniformMatrix4fv(worldMatrixLocation, false, flatten(World));
    gl.drawArrays( gl.TRIANGLES, 0, 36 );
	
	//re-render after delay
	setTimeout(function (){requestAnimFrame(render);}, delay);
}


function generatePointOnCircle (i, n, radius) {
    let x = Math.cos(2*Math.PI/n * i) * radius;
    let y = Math.sin(2*Math.PI/n * i) * radius;
    return vec3(x,y,0);
}