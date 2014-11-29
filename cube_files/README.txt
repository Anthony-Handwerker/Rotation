Rotate4: a demonstration of 4-Dimensional rotation.

-----------------------------------------------------
Running the program: 

Open rotate4.html in any HTML5 compatible browser (Preferrably Google Chrome.)
-----------------------------------------------------
Quick Start:

Upon loading the program, you will see a button that says "Choose File" at the top of the program.
Click it, then choose any file with the .4d extension. The program comes with 4: Hypercube.4d, Cube.4d, Minimal.4d,
and TetrahedralHyperprism.4d.
Then, click the "Toggle Rotate" button and the program will begin rotating the object in four dimensions.
You can click and drag the viewing space in order to rotate the camera.
-----------------------------------------------------
Complete Guide:

Here, we will detail each object in the window, from top to bottom.

Choose File: Load a new model.

Viewing Window: Where the object is displayed. You may click and drag to rotate the camera (in 3 Dimensions).

Debug Information: To the right of the Viewing Window; displays basic information about the current display/rotation.

Rotate Toggle: Turn rotation on or off.

Speed Bar: Change the rotation speed.

Plane: A 4-D rotation is about a plane instead of an axis; here, you can enter the two vectors that make up your plane of
rotation. 

Change Plane: Confirm and enact the plane change from the Plane text boxes.

Reset Rotation: Set all rotation values back to default (angles to zero.)

Clip Model/Project Model: Change viewing method. When in project mode, the t-value changes the color and scaling of
the points. When in clipping mode, you are only shown whatever part of the object exists at the t-value set by the
"Clip T-value" bar.

Clip T-value bar: Change the t-value used for clipping.
-----------------------------------------------------
.4d format:

A .4d file is a plain text file with a specific format.

Specification:

A line with the word "VERTICES" followed by any number of lines; each line containing the coordinates of a vertex, each value
seperated by spaces;
A line with the word "EDGES" follow by any number of lines; each line containging the vertices that make up an edge: use the indicies
of the vertices (first vertex is 0, second is 1, etc.)
A line with the word "FACES" follow by any number of lines; each line containging the edges that make up an face: use the indicies
of the edges (first edge is 0, second is 1, etc.)