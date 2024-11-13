// This function takes the translation and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// You can use the MatrixMult function defined in project5.html to multiply two 4x4 matrices in the same format.
function GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
{
	// compute cos and sin of rotation angles
	var cosX = Math.cos(rotationX);
	var sinX = Math.sin(rotationX);
	var cosY = Math.cos(rotationY);
	var sinY = Math.sin(rotationY);

	// rotation matrix around X axis
	var Rx = [
		1,    0,     0,    0,
		0,  cosX, -sinX,   0,
		0,  sinX,  cosX,   0,
		0,    0,     0,    1
	];

	// rotation matrix around Y axis
	var Ry = [
		cosY,  0, sinY, 0,
		  0,   1,   0,  0,
	   -sinY,  0, cosY, 0,
		  0,   0,   0,  1
	];

	// translation matrix
	var T = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];

	// combined rotation
	var R = MatrixMult( Ry, Rx );

	// combined model-view matrix
	var mv = MatrixMult( T, R );
	return mv;
}

class MeshDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
	constructor()
	{
		// compile shaders
		var vertex_shader = `
			attribute vec3 aPosition;
			attribute vec3 aNormal;
			attribute vec2 aTexCoord;

			uniform mat4 uModelViewProjectionMatrix;
			uniform mat4 uModelViewMatrix;
			uniform mat3 uNormalMatrix;

			uniform bool uSwapYZ;

			varying vec3 vPosition;
			varying vec3 vNormal;
			varying vec2 vTexCoord;

			void main()
			{
				vec3 position = aPosition;
				vec3 normal = aNormal;

				if( uSwapYZ )
				{
					position = vec3( position.x, position.z, position.y );
					normal = vec3( normal.x, normal.z, normal.y );
				}

				vPosition = (uModelViewMatrix * vec4( position, 1.0 )).xyz;
				vNormal = normalize( uNormalMatrix * normal );
				vTexCoord = aTexCoord;

				gl_Position = uModelViewProjectionMatrix * vec4( position, 1.0 );
			}
		`;

		var fragment_shader = `
			precision mediump float;

			uniform sampler2D uTexture;
			uniform bool uUseTexture;
			uniform vec3 uLightDir;
			uniform float uShininess;

			varying vec3 vPosition;
			varying vec3 vNormal;
			varying vec2 vTexCoord;

			void main()
			{
				vec3 normal = normalize( vNormal );
				vec3 lightDir = normalize( uLightDir );
				vec3 viewDir = normalize( -vPosition );

				// Blinn-Phong shading model
				vec3 halfVector = normalize( lightDir + viewDir );
				float NdotL = max( dot( normal, lightDir ), 0.0 );
				float NdotH = max( dot( normal, halfVector ), 0.0 );
				float specular = pow( NdotH, uShininess );

				vec3 color = vec3( 1.0 );

				if( uUseTexture )
				{
					color = texture2D( uTexture, vTexCoord ).rgb;
				}

				vec3 ambient = vec3( 0.1 ) * color;
				vec3 diffuse = NdotL * color;
				vec3 specularColor = specular * vec3( 1.0 );

				vec3 finalColor = ambient + diffuse + specularColor;

				gl_FragColor = vec4( finalColor, 1.0 );
			}
		`;

		// create shader program
		this.prog = InitShaderProgram( vertex_shader, fragment_shader );

		// attribute and uniform locations
		this.aPosition = gl.getAttribLocation( this.prog, 'aPosition' );
		this.aNormal = gl.getAttribLocation( this.prog, 'aNormal' );
		this.aTexCoord = gl.getAttribLocation( this.prog, 'aTexCoord' );

		this.uModelViewProjectionMatrix = gl.getUniformLocation( this.prog, 'uModelViewProjectionMatrix' );
		this.uModelViewMatrix = gl.getUniformLocation( this.prog, 'uModelViewMatrix' );
		this.uNormalMatrix = gl.getUniformLocation( this.prog, 'uNormalMatrix' );

		this.uSwapYZ = gl.getUniformLocation( this.prog, 'uSwapYZ' );
		this.uUseTexture = gl.getUniformLocation( this.prog, 'uUseTexture' );
		this.uTexture = gl.getUniformLocation( this.prog, 'uTexture' );
		this.uLightDir = gl.getUniformLocation( this.prog, 'uLightDir' );
		this.uShininess = gl.getUniformLocation( this.prog, 'uShininess' );

		// create buffers
		this.posBuffer = gl.createBuffer();
		this.normalBuffer = gl.createBuffer();
		this.texCoordBuffer = gl.createBuffer();

		// create and initialize texture
		this.texture = gl.createTexture();
		gl.bindTexture( gl.TEXTURE_2D, this.texture );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );

		// set default values
		this.swapYZ = false;
		this.useTexture = false;
		this.lightDir = [ 0.0, 0.0, -1.0 ];
		this.shininess = 30.0;
	}

	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions,
	// an array of 2D texture coordinates, and an array of vertex normals.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex and every three consecutive 
	// elements in the normals array form a vertex normal.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords, normals )
	{
		// update the contents of the vertex buffer objects.
		this.numTriangles = vertPos.length / 3;

		// bind and set position buffer
		gl.bindBuffer( gl.ARRAY_BUFFER, this.posBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( vertPos ), gl.STATIC_DRAW );

		// bind and set normal buffer
		gl.bindBuffer( gl.ARRAY_BUFFER, this.normalBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( normals ), gl.STATIC_DRAW );

		// bind and set texture coordinate buffer
		gl.bindBuffer( gl.ARRAY_BUFFER, this.texCoordBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( texCoords ), gl.STATIC_DRAW );
	}

	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ( swap )
	{
		this.swapYZ = swap;
	}

	// This method is called to draw the triangular mesh.
	// The arguments are the model-view-projection transformation matrixMVP,
	// the model-view transformation matrixMV, the same matrix returned
	// by the GetModelViewProjection function above, and the normal
	// transformation matrix, which is the inverse-transpose of matrixMV.
	draw( matrixMVP, matrixMV, matrixNormal )
	{
		// use the shader program
		gl.useProgram( this.prog );

		// set uniforms
		gl.uniformMatrix4fv( this.uModelViewProjectionMatrix, false, matrixMVP );
		gl.uniformMatrix4fv( this.uModelViewMatrix, false, matrixMV );
		gl.uniformMatrix3fv( this.uNormalMatrix, false, matrixNormal );
		gl.uniform1i( this.uSwapYZ, this.swapYZ );
		gl.uniform1i( this.uUseTexture, this.useTexture );
		gl.uniform3fv( this.uLightDir, this.lightDir );
		gl.uniform1f( this.uShininess, this.shininess );

		// enable and set attribute pointers
		gl.bindBuffer( gl.ARRAY_BUFFER, this.posBuffer );
		gl.enableVertexAttribArray( this.aPosition );
		gl.vertexAttribPointer( this.aPosition, 3, gl.FLOAT, false, 0, 0 );

		gl.bindBuffer( gl.ARRAY_BUFFER, this.normalBuffer );
		gl.enableVertexAttribArray( this.aNormal );
		gl.vertexAttribPointer( this.aNormal, 3, gl.FLOAT, false, 0, 0 );

		gl.bindBuffer( gl.ARRAY_BUFFER, this.texCoordBuffer );
		gl.enableVertexAttribArray( this.aTexCoord );
		gl.vertexAttribPointer( this.aTexCoord, 2, gl.FLOAT, false, 0, 0 );

		// bind texture if using texture
		if( this.useTexture )
		{
			gl.activeTexture( gl.TEXTURE0 );
			gl.bindTexture( gl.TEXTURE_2D, this.texture );
			gl.uniform1i( this.uTexture, 0 );
		}

		// draw the triangles
		gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles );

		// disable attributes
		gl.disableVertexAttribArray( this.aPosition );
		gl.disableVertexAttribArray( this.aNormal );
		gl.disableVertexAttribArray( this.aTexCoord );
	}

	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture( img )
	{
		// bind the texture
		gl.bindTexture( gl.TEXTURE_2D, this.texture );

		// set the texture image data
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img );

		// generate mipmaps
		gl.generateMipmap( gl.TEXTURE_2D );
	}

	// This method is called when the user changes the state of the
	// "Show Texture" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	showTexture( show )
	{
		this.useTexture = show;
	}

	// This method is called to set the incoming light direction
	setLightDir( x, y, z )
	{
		this.lightDir = [ x, y, z ];
	}

	// This method is called to set the shininess of the material
	setShininess( shininess )
	{
		this.shininess = shininess;
	}
}

