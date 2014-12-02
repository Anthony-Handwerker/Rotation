
var canvas;
var gl;

var NumVertices  = 0;
var program;

var points = [];
var colors = [];


var rot_plane = [[0,0,0,0,1],[1,0,0,0],[0,1,0,0]];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var rot_speed = 1.0;
var theta = [ 0, 0, 0 ];
var theta2 = 0.0;

var clip_value = 0.0;

var thetaLoc;

var is_rotating = false;

var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;

var vertices = [];
var edges = [];
var vertices2 = [];
var vertices_default = [];
var face_map = []; // EdgexEdge matrix, true if two edges share a face.

var clip_flag = false;

var clip_vertices = [];
var clip_edges = [];



window.onload = function init()
{

    canvas = document.getElementById( "gl-canvas" );

    canvas.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    drawFigure();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
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
    
    // turn rotation on or off
    document.getElementById( "Toggle_Rotate" ).onclick = function () {
        is_rotating = !is_rotating;
    };

    // turn clipping on or off
    document.getElementById( "Clip" ).onclick = function()
    {
        clip_flag = !clip_flag;
        if(clip_flag) event.srcElement.innerHTML = "Project Model";
        else event.srcElement.innerHTML = "Clip Model";
    }

    // Change the plane of rotation
    document.getElementById( "New_Rotate" ).onclick = function () {
        vertices = vertices2.slice(0);
        theta2 = 0;
        rot_plane = [[0,0,0,0,1],
                    [parseFloat(document.getElementById("x1").value),
                    parseFloat(document.getElementById("y1").value),
                    parseFloat(document.getElementById("z1").value),
                    parseFloat(document.getElementById("t1").value)],
                    [parseFloat(document.getElementById("x2").value),
                    parseFloat(document.getElementById("y2").value),
                    parseFloat(document.getElementById("z2").value),
                    parseFloat(document.getElementById("t2").value)]];
    };

    // Reset back to the initial rotation and camera view.
    document.getElementById("Reset").onclick = function() {
        vertices = vertices_default.slice(0);
        theta2 = 0;
        theta = [0,0,0];
    };
    
    document.getElementById("Preset_1").onclick = function() {
        vertices = vertices2.slice(0);
        theta2 = 0;
        rot_plane = [[0, 0, 0, 0, 1], [1, 0, 0, 1], [0, 1, 1, 0]];
        document.getElementById("x1").value = 1.0;
        document.getElementById("y1").value = 1.0;
        document.getElementById("z1").value = 0.0;
        document.getElementById("t1").value = 0.0;
        document.getElementById("x2").value = 0.0;
        document.getElementById("y2").value = 1.0;
        document.getElementById("z2").value = 1.0;
        document.getElementById("t2").value = 0.0;
    }
    document.getElementById("Preset_2").onclick = function() {
        vertices = vertices2.slice(0);
        theta2 = 0;
        rot_plane = [[0, 0, 0, 0, 1], [1, 0, 0, 0], [0, 0, 0, 1]];
        document.getElementById("x1").value = 1.0;
        document.getElementById("y1").value = 0.0;
        document.getElementById("z1").value = 0.0;
        document.getElementById("t1").value = 0.0;
        document.getElementById("x2").value = 0.0;
        document.getElementById("y2").value = 0.0;
        document.getElementById("z2").value = 0.0;
        document.getElementById("t2").value = 1.0;
    }
    document.getElementById("Preset_3").onclick = function() {
        vertices = vertices2.slice(0);
        theta2 = 0;
        rot_plane = [[0, 0, 0, 0, 1], [1, 0, 0, 0], [0, 1, 0, 0]];
        document.getElementById("x1").value = 1.0;
        document.getElementById("y1").value = 0.0;
        document.getElementById("z1").value = 0.0;
        document.getElementById("t1").value = 0.0;
        document.getElementById("x2").value = 0.0;
        document.getElementById("y2").value = 1.0;
        document.getElementById("z2").value = 0.0;
        document.getElementById("t2").value = 0.0;
    }


    // Load new model.
    var fileInput = document.getElementById("model");
    fileInput.addEventListener('change', function(e)
    {
        var file = fileInput.files[0];

        var reader = new FileReader();

        reader.onload = function(e) 
        {
            var input = reader.result;
            var vals = input.split("\n");
            vertices = [];
            vertices2 = [];
            vertices_default = [];
            edges = [];
            NumVertices = 0;
            var flag = 0;
            for(var i = 0; i < vals.length; i++)
            {
                if(vals[i].trim() == "VERTICES")
                {
                    flag = 0;
                }
                else if(vals[i].trim() == "EDGES")
                {
                    flag = 1;
                }
                else if(vals[i].trim() == "FACES")
                {
                    flag = 2;
                    face_map = [];
                    var temp = [];
                    for(var j = 0; j < edges.length; j++) // creates a list of n falses, where n is the number of edges
                    {
                        temp.push(false);
                    }
                    for(var j = 0; j < edges.length; j++) 
                    {
                        face_map.push(temp.slice(0));
                    }
                }
                else if(flag == 1)
                {
                    var line = vals[i].split(" ");
                    var newEdge = [parseInt(line[0]), parseInt(line[1])]; //adds an edge to the edge list.
                    edges.push(newEdge);
                    //console.log(newEdge);
                    NumVertices += 2;
                }
                else if(flag == 0)
                {
                    var line = vals[i].split(" ");
                    var newVertex = [parseFloat(line[0]), parseFloat(line[1]), parseFloat(line[2]), parseFloat(line[3])];
                    vertices.push(newVertex);
                    vertices2.push(newVertex.slice(0));
                    vertices_default.push(newVertex.slice(0)); // add a vertex to the vertex list.
                }
                else if(flag == 2)
                {
                    var line = vals[i].split(" ");
                    for(var j = 0; j < line.length; j++)
                    {
                        for(var k = j + 1; k < line.length; k++)
                        {
                            var a = parseInt(line[j]); 
                            var b = parseInt(line[k]);
                            face_map[a][b] = true;
                            face_map[b][a] = true; // adds the edge combo to the face_map
                        }
                    }
                }
            }
            theta = [0,0,0];
            theta2 = 0.0;
            is_rotating = false;
        }

        reader.readAsText(file);
    });

    // changes speed.
    document.getElementById("speed").onchange = function() {
        rot_speed = parseFloat(event.srcElement.value);
        //console.log(rot_speed);
    };

    // changes clipping t-value.
    document.getElementById("clip_val").onchange = function() {
        clip_value = parseFloat(event.srcElement.value);
        //console.log(rot_speed);
    };
    
    render();
}

// setup for camera panning.
function handleMouseDown(event) {
    mouseDown = true; // initiates camera rotation
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
}

function handleMouseUp(event) {
    mouseDown = false; //stops camera rotation
}

function handleMouseMove(event) {
    if (!mouseDown) {
        return;
    }
    var newX = event.clientX;
    var newY = event.clientY;

    var deltaX = newX - lastMouseX;
    var deltaY = newY - lastMouseY;

    // changes the camera rotation.
    theta[0] += deltaY/5.0;
    theta[1] += deltaX/5.0;

    lastMouseX = newX
    lastMouseY = newY;
}

function drawFigure()
{

    points=[];
    vertices2=[];
    colors = [];
    if (clip_flag) // if we are drawing a 3D cross-section of the figure.
    {

        for(var i = 0; i < vertices.length; i++) // loop through the vertices and rotate them all
        {
            var temp = vertices[i].slice();
            
            temp.push(1.0);

            var temp2 = rotate_point4d(rot_plane, theta2, temp); // rotate the vertex
            var temp3 = temp2.pop();
            temp2[0] /= temp3;
            temp2[1] /= temp3;
            temp2[2] /= temp3;
            temp2[3] /= temp3;
            vertices2.push(temp2);
        }
        var temp = clip_figure(vertices2, edges, face_map, clip_value); // clip the figure

        clip_vertices = temp[0].slice(0);
        clip_edges = temp[1].slice(0);
        for(var i = 0; i < clip_edges.length; i++)
        {
            clip_line(clip_edges[i][0], clip_edges[i][1]); // add a clipped line to the draw buffer
        }
        NumVertices = clip_edges.length * 2; // change the NumVertices for drawing.
    }
    else // if we're drawing projection view.
    {
        for(var i = 0; i < vertices.length; i++) // loop through and rotate the vertices.
        {

            var temp = vertices[i].slice();
            
            temp.push(1.0);

            var temp2 = rotate_point4d(rot_plane, theta2, temp); // rotate each point
            var temp3 = temp2.pop();
            temp2[0] /= temp3;
            temp2[1] /= temp3;
            temp2[2] /= temp3;
            temp2[3] /= temp3;
            vertices2.push(temp2);
        }
        for(var i = 0; i < edges.length; i++) // add each point to the draw buffer
        {
            line(edges[i][0], edges[i][1]);
        }
        NumVertices = edges.length * 2; // update the number of vertices to be drawn.
    }
}

function line(a, b) // add a line to the draw buffer.
{
    var indices = [a, b];

    for ( var i = 0; i < indices.length; ++i ) {
        var temp = vertices2[indices[i]];

        var mult = Math.pow(3.0,temp[3]); // scale based on the t-value

        var temp2 = vec3(mult * temp[0] * 0.6, mult * temp[1] * 0.6, mult * temp[2] * 0.6);
        points.push( temp2 );
        colors.push( vec4(mult*0.5, (1 - mult*0.5), 0.0, 1.0) );
    }
}

function clip_line(a, b) // add a line to the draw buffer, without t-scaling or coloring.
{
    var indices = [a,b]
    for ( var i = 0; i < indices.length; ++i ) {
        var temp = clip_vertices[indices[i]];

        var temp2 = vec3(temp[0], temp[1], temp[2]);
        points.push( temp2 );
        colors.push( vec4(0.0, 0.0, 0.0, 1.0) );       
    }
}

function updateDebug() // update the debg info.
{
    document.getElementById("debug_info").innerHTML = "Angle: " + theta2 +
    "<br>Rotation Speed: " + rot_speed + 
    "<br>Vector 1: " + rot_plane[1] +
    "<br>Vector 2: " + rot_plane[2] +
    "<br>Clipping: " + clip_flag +
    "<br>Clipping T-Value:" + clip_value;
}

function render()
{
    drawFigure(); // redraw the figure

    
    //set all drawing buffers
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    if (is_rotating) theta2 += rot_speed; // rotate the figure.
    theta2 %= 360.0;
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniform3fv(thetaLoc, theta);

    gl.drawArrays( gl.LINES, 0, NumVertices );

    requestAnimFrame( render );

    updateDebug(); // update the debug information
}

