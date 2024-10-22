// This function takes the projection matrix, the translation, and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// The given projection matrix is also a 4x4 matrix stored as an array in column-major order.
// You can use the MatrixMult function defined in project4.html to multiply two 4x4 matrices in the same format.
function GetModelViewProjection(projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY) {
	// create rotation matrix around the X axis
	var cosX = Math.cos(rotationX);
	var sinX = Math.sin(rotationX);
	var rotationXMatrix = [
		1,    0,     0, 0,
		0, cosX, -sinX, 0,
		0, sinX,  cosX, 0,
		0,    0,     0, 1
	];

	// create rotation matrix around the Y axis
	var cosY = Math.cos(rotationY);
	var sinY = Math.sin(rotationY);
	var rotationYMatrix = [
		cosY, 0, sinY, 0,
		   0, 1,    0, 0,
	   -sinY, 0, cosY, 0,
		   0, 0,    0, 1
	];

	// combine rotation matrices
	var rotationMatrix = MatrixMult(rotationYMatrix, rotationXMatrix);

	// create translation matrix
	var translationMatrix = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];

	// combine the translation and rotation matrices to form the model matrix
	var modelMatrix = MatrixMult(translationMatrix, rotationMatrix);

	// multiply the projection matrix with the model matrix to get the final MVP matrix
	var mvpMatrix = MatrixMult(projectionMatrix, modelMatrix);

	return mvpMatrix;
}



// [TO-DO] Complete the implementation of the following class.

class MeshDrawer {
	// The constructor is a good place for taking care of the necessary initializations.
	constructor() {
		// create and compile the shader
		this.prog = InitShaderProgram(this.vertex_shader, this.fragment_shader);
		gl.useProgram(this.prog);

		// set uniform locations
		this.mvp = gl.getUniformLocation(this.prog, 'mvp');
		this.flipAxis = gl.getUniformLocation(this.prog, 'flipAxis');
		this.useTexture = gl.getUniformLocation(this.prog, 'useTexture');

		// initialize uniforms
		const isFlipChecked = document.getElementById('swap-yz').checked ? 1 : 0;
		const isTextureChecked = document.getElementById('show-texture').checked ? 1 : 0;
		gl.uniform1i(this.flipAxis, isFlipChecked);
		gl.uniform1i(this.useTexture, isTextureChecked);

		// set attribute locations and create buffers
		this.vertex = gl.getAttribLocation(this.prog, 'vertex'); // Keep 'vertex' unchanged
		this.vertexBuffer = gl.createBuffer();

		this.texCoord = gl.getAttribLocation(this.prog, 'texCoord');
		this.texCoordBuffer = gl.createBuffer();
	}

	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions
	// and an array of 2D texture coordinates.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex.
	// Note that this method can be called multiple times.
	setMesh(vertPos, texCoords) {
		gl.useProgram(this.prog);

		// calculate vertices
		const numVertices = vertPos.length / 3;

		// find required texture coordinate length
		const requiredTexCoordLength = numVertices * 2;

		// validate texture coordinates
		if (!texCoords || texCoords.length !== requiredTexCoordLength) {
			console.warn('Texture coordinates length mismatch. Texture mapping may not work correctly.');
			texCoords = new Array(requiredTexCoordLength).fill(0);
		}

		// bind the vertex positions to buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

		// bind the texture coordinates to  buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

		// set the total number of vertices to draw
		this.numVertices = numVertices;
	}

	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ(swap) {
		gl.useProgram(this.prog);
		gl.uniform1i(this.flipAxis, swap ? 1 : 0);
	}

	// This method is called to draw the triangular mesh.
	// The argument is the transformation matrix, the same matrix returned
	// by the GetModelViewProjection function above.
	draw(trans) {
		gl.useProgram(this.prog);

		// set up vertex attributes
		const attributes = [
			{ buffer: this.texCoordBuffer, location: this.texCoord, size: 2 },
			{ buffer: this.vertexBuffer, location: this.vertex, size: 3 },
		];

		for (const attr of attributes) {
			gl.bindBuffer(gl.ARRAY_BUFFER, attr.buffer);
			gl.enableVertexAttribArray(attr.location);
			gl.vertexAttribPointer(attr.location, attr.size, gl.FLOAT, false, 0, 0);
		}

		// set the matrix uniform
		gl.uniformMatrix4fv(this.mvp, false, trans);

		// draw the vertices
		gl.drawArrays(gl.TRIANGLES, 0, this.numVertices);
	}

	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture(img) {
		gl.useProgram(this.prog);

		// create and bind the texture
		const texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);

		// define texture parameters
		const level = 0;
		const internalFormat = gl.RGB;
		const srcFormat = gl.RGB;
		const srcType = gl.UNSIGNED_BYTE;

		// upload the image
		gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, img);

		// generate mipmaps for the texture
		gl.generateMipmap(gl.TEXTURE_2D);

		// set texture wrapping parameters
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

		// set texture filtering parameters
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);

		// set the sampler uniform to use texture unit 0
		const samplerLocation = gl.getUniformLocation(this.prog, 'textureSampler');
		gl.uniform1i(samplerLocation, 0);

	}

	// This method is called when the user changes the state of the
	// "Show Texture" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	showTexture(show) {
		gl.useProgram(this.prog);
		gl.uniform1i(this.useTexture, show ? 1 : 0);
	}

	// Vertex Shader GLSL
	vertex_shader = `
		uniform int flipAxis;
		uniform bool useTexture;
		uniform mat4 mvp;

		attribute vec2 texCoord;
		attribute vec3 vertex;

		varying vec2 v_texCoord;

		void main() {
			// convertto homogeneous coordinates
			vec4 position = vec4(vertex, 1.0);
		
			// flip the Y and Z coordinates if flipAxis is enabled
			if (flipAxis == 1) {
				// Swap the y and z components
				position.yz = position.zy;
			}
		
			// apply transformation
			gl_Position = mvp * position;
		
			v_texCoord = texCoord;
		}
		
	`;

	// Fragment Shader GLSL
	fragment_shader = `
		precision highp int;
		precision highp float;

		uniform bool useTexture;
		uniform sampler2D textureSampler;

		varying vec2 v_texCoord;

		void main() {
			vec4 color;

			if (useTexture) {
				// sample the texture 
				color = texture2D(textureSampler, v_texCoord);
			} else {
				float depth = gl_FragCoord.z; // Window-space depth in [0, 1]

				// find intensity from depth
				float intensity = pow(depth, 3.0);

				// set color to intensity
				color = vec4(intensity, 0.0, intensity, 1.0);
			}

			gl_FragColor = color;
		}
	`;
}
