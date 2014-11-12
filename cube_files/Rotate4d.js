

// axis of assumed format (translation, basis_1, basis_2, etc.)
// TODO: Make a better one with matrices and stuff
function rotate_point4d(axis, angle, point) {
	var mat = rotate4d(axis, angle);
	var tmp = transpose([point]);
	tmp = nd_mult(mat, tmp);
	tmp = transpose(tmp)[0];
	return tmp;
}
function rotate4d(axis, angle) {
	s = normal_space(axis.slice(1));
	intersection = [1, 0, 0, 1];
	space = s[0];
	
	// console.log("space");
	// log_matrix(space);
	
	for (var i = 0; i < space.length; i++) {
		space[i].push(0);
	}
	var tmp = [];
	for (var i = 0; i < space[0].length - 1; i++) {
		tmp.push(0);
	}
	tmp.push(1);
	space.push(tmp);
	
	// console.log("space");
	// log_matrix(space);
	translation = transpose([axis[0]]);
	
	// console.log("translation");
	// log_matrix(translation);
	
	var trans_mat = nd_translate(translation);
	
	// console.log("trans_mat");
	// log_matrix(trans_mat);


	var res_mat = scal_mult(trans_mat, -1);
	
	// console.log("res_mat");
	// log_matrix(res_mat);
	
	res_mat = nd_mult(space, res_mat);
	// console.log("res_mat_2");
	// log_matrix(res_mat);
	
	// console.log("space");
	// log_matrix(space);
		
	// console.log("intersection");
	// console.log(intersection);
	
	// console.log("3d rotation");
	// log_matrix(rotate(angle, intersection));
	
	res_mat = nd_mult(rotate(angle, intersection), res_mat);
	// console.log("res_mat_3");
	// log_matrix(res_mat);

	
	res_mat = nd_mult(transpose(space), res_mat);
	// console.log("res_mat_4");
	// log_matrix(res_mat);
	
	res_mat = nd_mult(res_mat, trans_mat);
	// console.log("res_mat_5");
	// log_matrix(res_mat);
	// console.log("end");
	return res_mat;
}

// space has form [translation, basis]
// Uses dot from MV.js

function matn(n) {
	var res_mat = [];
	for (var i = 0; i < n; i++) {
		res_mat.push([]);
		for (var j = 0; j < n; j++) {
			res_mat[i].push(0);
		}
	}
	for (var i = 0; i < n; i++) {
		res_mat[i][i] = 1;
	}
	return res_mat;
}

function nd_mult(u, v) {
	var result = [];
	for (var i = 0; i < u.length; i++) {
		result.push( [] );
		for (var j = 0; j < v[0].length; j++) {
			result[i].push(0);
		}
	}
	for ( var i = 0; i < v[0].length; ++i ) {	    
	    for ( var j = 0; j < u.length; ++j ) {
	        var sum = 0.0;
	        for ( var k = 0; k < u[0].length; ++k ) {
	            sum += u[j][k] * v[k][i];
	        }
	        result[j][i] = sum;
	    }
	}
	if (result.length == 1 && result[0].length == 1) {
		result = result[0][0];
	}
	return result;
}

function scal_mult(mat, val) {
	var res_mat = [];
	if (!Array.isArray(mat[0])) {
		for (var i = 0; i < mat.length; i++) {
			res_mat.push(mat[i] * val);
		}
		return res_mat;
	}
	else if (mat[0].length == 1) {
		for (var i = 0; i < mat.length; i++) {
			res_mat.push([mat[i][0]]);
		}
	}
	else {
		for (var i = 0; i < mat.length; i++) {
			res_mat.push([]);
			for (var j =  0; j < mat[i].length; j++) {
				res_mat[i].push(mat[i][j] * val);
			}
		}
	}
	return res_mat;
}
// from translate
function nd_translate(translation) {
	var n = translation.length;
	var res_mat = matn(n);
	for (var i = 0; i < n - 1; i++) {
		res_mat[i][n - 1] = translation[i][0];
	}
	return res_mat;
}

// TODO: use less probabilistic method
function normal_space(basis, x, y) {
	// two random vectors hopefully linearly independent of the basis.
	var y = basis[0].length;
	var new_vec1 = [];
	for (var i = 0; i < y; i++) {
		new_vec1.push(Math.random());
	}
	
	var new_vec2 = [];
	for (var i = 0; i < y; i++) {
		new_vec2.push(Math.random());
	}
	
	var result_space = [];
	for (var i = basis.length - 1; i >= 0; i--) {
		result_space.push(basis[i].slice(0))
	}

	result_space.push(new_vec1);
	result_space.push(new_vec2);
	// console.log("result_space");
	// log_matrix(result_space);
	
	result_space = gram_shmidt(result_space);
	
	// console.log("gram_shmidt");
	// log_matrix(result_space);
	
	var intersection = result_space[1];
	result_space.splice(0, 1);
			
	return [result_space, intersection];
}


function gram_shmidt(basis) {
	var empty = [];
	for (var i = basis[0].length - 1; i >= 0; i--) {
		empty.push(0);
	}
	var res = [];
	res.push(basis[0])
	for (var i = 1; i < basis.length; i++) {
		var sum = empty.slice(0);
		for (var j = 0; j < i; j++) {
			// proj u_j, v_k
			var tmp = nd_mult([res[j]],transpose([basis[i]])) / nd_mult([res[j]],transpose([res[j]]));
			sum = add(sum, scal_mult(res[j], tmp));
		}
		res.push(add(basis[i], scal_mult(sum, -1)))
	}
	for (var i = res.length - 1; i >= 0; i--) {
		res[i] = scal_mult(res[i], 1/magnitude([res[i]]));
	}
	return res;
}

function magnitude(v) {
	var res = 0.0;
	if (v[0].length == 1) {
		for (var i = v.length - 1; i >= 0; i--) {
			res += v[i][0] * v[i][0];
		}
		res = Math.sqrt(res);
	}
	else {
		for (var i = v[0].length - 1; i >= 0; i--) {
			res += v[0][i] * v[0][i];
		};
		res = Math.sqrt(res);
	}
	return res;
}

function transpose(v) { // Column vector to row vector.
	var rows = v.length;
	var columns = v[0].length;
	
	var res = [];
	for (var i = 0; i < columns; i++) {
		res.push([]);
		for (var j = 0; j < rows; j++) {
			res[i].push(v[j][i]);
		}
	}
	return res;
}

function nd_normalize(basis) { // for row vectors
	for (var i = basis.length - 1; i >= 0; i--) {
		basis[i] = scal_mult(basis[i], 1.0/magnitude([basis[i]]));
	}
	return basis;
}

function log_matrix (v) {
	var rows = v.length;
	var columns = v[0].length;
	for (var i = 0; i < rows; i++) {
		console.log(v[i]);
	}
}

function test_everything() {
	maxis = [[0, 0, 0, 0, 1], [1, 0, 0, 0], [0, 0, 0, 1]];
	mangle = 0;
	mpoint = [-0.5, -0.5, 0.5, 0.3, 1];
	mpoint = transpose(mpoint);
	
	console.log("axis: ");
	log_matrix(maxis);
	
	console.log("angle: ");
	console.log(mangle);
	
	console.log("point: ");
	log_matrix(mpoint);
	
	console.log("transpose axis: ");
	log_matrix(transpose(maxis));
	
	console.log("rotation: ");
	log_matrix(rotate4d(maxis, mangle));
	
	console.log("point change");
	console.log(rotate_point4d(maxis, mangle, mpoint));
	
	return maxis;
}