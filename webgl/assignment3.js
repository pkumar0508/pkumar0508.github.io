"use strict";

var canvas;
var gl;

var FULL_CIRCLE = 2 * Math.PI;

var NumVertices;

var points = [];
var colors = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [ 0, 0, 0 ];

var thetaLoc;

window.onload = function init()
{
    document.getElementById("abc").innerHTML = 'Version 2.2';
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    NumVertices = 0;
    cube(0.5, 0.5, 0.5);
    sphere(0.4);

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );


    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    thetaLoc = gl.getUniformLocation(program, "theta");

    //event listeners for buttons

    document.getElementById( "xButton" ).onclick = function () {
        axis = xAxis;
    };
    document.getElementById( "yButton" ).onclick = function () {
        axis = yAxis;
    };
    document.getElementById( "zButton" ).onclick = function () {
        axis = zAxis;
    };

    render();
}

function drawLineStrip(lines) {
    var indices = [lines[0]];
    for (var j = 1; j < lines.length; ++j) {
        indices.push(lines[j]);
        indices.push(lines[j]);
    }
    indices.push(lines[0]);
    
    indices.forEach(function(v) {
        points.push( v );
        colors.push( [ 0.0, 0.0, 0.0, 1.0 ] );  // black
    });

    NumVertices += indices.length;
}

function sphere(r) {
    // parametric equations for sphere
    // x = rho * sin(phi) * cos(theta)
    // y = rho * sin(phi) * sin(theta)
    // z = rho * cos(phi)
    var theta = 0;
    lines = [];
    for (var phi = 0; phi <= FULL_CIRCLE; phi += 0.05 * FULL_CIRCLE) {
        lines.push(vec4(
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.sin(phi) * Math.sin(theta),
            r * Math.cos(phi),
            1.0
        ));
    }
    drawLineStrip(lines);
}

function cube(x, y, z)
{
    var vertices = [
        vec4( -x, -y,  z, 1.0 ),
        vec4( -x,  y,  z, 1.0 ),
        vec4(  x,  y,  z, 1.0 ),
        vec4(  x, -y,  z, 1.0 ),
        vec4( -x, -y, -z, 1.0 ),
        vec4( -x,  y, -z, 1.0 ),
        vec4(  x,  y, -z, 1.0 ),
        vec4(  x, -y, -z, 1.0 )
    ];

    var cubePoints = [[0,1,2,3], [4,5,6,7], [0, 1, 5, 4]];
    cubePoints.forEach(function(x) {
        var lines = x.map(function(i) { return vertices[i]; });
        drawLineStrip(lines);
    });
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    theta[axis] += 2.0;
    gl.uniform3fv(thetaLoc, theta);

    gl.drawArrays( gl.LINES, 0, NumVertices );

    requestAnimFrame( render );
}
