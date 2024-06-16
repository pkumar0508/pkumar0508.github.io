"use strict";

var canvas;
var gl;

var points = [];

var NumTimesToSubdivide = 8;
var FULL_CIRCLE = 2 * Math.PI;
var Theta = FULL_CIRCLE * 17.0 / 360.0;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.
    var r = 0.6;
    var x = r * Math.cos(FULL_CIRCLE / 12);
    var y = r * Math.sin(FULL_CIRCLE / 12);
    var vertices = [
        vec2( -x, -y ),
        vec2(  0,  r ),
        vec2(  x, -y )
    ];

    divideTriangle( vertices[0], vertices[1], vertices[2],
                    NumTimesToSubdivide);

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    document.getElementById("subdivisions").onchange = function(event) {
        NumTimesToSubdivide = parseInt(event.target.value);
        window.onload();
    };
    document.getElementById("angle").onchange = function(event) {
        Theta = parseInt(event.target.value) * FULL_CIRCLE / 360.0;
        window.onload();
    };

    render();
};

function rotate_point(p) {
    var x = p[0];
    var y = p[1];
    var d = 6.0 * Math.sqrt(x * x + y * y);
    var cos_theta = Math.cos(d * Theta);
    var sin_theta = Math.sin(d * Theta);
    return vec2(x * cos_theta - y * sin_theta,
                x * sin_theta + y * cos_theta);
}

function triangle( a, b, c )
{
    points.push( rotate_point(a),
                 rotate_point(b),
                 rotate_point(c) );
}

function divideTriangle( a, b, c, count )
{

    // check for end of recursion

    if ( count === 0 ) {
        triangle( a, b, c );
    }
    else {

        //bisect the sides

        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

        --count;

        // three new triangles

        divideTriangle( a, ab, ac, count );
        divideTriangle( c, ac, bc, count );
        divideTriangle( b, bc, ab, count );
        divideTriangle( ab, ac, bc, count );
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
    points = [];
}
