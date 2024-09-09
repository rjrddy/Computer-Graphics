/**
 * @author Raj Reddy and Prof. Cem Yuksel
 * @version 9/9/24
 * Project 2 for Computer Graphics (CS 4600)
 */

/**
 * Generates a 3x3 transformation matrix for 2D transformations.
 * The transformation first applies scale, then rotation, and finally translation.
 *
 * @param {number} positionX - The x-coordinate of the translation.
 * @param {number} positionY - The y-coordinate of the translation.
 * @param {number} rotation - The rotation angle in degrees.
 * @param {number} scale - The uniform scale factor applied to both x and y coordinates.
 * @returns {number[]} A 3x3 transformation matrix as an array of 9 values in column-major order.
 */
function GetTransform(positionX, positionY, rotation, scale) {  
	
	// Convert rotation degrees into radians
	const theta = rotation * (Math.PI / 180);
	
	// Create the Scaling matrix
	const scaleMatrix = [
		scale, 0, 0,
		0, scale, 0,
		0, 0, 1
	];

	// Create the Rotation matrix
	const rotationMatrix = [
		Math.cos(theta), Math.sin(theta), 0,
		-Math.sin(theta), Math.cos(theta), 0,
		0, 0, 1
	];

	// Create the Translation matrix
	const translationMatrix = [
		1, 0, 0,
		0, 1, 0,
		positionX, positionY, 1
	];

	// First scale, then rotate, and finally translate
	const scaleAndRotate = ApplyTransform(scaleMatrix, rotationMatrix);
	const combined = ApplyTransform(scaleAndRotate, translationMatrix);

	return combined;
}


/**
 * Combines two 3x3 transformation matrices into a single transformation matrix.
 * The returned transformation first applies `trans1` and then `trans2`.
 *
 * @param {number[]} trans1 - The first transformation matrix as an array of 9 values in column-major order.
 * @param {number[]} trans2 - The second transformation matrix as an array of 9 values in column-major order.
 * @returns {number[]} A new 3x3 transformation matrix as an array of 9 values in column-major order,
 *                     representing the combined transformation.
 */
function ApplyTransform(trans1, trans2) { 

	const result = [
		
		// first column
		trans1[0] * trans2[0] + trans1[1] * trans2[3] + trans1[2] * trans2[6],
		trans1[0] * trans2[1] + trans1[1] * trans2[4] + trans1[2] * trans2[7],
		trans1[0] * trans2[2] + trans1[1] * trans2[5] + trans1[2] * trans2[8],
		
		// second column
		trans1[3] * trans2[0] + trans1[4] * trans2[3] + trans1[5] * trans2[6],  
		trans1[3] * trans2[1] + trans1[4] * trans2[4] + trans1[5] * trans2[7],  
		trans1[3] * trans2[2] + trans1[4] * trans2[5] + trans1[5] * trans2[8],  

		// third column
		trans1[6] * trans2[0] + trans1[7] * trans2[3] + trans1[8] * trans2[6],
		trans1[6] * trans2[1] + trans1[7] * trans2[4] + trans1[8] * trans2[7],
		trans1[6] * trans2[2] + trans1[7] * trans2[5] + trans1[8] * trans2[8]
	];

	return result;
}


