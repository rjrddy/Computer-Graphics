// [TO-DO] Complete the implementation of the following class and the vertex shader below.

class CurveDrawer {
	constructor()
	{

		// compile the shader program
		this.prog = InitShaderProgram( curvesVS, curvesFS );
		
		// retreive the ids of the uniform variables in the shaders
		this.mvp = gl.getUniformLocation( this.prog, 'mvp');
		this.p0 = gl.getUniformLocation(this.prog, 'p0');
		this.p1 = gl.getUniformLocation(this.prog, 'p1');
		this.p2 = gl.getUniformLocation(this.prog, 'p2');
		this.p3 = gl.getUniformLocation(this.prog, 'p3');

		// retreive the ids of the vertex attributes in the shaders
		this.vertPos = gl.getAttribLocation ( this.prog, 't')

		// creates vertex buffer object
		this.buffer = gl.createBuffer();

		
		// Initialize the attribute buffer and assign values
		this.steps = 100;
		var tv = [];
		for ( var i=0; i<this.steps; ++i ) {
			tv.push( i / (this.steps-1) );
		}
		
		// bind buffer and set buffer data to 'tv'
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tv), gl.STATIC_DRAW);
		
		
	}
	setViewport( width, height )
	{
		
		// Bind the program
		gl.useProgram( this.prog );

		// create transformation matrix
		var trans = [2 / width, 0, 0, 0,
					0, -2 / height, 0, 0,
					0, 0, 1, 0,
					-1, 1, 0, 1];

		// send the matrix to the shader
		gl.uniformMatrix4fv(this.mvp, false, trans);
	}
	updatePoints( pt )
	{
		// bind the program
		gl.useProgram(this.prog);

		// update the data since control points have changed
		var p = [];
		for ( var i=0; i<4; ++i) {
			var x = pt[i].getAttribute("cx");
			var y = pt[i].getAttribute("cy");
			
			// casts the string into a float
			x = parseFloat(x);
			y = parseFloat(y);
			
			p.push(x);
			p.push(y);

			// updates the uniform variable
			gl.uniform2f(this['p' + i], x, y);
		}
		
	}
	draw()
	{
		// bind the program
		gl.useProgram(this.prog);

		// bind the buffer and set the attribute
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.vertexAttribPointer(this.vertPos, 1, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.vertPos);

		// draw the curve as a line strip
		gl.drawArrays(gl.LINE_STRIP, 0, this.steps);	
	}
}

// Vertex Shader
var curvesVS = `
	attribute float t;
	uniform mat4 mvp;
	uniform vec2 p0;
	uniform vec2 p1;
	uniform vec2 p2;
	uniform vec2 p3;
	void main()
	{
		float u = 1.0 - t;
		vec2 pos = u * u * u * p0 +
					3.0 * u * u * t * p1 +
					3.0 * u * t * t * p2 +
					t * t * t * p3;
		gl_Position = mvp * vec4(pos, 0.0, 1.0);
	}
`;

// Fragment Shader
var curvesFS = `
	precision mediump float;
	void main()
	{
		gl_FragColor = vec4(1,0,0,1);
	}
`;