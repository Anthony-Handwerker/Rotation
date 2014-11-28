

function clip_figure(vertices, edges, face_map, t)
{
	var ret = [[],[]];
	var app = [];
	//console.log(face_map);
	for(var i = 0; i < edges.length; i++)
	{
		var temp = interpolate(vertices[edges[i][0]], vertices[edges[i][1]], t, app);
		//console.log(temp);
		if(temp == [])
		{
			ret[0].push([]);
		}
		else
		{
			ret[0].push(temp.slice(0));
		}
	}
	for(var i = 0; i < edges.length; i++)
	{	
		//console.log(ret[0][i]);
		if(ret[0][i].length != 0)
		{
			for(var j = i + 1; j < edges.length; j++)
			{
				if(ret[0][j].length != 0)
				{
					if(face_map[i][j] == true)
					{
						//console.log([i,j]);
						ret[1].push([i,j]);
					}
				}
			}
		}
	}

	//console.log(app);
	var k = ret[0].length;
	for(var i = 0; i < app.length; i += 2)
	{
		ret[0].push(app[i]);
		ret[0].push(app[i + 1]);
		ret[1].push([k + i, k + i + 1]);
	}
	//console.log(ret);
	return ret;
}

function interpolate(point1, point2, t, app)
{
	//console.log(point1, point2);
	var z1 = point1[3];
	var z2 = point2[3];
	if((z1 == z2) && (z1 == t))
	{
		app.push(point1.slice(0));
		app.push(point2.slice(0));
		return [];
	}
	if((z1 == z2) || (z1 < z2 && (t < z1 || t > z2)) || (z1 > z2 && (t > z1 || t < z2))) return [];
	
	var ratio = (t - z1) / (z2 - z1);
	//console.log(t - z1, z2 - z1);
	var del_x = (point2[0] - point1[0]) * ratio;
	var del_y = (point2[1] - point1[1]) * ratio;
	var del_z = (point2[2] - point1[2]) * ratio;
	return [point1[0] + del_x, point1[1] + del_y, point1[2] + del_z, t];
}