'use strict';

function Level3() {
    this.levelObjects = [];

    let level1 = new Level1();

    this.levelObjects.push( level1.genLane() );

	const pins = level1.genPins( new THREE.Vector3( 0, - 0.4, 0 ), 0.3, 4 );
	for ( let i = 0; i < pins.length; i ++ ) {
		this.levelObjects.push( pins[ i ] );
	}

    let boxes = this.addMovingBoxes();
    for(let i = 0; i < boxes.length; i++) {
        this.levelObjects.push(boxes[i]);
    }
}

Level3.prototype.addMovingBoxes = function() {
    this.boxes = [];
    let box1 = new Physijs.BoxMesh(new THREE.BoxGeometry(0.1, 0.2, 0.6), new THREE.MeshNormalMaterial(), 0);
    box1.position.set(0.475, -0.36, 3);
    box1.name = "movable1";
    this.boxes.push(box1);

    let box2 = new Physijs.BoxMesh(new THREE.BoxGeometry(0.1, 0.2, 0.6), new THREE.MeshNormalMaterial(), 0);
    box2.position.set(-0.475, -0.36, 5);
    box2.name = "movable2";
    this.boxes.push(box2);

    let box3 = new Physijs.BoxMesh(new THREE.BoxGeometry(0.1, 0.2, 0.6), new THREE.MeshNormalMaterial(), 0);
    box3.position.set(0.475, -0.36, 7);
    box3.name = "movable3";
    this.boxes.push(box3);

    return this.boxes;
}