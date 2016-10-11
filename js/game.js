"use strict";

function Game() {

	//TODO: Port physics engine to ammo.js

	//Config vars
	this.started = false;
	this.retries = 0;
	this.gravity = - 5;
	this.camSpeed = 0.1;
	this.normMouseX = 0;
	this.normMouseY = 0;
	this.inputState = 0;

	this.init();

};

Game.prototype.init = function() {

	$("#viewport").click(function() { this.inputState++} .bind(this))

	//TODO: Move to seperate file
	document.onmousemove = this.handleMouseMove.bind( this );

	$( document ).ready( function() {

		$( ".button" ).click( function( e ) {

			if ( $( this ).text() == "Start" ) {

				$( "#gui" ).hide();
				game.started = true;
				$( "#viewport" ).show();

			} else if ( $( this ).text() == "Settings" ) {

				$( "#menu" ).hide();
				//TODO: Options don't work yet
				$( "#settings-page" ).show();

			} else if ( $( this ).text() == "About" ) {

				$( "#menu" ).hide();
				$( "#about-page" ).show();

			} else if ( $ ( this ).text() == "Back" ) {

				$( "#menu" ).show();
				$( "#about-page" ).hide();
				$( "#settings-page" ).hide();

			}

		} )

	} );

	//Load resources
	this.soundWood = new Howl( { src: [ 'res/sounds/wood.mp3' ] } );
	this.soundBall = new Howl( { src: [ 'res/sounds/ball.mp3' ], loop: false } );

	//Create the scenemanager
	this.sceneManager = new SceneManager();
	this.setArrowLength(0.25);

	//Create the inputManager wich detects input
	this.keyboard = new THREEx.KeyboardState( this.sceneManager.renderer.domElement );

	window.addEventListener( 'resize', this.sceneManager.onResize.bind( this.sceneManager ), true );
	window.addEventListener( 'vrdisplaypresentchange', this.sceneManager.onResize.bind( this.sceneManager ), true );

}

Game.prototype.handleMouseMove = function( e ) {

	this.normMouseX = e.clientX / window.innerWidth * 2 - 1;
	this.normMouseY = e.clientY / window.innerHeight * 2 - 1;

}

let lastRender = 0;
let level3Speed = 0.004;
Game.prototype.run = function( timestamp ) {
	requestAnimationFrame( this.run.bind( this ) );
	if ( ! this.started ) return;

	const delta = Math.min( timestamp - lastRender, 500 );
	lastRender = timestamp;

	// render and update the scene through the manager.
	this.sceneManager.update(timestamp);

	if(this.sceneManager.shouldResetLevel) {
		this.setArrowLength(0.25);
		this.inputState = 0;
		if(typeof this.ball != 'undefined')
		this.sceneManager.mainScene.remove(this.ball);
		this.sceneManager.shouldResetLevel = false;
	}

	if(this.sceneManager.mainScene.getObjectByName("movable1")) {
		let movable1 = this.sceneManager.mainScene.getObjectByName("movable1");
		let movable2 = this.sceneManager.mainScene.getObjectByName("movable2");
		let movable3 = this.sceneManager.mainScene.getObjectByName("movable3");
		if(movable1.position.x < -0.475) {
			level3Speed *= -1;
		}

		if(movable1.position.x > 0.475) {
			level3Speed *= -1;
		}

		movable1.position.x -= level3Speed * 0.5;
		movable1.__dirtyPosition = true;

		movable2.position.x += level3Speed * 1.5;
		movable2.__dirtyPosition = true;

		movable3.position.x -= level3Speed;
		movable3.__dirtyPosition = true;
	}

	this.handleInput();
}

Game.prototype.handleInput = function() {

	if ( this.keyboard.pressed( 'w' ) ) { this.sceneManager.cameraObject.translateZ(-this.camSpeed); }
	if ( this.keyboard.pressed( 's' ) ) { this.sceneManager.cameraObject.translateZ(this.camSpeed); }
	if ( this.keyboard.pressed( 'a' ) ) { this.sceneManager.cameraObject.translateX(-this.camSpeed); }
	if ( this.keyboard.pressed( 'd' ) ) { this.sceneManager.cameraObject.translateX(this.camSpeed); }
	if ( this.keyboard.pressed( 'e' ) ) { this.sceneManager.cameraObject.translateY(-this.camSpeed); }
	if ( this.keyboard.pressed( 'q' ) ) { this.sceneManager.cameraObject.translateY(this.camSpeed); }

	if ( this.inputState == 0 ) {

		this.sceneManager.arrowPivot.position.x = this.normMouseX * 0.45;

	} else if ( this.inputState == 1 ) {

		this.sceneManager.arrowPivot.rotation.set( 0, this.normMouseX * - 90 * ( Math.PI / 180 ), 0 );
		this.setArrowLength( ( ( - this.normMouseY + 1 ) / 2 ) + 0.05 );

	} else if ( this.inputState == 2 ) {

		this.ball = new Physijs.SphereMesh(
			new THREE.SphereGeometry( 0.108, 8, 8 ),
			new THREE.MeshNormalMaterial(),
			8
		);

		this.ball.position.set( this.sceneManager.arrowPivot.position.x, this.sceneManager.arrowPivot.position.y + 0.08, this.sceneManager.arrowPivot.position.z );

		this.ball.addEventListener( 'collision', function( other_object, linear_velocity, angular_velocity ) {

			if ( other_object.name == 'pin' ) {

				var id = this.soundWood.play();

				// Change the position and rate.
				this.soundWood.pos( other_object.position.x, other_object.position.y, other_object.position.z, id );
				this.soundWood.rate( 0.7, id );
				this.soundWood.volume( 1, id );

			}

			if ( other_object.name == 'ground' ) {
				var id = this.soundBall.play();

				// Change the position and rate.
				//this.soundBall.pos(other_object.position.x, other_object.position.y, other_object.position.z, id);
				//this.soundWood.rate( 0.1, id);
				this.soundBall.volume( 1, id );

			}

		}.bind( this ) );

		this.sceneManager.mainScene.add( this.ball );
		this.inputState ++;

		this.ball.applyCentralImpulse( new THREE.Vector3( Math.sin( this.sceneManager.arrowPivot.rotation.y ) * - this.sceneManager.arrowStem.scale.y * 35, 0, Math.cos( this.sceneManager.arrowPivot.rotation.y ) * - this.sceneManager.arrowStem.scale.y * 35 ) );

	}

}

Game.prototype.setArrowLength = function( length ) {
	this.sceneManager.arrowStem.translateY((length - this.sceneManager.arrowStem.scale.y) / 2);
	this.sceneManager.arrowStem.scale.y = length;
	this.sceneManager.arrowPoint.scale.y = 1 / length;
}
