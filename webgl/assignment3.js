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
    document.getElementById("abc").innerHTML = '';
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    NumVertices = 0;
    sphere(0.3, 0.65, 0.0, 0.0);
    cone(0.3, 0.4, -0.65, 0.0, 0.0);
    cylinder(0.3, 0.4, 0.0, 0.0, 0.0);

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

function drawLines(indices) {
    indices.forEach(function(v) {
        points.push( v );
        colors.push( [ 0.0, 0.0, 0.0, 1.0 ] );  // black
    });

    NumVertices += indices.length;
}

function drawLineStrip(lines) {
    var indices = [lines[0]];
    for (var j = 1; j < lines.length; ++j) {
        indices.push(lines[j]);
        indices.push(lines[j]);
    }
    indices.push(lines[0]);
    
    drawLines(indices);
}

function sphere(r, x0, y0, z0) {
    // parametric equations for sphere
    // x = rho * sin(phi) * cos(theta)
    // y = rho * sin(phi) * sin(theta)
    // z = rho * cos(phi)
    var theta;
    var phi;
    for (theta = 0.0; theta <= FULL_CIRCLE / 2.0; theta += 0.05 * FULL_CIRCLE) {
        var lines = [];
        for (phi = 0.0; phi <= FULL_CIRCLE; phi += 0.025 * FULL_CIRCLE) {
            var x = r * Math.sin(phi) * Math.cos(theta);
            var y = r * Math.sin(phi) * Math.sin(theta);
            var z = r * Math.cos(phi);
            
            // rotation should go here
            
            // translation
            x = x + x0;
            y = y + y0;
            z = z + z0;
            
            lines.push(vec4(x, y, z, 1.0));
        }
        drawLineStrip(lines);
    }
    
    for (phi = 0.0; phi <= FULL_CIRCLE; phi += 0.05 * FULL_CIRCLE) {
        var lines = [];
        for (theta = 0.0; theta <= FULL_CIRCLE / 2.0; theta += 0.025 * FULL_CIRCLE) {
            var x = r * Math.sin(phi) * Math.cos(theta);
            var y = r * Math.sin(phi) * Math.sin(theta);
            var z = r * Math.cos(phi);
            
            // rotation should go here
            
            // translation
            x = x + x0;
            y = y + y0;
            z = z + z0;
            
            lines.push(vec4(x, y, z, 1.0));
        }
        drawLineStrip(lines);
    }
}

function cone(r, h, x0, y0, z0) {
    var theta;
    
    var lines = [];
    var lines2 = [];
    var lines3 = [];
    var upper_point = vec4(x0, y0, z0 + h / 2.0, 1.0);
    for (theta = 0; theta <= FULL_CIRCLE; theta += FULL_CIRCLE * 0.05) {
        var x = r * Math.cos(theta);
        var y = r * Math.sin(theta);
        var z = -h / 2.0;
            
            // rotation should go here
            
            // translation
            x = x + x0;
            y = y + y0;
            z = z + z0;
        
        lines.push(vec4(x, y, z, 1.0));
        
        lines3.push(vec4(x, y, z, 1.0));
        lines3.push(vec4(x0, y0, z, 1.0));
        
        lines2.push(vec4(x, y, z, 1.0));
        lines2.push(upper_point);
    }
    drawLineStrip(lines);
    drawLineStrip(lines2);
    drawLineStrip(lines3);
}

function cylinder(r, h, x0, y0, z0) {
    var theta;
    
    var top_outer = [];
    var top_base = [];
    var bottom_outer = [];
    var bottom_base = [];
    var joining = [];

    for (theta = 0; theta <= FULL_CIRCLE; theta += FULL_CIRCLE * 0.05) {
        var x = r * Math.cos(theta);
        var y = r * Math.sin(theta);
        var zlo = -h / 2.0;
        var zhi =  h / 2.0;
            
            // rotation should go here
            
            // translation
            x = x + x0;
            y = y + y0;
            zlo = zlo + z0;
            zhi = zhi + z0;
        
        top_outer.push(vec4(x, y, zhi, 1.0));
        
        top_base.push(vec4(x, y, zhi, 1.0));
        top_base.push(vec4(0.0, 0.0, zhi, 1.0));

        bottom_outer.push(vec4(x, y, zlo, 1.0));
        
        bottom_base.push(vec4(x, y, zlo, 1.0));
        bottom_base.push(vec4(0.0, 0.0, zlo, 1.0));
        
        joining.push(vec4(x, y, zlo, 1.0));
        joining.push(vec4(x, y, zhi, 1.0));
    }
    drawLineStrip(top_outer);
    drawLineStrip(top_base);
    drawLineStrip(bottom_outer);
    drawLineStrip(bottom_base);
    drawLines(joining);
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

function testShape() {
    var lines = [
        vec4(0.0, 0.0, 0.0, 1.0),
        vec4(1.0, 0.0, 0.0, 1.0),
        vec4(0.0, 1.0, 1.0, 1.0)];
    drawLineStrip(lines);
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    theta[axis] += 2.0;
    gl.uniform3fv(thetaLoc, theta);

    gl.drawArrays( gl.LINES, 0, NumVertices );

    requestAnimFrame( render );
}
