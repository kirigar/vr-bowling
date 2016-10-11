'use strict';

function Level2() {
    this.levelObjects = [];

    let level1 = new Level1();

    this.levelObjects.push( level1.genLane() );

	const pins = level1.genPins( new THREE.Vector3( 0, - 0.4, 0 ), 0.3, 4 );
	for ( let i = 0; i < pins.length; i ++ ) {
		this.levelObjects.push( pins[ i ] );
	}

    let boxes = this.addBoxes();
    for(let i = 0; i < boxes.length; i++) {
        this.levelObjects.push(boxes[i]);
    }

}

Level2.prototype.addBoxes = function() {
    let boxes = [];
    let box1 = new Physijs.BoxMesh(new THREE.BoxGeometry(0.4, 0.3, 0.3), new THREE.MeshNormalMaterial(), 0);
    box1.position.set(0.375, -0.3, 3);
    boxes.push(box1);

    let box2 = new Physijs.BoxMesh(new THREE.BoxGeometry(0.4, 0.3, 0.3), new THREE.MeshNormalMaterial(), 0);
    box2.position.set(-0.375, -0.3, 5);
    boxes.push(box2);

    let box3 = new Physijs.BoxMesh(new THREE.BoxGeometry(0.4, 0.3, 0.3), new THREE.MeshNormalMaterial(), 0);
    box3.position.set(0.375, -0.3, 7);
    boxes.push(box3);

    return boxes;
}