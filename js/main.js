/**
 * @copyright 2014 Paul Liverman III
 */

/**
 * @namespace
 * @description Main simulation values, where the Ships are stored, and the main loop.
 * @see {@linkcode Ship} and {@linkcode Particle}
 * @property {number} gravitationalAcceleration - How much velocity to apply each iteration.
 *
 * @property {number} exhaustSpread - Modifies how much random spread there is on exhaust.
 * @property {number} exhaustRandomness - Modifies how much particles move randomly each iteration.
 * @property {number} minExhaustVelocity - Minimum exhaust velocity added to Ship velocity.
 * @property {number} maxExhaustVelocity - Maximum exhaust velocity added to Ship velocity.
 * @property {number} thrusterAcceleration - How much the Ship accelerates from thrusting.
 * @property {number} thrusterParticles - How many Particles to spawn each iteration while thrusting.
 *
 * @property {number} shipBorderRebound - Multiplied to Ships' velocity when bouncing off borders.
 * @property {number} shipBorderFriction - Multiplied to Ships' velocity when dragging along a border.
 * @property {number} shipDrag - Multiplied to Ships' velocity each iteration to simulate the drag of an atmosphere.

 * @property {number} particleDrag - Artificial higher drag applied to Particles.
 * @property {string} particleType - This property is used to select a particle effect type with dat.GUI. This setting itself does not change the effect, but there is an onChange() method on the GUI to change it when this value is changed in the GUI.
 * @property {number} nullifyThreshold - The threshold at which velocity will be nullified instead of reflected buring border collisions.

 * @property {Array} ships - Where all Ships in the simulation are stored.
 * @property {number} playerID - The index of which Ship in Game.ships is being controlled.

 * @property {function} loop - Main game loop.
 * @property {function} nullifyLowVelocity - Nullifies low velocities on objects passed to it.
 */
var Game={
	gravitationalAcceleration:0.5,

	exhaustSpread:2,
	exhaustRandomness:0.3,
	minExhaustVelocity:16,
	maxExhaustVelocity:20,
	thrusterAcceleration:1,
	thrusterParticles:4,

	shipBorderRebound:0.35,
	shipBorderFriction:0.8,
	shipDrag:0.99,

	particleDrag:0.9,
	particleType:'redFlame',
	nullifyThreshold:1,

	ships:[],
	playerID:0,

	/**
	 * @description Main game loop.
	 */
	loop:function(){
		forEach(Game.ships,function(b){
			//apply Ship velocity
			b.x+=b.v.x;
			b.y+=b.v.y;
			//Ship to border collisions
			if (b.y > window.innerHeight-b.height/2) {
				b.y = window.innerHeight-b.height/2;
				b.v.y=-b.v.y*Game.shipBorderRebound;
				b.v.x*=Game.shipBorderFriction;
				Game.nullifyLowVelocity(b);
			} else if (b.y < b.height/2) {
				b.y = b.height/2;
				b.v.y=-b.v.y*Game.shipBorderRebound;
				b.v.x*=Game.shipBorderFriction;
				Game.nullifyLowVelocity(b);
			}
			if (b.x > window.innerWidth-b.width/2) {
				b.x = window.innerWidth-b.width/2;
				b.v.x=-b.v.x*Game.shipBorderRebound;
				b.v.y*=Game.shipBorderFriction;
				Game.nullifyLowVelocity(b);
			} else if (b.x < b.width/2) {
				b.x = b.width/2;
				b.v.x=-b.v.x*Game.shipBorderRebound;
				b.v.y*=Game.shipBorderFriction;
				Game.nullifyLowVelocity(b);
			}
			forEach(b.particles,function(a){
				//apply Particle velocity
				a.x+=a.v.x;
				a.y+=a.v.y;
				//Particle to border collision
				if (a.y > window.innerHeight-a.height/2) {
					a.y = window.innerHeight-a.height/2;
					a.v.y=-a.v.y;
				} else if (a.y < a.height/2) {
					a.y = a.height/2;
					a.v.y=-a.v.y;
				}
				if (a.x > window.innerWidth-a.width/2) {
					a.x = window.innerWidth-a.width/2;
					a.v.x=-a.v.x;
				} else if (a.x < a.width/2) {
					a.x = a.width/2;
					a.v.x=-a.v.x;
				}
				//Particle to Ship collision
				if (a.x-a.width/2  < b.x+b.width/2  &&
					a.x+a.width/2  > b.x-b.width/2  &&
					a.y-a.height/2 < b.y+b.height/2 &&
					a.y+a.height/2 > b.y-b.height/2
				) {
					a.v.x+=b.v.x;
					a.v.y+=b.v.y;
					/*if(b.v.x>0 && ship.v.x>0 || b.v.x<0 && ship.v.x<0){
						b.v.x+=ship.v.x;
					}else{
						b.v.x-=ship.v.x;
					}
					if(b.v.y>0 && ship.v.y>0 || b.v.y<0 && ship.v.y<0){
						b.v.y+=ship.v.y;
					}else{
						b.v.y-=ship.v.y;
					}*/
				}
				//update Particle velocity
				a.v.x*=Game.particleDrag;
				a.v.y*=Game.particleDrag;
				a.v.x+=random.number(-Game.exhaustRandomness*a.v.x,Game.exhaustRandomness*a.v.x);
				a.v.y+=random.number(-Game.exhaustRandomness*a.v.y,Game.exhaustRandomness*a.v.y);
			});
			//update Ship velocity (gravity / drag)
			b.v.y+=Game.gravitationalAcceleration;
			b.v.x*=Game.shipDrag;
			b.v.y*=Game.shipDrag;
		});
		//apply Ship thrust
		if (io.keysHeld[Jenjens.keys.w] || io.keysHeld[Jenjens.keys.up]) {
			Game.ships[Game.playerID].v.y-=Game.thrusterAcceleration;
			Game.ships[Game.playerID].exhaust('down',Game.thrusterParticles);
		}
		if (io.keysHeld[Jenjens.keys.a] || io.keysHeld[Jenjens.keys.left]) {
			Game.ships[Game.playerID].v.x-=Game.thrusterAcceleration;
			Game.ships[Game.playerID].exhaust('right',Game.thrusterParticles);
		}
		if (io.keysHeld[Jenjens.keys.s] || io.keysHeld[Jenjens.keys.down]) {
			Game.ships[Game.playerID].v.y+=Game.thrusterAcceleration;
			Game.ships[Game.playerID].exhaust('up',Game.thrusterParticles);
		}
		if (io.keysHeld[Jenjens.keys.d] || io.keysHeld[Jenjens.keys.right]) {
			Game.ships[Game.playerID].v.x+=Game.thrusterAcceleration;
			Game.ships[Game.playerID].exhaust('left',Game.thrusterParticles);
		}
		Render.draw();

		setTimeout(Game.loop,Render.iterationDelay);
	},
	/**
	 * @description X/Y velocities nullified if less than Game.nullifyThreshold.
	 * @param {object} ship - A ship (or anything with a v.x and v.y property representing velocity).
	 */
	nullifyLowVelocity:function(b){
		if (Math.abs(b.v.x) < Game.nullifyThreshold) b.v.x=0;
		if (Math.abs(b.v.y) < Game.nullifyThreshold) b.v.y=0;
	}
};

/** @description Adds keydown checking for thruster. */
io.addEvent('keydown',io.keyDown);
io.addEvent('keyup',io.keyUp);

io.addEvent('load',function(){
	//create Ship
	Game.ships.push(new Ship(window.innerWidth/2,window.innerHeight/2));

	gui.load();

	//start main loop
	Game.loop();
});

/** @description Supposed to scale everything nicely but broken instead. */
io.addEvent('resize',function(){
	var previousWidth = Render.canvas.width;
	var previousHeight = Render.cavnas.height;
	Render.canvas.width=window.innerWidth;
	Render.canvas.height=window.innerHeight;
	/*
	var scaleX = previousWidth / window.innerWidth;
	var scaleY = previousHeight / window.innerHeight;
	forEach(Game.ships, function(b){
		b.x /= scaleX;
		b.y /= scaleY;
		b.width /= (scaleX > scaleY) ? scaleX : scaleY ;
		b.height = b.width;
		forEach(b.particles, function(a){
			a.x /= scaleX;
			a.y /= scaleY;
		});
	});
	//*/
});
