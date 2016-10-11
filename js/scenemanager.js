'use strict';

function SceneManager() {
	this.shouldResetLevel = false;
    this.mainScene = new Physijs.Scene;
	this.tempObjects = [];

	//Setup three.js WebGL renderer. Note: Antialiasing is a big performance hit.
	//TODO: Check performance hit of AA
	this.renderer = new THREE.WebGLRenderer( { antialias: false } );
	this.renderer.setPixelRatio( window.devicePixelRatio );
	$( "#viewport" ).append( this.renderer.domElement );
	this.renderer.domElement.setAttribute( "tabIndex", "0" );
	this.renderer.domElement.focus();

	//Apply VR stereo rendering to renderer.
	this.effect = new THREE.VREffect( this.renderer );
	this.effect.setSize( window.innerWidth, window.innerHeight );

    //Create a three.js camera.
	this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 10000 );
 
	this.cameraObject = new THREE.Object3D();
	this.cameraObject.position.set( 0, - 1.5, 9 );
	this.cameraObject.add( this.camera );
	this.mainScene.add( this.cameraObject );

	//Apply VR headset positional data to camera.
	this.controls = new THREE.VRControls( this.camera );
	this.controls.standing = true;

	//Create a manager for WebVR that renders the scene
	let params = {
		hideButton: false, // Default: false.
		isUndistorted: false // Default: false.
	};
	this.manager = new WebVRManager( this.renderer, this.effect, this.params );

    //Create game-over text
    let loader = new THREE.FontLoader();

	loader.load( 'res/fonts/helvetiker_regular.typeface.js', function ( font ) {
		let textGeo = new THREE.TextGeometry( "Game Over", {
			font: font,

			size: 0.15,
			height: 0.03,
			curveSegments: 12,
		});
		textGeo.computeBoundingBox();

		this.gameOverMesh = new Physijs.ConcaveMesh(textGeo, new THREE.MeshNormalMaterial(), 3);
		this.gameOverMesh.position.y = 3;
		this.gameOverMesh.position.x = -0.5;
		this.gameOverMesh.position.z = 8;
	}.bind(this) );

    //Create skysphere
	let geometry = new THREE.SphereGeometry( 3000, 60, 40 );
	let uniforms = {
		texture: { type: 't', value: THREE.ImageUtils.loadTexture( 'res/textures/clouds.jpg' ) }
	};

	let material = new THREE.ShaderMaterial( {
		uniforms: uniforms,
		vertexShader: document.getElementById( 'sky-vertex' ).textContent,
		fragmentShader: document.getElementById( 'sky-fragment' ).textContent
	} );

	let skySphere = new THREE.Mesh( geometry, material );
	skySphere.scale.set( - 1, 1, 1 );
	skySphere.renderOrder = - 100.0;

	this.mainScene.add(skySphere);

	//Create input arrow
	this.arrowPoint = new THREE.Mesh( new THREE.CylinderGeometry( 0.001, 0.01, 0.05 ), new THREE.MeshNormalMaterial() );
	this.arrowStem = new THREE.Mesh( new THREE.CylinderGeometry( 0.002, 0.002, 1 ), new THREE.MeshNormalMaterial() );
	this.arrowPoint.position.set( 0, 0.5, 0 );
	this.arrowStem.add( this.arrowPoint );
	this.arrowStem.position.set( 0, 0, - 0.5 )

	this.arrowStem.rotateX( - 90 * ( Math.PI / 180 ) );

	this.arrowPivot = new THREE.Object3D();
	this.arrowPivot.position.set( 0, - 0.4, 8.3 );
	this.arrowPivot.add( this.arrowStem );
	this.mainScene.add(this.arrowPivot);

    //Load the main level
    this.loadLevel(3);
}

SceneManager.prototype.loadLevel = function(level) {
	this.shouldResetLevel = true;
	if(this.tempObjects.length > 0) {
		for(let i = 0; i < this.tempObjects.length; i++) {
			this.mainScene.remove(this.tempObjects[i]);
		}
	}
	if(typeof curLevelObj != 'undefined') this.mainScene.remove(curLevelObj);
    switch(level) {
        case 1: {
            let level1 = new Level1();
			level1.init();
			for(let i = 0; i < level1.levelObjects.length; i++) {
				this.mainScene.add(level1.levelObjects[i]);
			}
			this.tempObjects = level1.levelObjects;
            break;
        }

		case 2: {
			let level2 = new Level2();
			for(let i = 0; i < level2.levelObjects.length; i++) {
				this.mainScene.add(level2.levelObjects[i]);
			}
			this.tempObjects = level2.levelObjects;
            break;
		}

		case 3: {
			let level3 = new Level3();
			for(let i = 0; i < level3.levelObjects.length; i++) {
				this.mainScene.add(level3.levelObjects[i]);
			}
			this.tempObjects = level3.levelObjects;
            break;
		}
    }
}

SceneManager.prototype.update = function(timestamp) {
	this.cameraObject.rotation.set(this.camera.rotation.x, this.camera.rotation.y, this.camera.rotation.z);
	this.controls.update();
	this.mainScene.simulate();
	this.manager.render( this.mainScene, this.camera, timestamp );
}

SceneManager.prototype.onResize = function() {
	this.effect.setSize( window.innerWidth, window.innerHeight );
	this.camera.aspect = window.innerWidth / window.innerHeight;
	this.camera.updateProjectionMatrix();
}

SceneManager.prototype.gameover = function() {
	this.mainScene.add(this.gameOverMesh);
}