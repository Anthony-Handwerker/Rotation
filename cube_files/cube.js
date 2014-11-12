
var canvas;
var gl;

var NumVertices  = 128;

var points = [];
var colors = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [ 0, 0, 0 ];
var theta2 = 0.0;

var thetaLoc;

var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;

var vertices = [
        vec4( -0.5, -0.5,  0.5, 0.3 ),
        vec4( -0.5,  0.5,  0.5, 0.3 ),
        vec4(  0.5,  0.5,  0.5, 0.3 ),
        vec4(  0.5, -0.5,  0.5, 0.3 ),
        vec4( -0.5, -0.5, -0.5, 0.3 ),
        vec4( -0.5,  0.5, -0.5, 0.3 ),
        vec4(  0.5,  0.5, -0.5, 0.3 ),
        vec4(  0.5, -0.5, -0.5, 0.3 ),
        vec4( -0.5, -0.5,  0.5, -0.3 ),
        vec4( -0.5,  0.5,  0.5, -0.3 ),
        vec4(  0.5,  0.5,  0.5, -0.3 ),
        vec4(  0.5, -0.5,  0.5, -0.3 ),
        vec4( -0.5, -0.5, -0.5, -0.3 ),
        vec4( -0.5,  0.5, -0.5, -0.3 ),
        vec4(  0.5,  0.5, -0.5, -0.3 ),
        vec4(  0.5, -0.5, -0.5, -0.3 )

    ];

var vertices2 = [];



window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    canvas.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    colorCube();

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
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
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



function handleMouseDown(event) {
    mouseDown = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
}

function handleMouseUp(event) {
    mouseDown = false;
}

function handleMouseMove(event) {
    if (!mouseDown) {
        return;
    }
    var newX = event.clientX;
    var newY = event.clientY;

    var deltaX = newX - lastMouseX;
    

    var deltaY = newY - lastMouseY;

    theta[0] += deltaY/5.0;
    theta[1] += deltaX/5.0;

    lastMouseX = newX
    lastMouseY = newY;
}

function colorCube()
{

    points=[];
    vertices2=[];
    for(var i = 0; i < vertices.length; i++)
    {

        var temp = vertices[i].slice();
        
        temp.push(1.0);
        console.log(temp);
        var temp2 = rotate_point4d([[0, 0, 0, 0, 1], [1, 0, 0, 0], [0, 0, 0, 1]], theta2, temp);

        var temp3 = temp2.pop();
        temp2[0] /= temp3;
        temp2[1] /= temp3;
        temp2[2] /= temp3;
        temp2[3] /= temp3;
        vertices2.push(temp2);
    }
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
    quad( 9, 8, 11, 10 );
    quad( 10, 11, 15, 14 );
    quad( 11, 8, 12, 15 );
    quad( 14, 13, 9, 10 );
    quad( 12, 13, 14, 15 );
    quad( 13, 12, 8, 9 );
    quad( 13, 12, 4, 5);
    quad( 8, 9, 1, 0);
    quad( 11, 10, 2, 3);
    quad( 15, 14, 6, 7);
}

function quad(a, b, c, d) 
{
    

    
    var indices = [ a, b, b, c, c, d, d, a ];

    for ( var i = 0; i < indices.length; ++i ) {
        var temp = vertices2[indices[i]];
        //var mult = (temp[3] + 1.0);

        var mult = Math.pow(3.0,temp[3]);

        var temp2 = vec3(mult * temp[0] * 0.7, mult * temp[1] * 0.7, mult * temp[2] * 0.7);
        points.push( temp2 );
        colors.push( vec4(mult*0.5, (1 - mult*0.5), 0.0, 1.0) );
    
        // for solid colored faces use 
        //colors.push(vertexColors[a]);
        
    }
}

function render()
{
    colorCube();

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //theta[axis] += 2.0;
    gl.uniform3fv(thetaLoc, theta);

    gl.drawArrays( gl.LINES, 0, NumVertices );

    theta2 += 0.5;

    requestAnimFrame( render );
}

