//
//CSE 470 HW 1 Explode!  
//
/*
Written by: HW470:YOUR NAME HERE
Date: Jan 2019

Description: 
This program ..... HW470: COMPLETE THIS. DESCRIBE WHAT YOU DID.
*/
"use strict";

var canvas;
var gl;

//store the vertices
//Each triplet represents one triangle
var vertices = [];
var normals = [];
var texCoords = [];
var indicies = [];

//store a color for each vertex
var colors = [];

//HW470: control the explosion
var timeLocation;
var offsetLocation;
var viewLocation;
var rotationLocation;
 

//HW470: control the redraw rate
var delay = 20;
var startTime = new Date().getTime();

// button
var restartButton;
var pauseButton;

var paused=false;

// =============== function init ======================
 
// When the page is loaded into the browser, start webgl stuff
window.onload = function init()
{
	// notice that gl-canvas is specified in the html code
    canvas = document.getElementById( "gl-canvas" );
    restartButton = document.getElementById("restartButton");
    restartButton.onclick = () => currentTime = 0; //startTime = new Date().getTime();
    pauseButton = document.getElementById("pauseButton");
    pauseButton.onclick = () => {
        paused = !paused;
        pauseButton.innerText = (paused) ? "Play" : "Pause";
    };
    
	// gl is a canvas object
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

	// Track progress of the program with print statement
    console.log("Opened canvas");
        
    //HW470:
    // Define  data for object 
	// See HW specs for number of vertices and parts required
	// Recommendation: each set of three points corresponds to a triangle.
	// DCH: I have used sval for scaling the object size if I am not
	// happy with my initial design. (Just an idea for you; no need to use.)
	//(During the explosion all geometry must remain in the window.)
    //


    // Generate a standard unit sphere
    let radius = 0.5;

    let rings= 20;
    let sectors = 20;
    const R = 1/(rings-1.0);
    const S = 1/(sectors-1.0);
    let r, s;

    for(r = 0; r < rings; r++) for(s = 0; s < sectors; s++) {
        const y = Math.sin( -Math.PI/2 + Math.PI * r * R );
        const x = Math.cos(2*Math.PI * s * S) * Math.sin( Math.PI * r * R );
        const z = Math.sin(2*Math.PI * s * S) * Math.sin( Math.PI * r * R );

        texCoords.push( vec2( s*S , r*R ) );
        vertices.push( vec3( x * radius, y * radius, z * radius) );
        normals.push( vec3(x,y,z ) );
    }
    
    for(r = 0; r < rings-1; r++) for(s = 0; s < sectors; s++) {
        indicies.push( r * sectors + s );
        indicies.push( r * sectors + (s+1) );
        indicies.push( (r+1) * sectors + (s+1) );
        indicies.push( (r+1) * sectors + s );
        indicies.push( r * sectors + (s+1) );
        indicies.push( (r+1) * sectors + (s+1) );
    }

    indicies = indicies.filter(i => i < vertices.length);
	
	//HW470: Create colors for the core and outer parts
    // See HW specs for the number of colors needed

	vertices.forEach( vert => colors.push(vec3(vert[1], vert[2]/2, vert[1])) );
     
    let projectionMatrix = perspective(70, 1, 0.0001, 100);
    let viewMatrix = lookAt(vec3(0,0,0),vec3(0,0,1), vec3(0,1,0));
    
    //log
    console.log(vertices);
    console.log(indicies);

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

    // normal buffer
    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );
	
	// Associate shader variable for normals
	var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );
    
    // texture coordinate buffer
    const tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoords), gl.STATIC_DRAW);

	var vTextureCoord = gl.getAttribLocation( program, "vTextureCoord" );
    gl.vertexAttribPointer( vTextureCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTextureCoord );

    // uniforms 
    viewLocation = gl.getUniformLocation(program, "View");
    gl.uniformMatrix4fv(viewLocation, false, flatten(viewMatrix));

    var projectionLocation = gl.getUniformLocation(program, "Projection");
    gl.uniformMatrix4fv(projectionLocation, false, flatten(projectionMatrix));
    
    // vertex buffer: create, bind, load
    /*var vbuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vbuffer );
    {
        let fullVert = indicies.map(i => vertices[i%(vertices.length)]);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(fullVert), gl.STATIC_DRAW );
    }*/
    
    var vbuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vbuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate shader variables for x,y vertices	
    var positionLocation = gl.getAttribLocation( program, "vPosition" );

    var ibuffer = gl.createBuffer();
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, ibuffer );
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indicies), gl.STATIC_DRAW);
     
    
    timeLocation = gl.getUniformLocation(program, "time");
    rotationLocation = gl.getUniformLocation(program, "rotation");
    offsetLocation = gl.getUniformLocation(program, "offset");

    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    let size = 3;          // 3 components per iteration
    let type = gl.FLOAT;   // the data is 32bit floats
    let normalize = false; // don't normalize the data
    let stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    let offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        positionLocation, size, type, normalize, stride, offset);

    
    gl.enableVertexAttribArray( positionLocation );

	//HW470: associate shader explode variable ("Loc" variables defined here) 
     
    // Load Textures

    
    // Tell WebGL we want to affect texture unit 0
    gl.activeTexture(gl.TEXTURE0);
    // Image for texture
    let noise = loadTexture(gl, "./noise.png");

    // Bind the texture to texture unit 0
    //gl.bindTexture(gl.TEXTURE_2D, noise);

    // Tell the shader we bound the texture to texture unit 0
    let noiseSamplerLoc = gl.getUniformLocation(program, "noiseSampler");
    gl.uniform1i(noiseSamplerLoc, 0);

    // Second texture
    gl.activeTexture(gl.TEXTURE1);
    let ramp = loadTexture(gl, "./ramp.png");
    //gl.bindTexture(gl.TEXTURE_2D, ramp);
    let rampSamplerLoc = gl.getUniformLocation(program, "rampSampler");
    gl.uniform1i(rampSamplerLoc, 1);

    console.log("Data loaded to GPU -- Now call render");

    // enable depth buffer
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    
    // set custom clear color
    gl.clearColor(0.2, 0.2, 0.2, 1.0);

    render();
    //checkLoaded();
};

function checkLoaded () {
    if (!textureLoaded) {
        console.log("loading...");
        setTimeout(checkLoaded, 3000);
    }
    else {
        render();
    }
}

// =============== function render ======================
const speed = 0.07;
var currentTime = 0;
const rotSpeed = 0.05;
var rotation = 0;

function render()
{
    // clear the screen 
    gl.clear( gl.COLOR_BUFFER_BIT );
	
    //HW470: send uniform(s) to vertex shader
    if(!paused) currentTime += speed;//(new Date().getTime() - startTime)/400.0;
    gl.uniform1f(timeLocation, currentTime);

    rotation+=rotSpeed;
    gl.uniform1f(rotationLocation, rotation);

    gl.uniform3fv(offsetLocation, flatten(getOffset(currentTime)) );

    let viewMatrix = lookAt(vec3(0,0,-3 - Math.cos(currentTime)),vec3(0,0,1), vec3(0,1,0));
    gl.uniformMatrix4fv(viewLocation, false, flatten(viewMatrix));
    
	//HW470: draw the object
	// You will need to change this to create the exploding outer parts effect
	// Hint: you will need more than one draw function call
    //gl.drawArrays( gl.TRIANGLE_STRIP, 0, indicies.length );
	//gl.TRIANGLES
    gl.drawElements(gl.TRIANGLE_STRIP, indicies.length, gl.UNSIGNED_SHORT,0);
	
	//re-render after delay
	setTimeout(function (){requestAnimFrame(render);}, delay);
}

function getOffset (curTime) {
    let r = Math.sin((curTime) * (2 * Math.PI)) * 0.25 + 0.25;
    let g = Math.sin((curTime + 0.33333333) * 2 * Math.PI) * 0.25 + 0.25;
    let b = Math.sin((curTime  + 0.66666667) * 2 * Math.PI) * 0.25 + 0.25;
    let correction = 1 / (r + g + b);
    r *= correction;
    g *= correction;
    b *= correction; 
    return vec3(r,g,b);
}

// From the Mozilla webgl tutorials 
// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
//

var textureLoaded = false;

function loadTexture(gl, url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
  
    // Because images have to be download over the internet
    // they might take a moment until they are ready.
    // Until then put a single pixel in the texture so we can
    // use it immediately. When the image has finished downloading
    // we'll update the texture with the contents of the image.
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([255, 255, 255, 255]);  // white
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  width, height, border, srcFormat, srcType,
                  pixel);
  
    const image = new Image();
    image.onload = function() {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                    srcFormat, srcType, image);
  
      // WebGL1 has different requirements for power of 2 images
      // vs non power of 2 images so check if the image is a
      // power of 2 in both dimensions.
      if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
         // Yes, it's a power of 2. Generate mips.
         gl.generateMipmap(gl.TEXTURE_2D);
      } else {
         // No, it's not a power of 2. Turn off mips and set
         // wrapping to clamp to edge
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      }

      textureLoaded = true;
    };
    image.src = url;
  
    return texture;
  }
  
  function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
  }