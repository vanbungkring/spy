// An overlord manages a list of enemies by spawning and destroying them.

Ptero.getMountainPaths = function() {
	return {
		"mountain": [
			Ptero.assets.json["mountain_path00"],
			Ptero.assets.json["mountain_path01"],
			Ptero.assets.json["mountain_path02"],
			Ptero.assets.json["mountain_path03"],
			Ptero.assets.json["mountain_path04"],
			Ptero.assets.json["mountain_path05"],
			Ptero.assets.json["mountain_path06"],
			Ptero.assets.json["mountain_path07"],
			Ptero.assets.json["mountain_path08"],
			Ptero.assets.json["mountain_path09"],
		],
		"ice": [
			Ptero.assets.json["ice_path00"],
			Ptero.assets.json["ice_path01"],
			Ptero.assets.json["ice_path02"],
			Ptero.assets.json["ice_path03"],
			Ptero.assets.json["ice_path04"],
			Ptero.assets.json["ice_path05"],
			Ptero.assets.json["ice_path06"],
			Ptero.assets.json["ice_path07"],
			Ptero.assets.json["ice_path08"],
			Ptero.assets.json["ice_path09"],
		],
		"volcano": [
			Ptero.assets.json["volcano_path00"],
			Ptero.assets.json["volcano_path01"],
			Ptero.assets.json["volcano_path02"],
			Ptero.assets.json["volcano_path03"],
			Ptero.assets.json["volcano_path04"],
			Ptero.assets.json["volcano_path05"],
			Ptero.assets.json["volcano_path06"],
			Ptero.assets.json["volcano_path07"],
		],
	}[Ptero.background.name];
};

Ptero.makeOverlord = function() {
	var paths = Ptero.getMountainPaths();
	if (Ptero.settings.isTutorialEnabled()) {
		Ptero.scene_play.enableNet(false);
		return new Ptero.OverlordTutor(paths);
	}
	else {
		Ptero.scene_play.enableNet(true);
		return new Ptero.OverlordPattern(paths);
	}
};

//////////////////////////////////////////////////////////////////////////////
Ptero.OverlordTutor = function(paths) {
	this.paths = paths;
	this.enemies = [];
	this.stopped = false;

};

Ptero.OverlordTutor.prototype = {
	draw: function(ctx) {
		this.drawSign && this.drawSign(ctx);
	},
	createRandomEnemy: function(d) {
		var enemyNames = Ptero.bounty.enemyNames;
		var enemyType;
		if (d.age == 'baby') {
			enemyType = enemyNames[Math.floor(Math.random()*2)];
		}
		else if (d.age == 'adult') {
			enemyType = enemyNames[Math.floor(Math.random()*2)+2];
		}
		else if (d.colorIndex != null) {
			enemyType = enemyNames[d.colorIndex];
		}
		else {
			enemyType = enemyNames[Math.floor(Math.random()*enemyNames.length)];
		}
		var path = this.paths[Math.floor(Math.random()*this.paths.length)];
		return this.createEnemy(path,enemyType);
	},
	createEnemy: function(path, enemyType) {
		var state = {
			isAttack: true,
			enemyType: enemyType,
			points: path.models[0].points,
		};
		return Ptero.Enemy.fromState(state);
	},
	init: function() {
		// create first enemy and attached event to kick off next checkpoint
		var that = this;
		this.checkpoint = 0;

		this.signTime = 0;
		this.signLen = 3;

		this.checkpoints = [
			function() {
				that.drawSign = function(ctx) {
					var s = Ptero.assets.sprites['msg_tut1'];
					var pos = {
						x: 0,
						y: 0,
						z: Ptero.frustum.near,
					};
					s.draw(ctx, pos);
				};
				setTimeout(function(){
					that.checkpoint += 1;
					that.drawSign = null;
					exec();
				}, that.signLen*1000);
			},
			function() {
				// spawn babies 1 by 1 until hit
				// "KILL THE BABY PTERODACTYL!"
				var enemy = that.createRandomEnemy({age:'baby'});
				enemy.onAttack = function() {
					exec();
				};
				enemy.afterHit = function() {
					that.checkpoint += 1;
					exec();
				};
				that.enemies.push(enemy);
			},
			function() {
				that.drawSign = function(ctx) {
					var s = Ptero.assets.sprites['msg_complete'];
					var pos = {
						x: 0,
						y: 0,
						z: Ptero.frustum.near,
					};
					s.draw(ctx, pos);
				};
				setTimeout(function(){
					that.checkpoint += 1;
					that.drawSign = null;
					exec();
				}, that.signLen*1000);
			},
			function() {
				that.drawSign = function(ctx) {
					var s = Ptero.assets.sprites['msg_tut2'];
					var pos = {
						x: 0,
						y: 0,
						z: Ptero.frustum.near,
					};
					s.draw(ctx, pos);
				};
				setTimeout(function(){
					that.checkpoint += 1;
					that.drawSign = null;
					exec();
				}, that.signLen*1000);
			},
			function() {
				// spawn adults 1 by 1 until hit
				// "KILL THE BIG PTERODACTYL!"
				var enemy = that.createRandomEnemy({age:'adult'});
				enemy.onAttack = function() {
					exec();
				};
				enemy.afterHit = function() {
					that.checkpoint += 1;
					exec();
				};
				that.enemies.push(enemy);
			},
			function() {
				that.drawSign = function(ctx) {
					var s = Ptero.assets.sprites['msg_complete'];
					var pos = {
						x: 0,
						y: 0,
						z: Ptero.frustum.near,
					};
					s.draw(ctx, pos);
				};
				setTimeout(function(){
					that.checkpoint += 1;
					that.drawSign = null;
					exec();
				}, 1500);
			},
			function() {
				that.drawSign = function(ctx) {
					var s = Ptero.assets.sprites['msg_tut3'];
					var pos = {
						x: 0,
						y: 0,
						z: Ptero.frustum.near,
					};
					s.draw(ctx, pos);
				};
				setTimeout(function(){
					that.checkpoint += 1;
					that.drawSign = null;
					exec();
				}, that.signLen*1000);
			},
			function() {
				// spawn 1 baby and 1 adult until hit
				// "KILL THE GROUP OF PTERODACTYLS!"
				var enemies = [
					that.createRandomEnemy({age:'baby'}),
					that.createRandomEnemy({age:'adult'}),
					that.createRandomEnemy({age:'baby'}),
					that.createRandomEnemy({age:'adult'}),
				];
				var i,len=enemies.length;
				var numKilled = 0;
				var endTotal = 0;
				function onEnd(isKilled) {
					endTotal += 1;
					if (isKilled) {
						numKilled += 1;
					}
					if (numKilled == len) {
						that.checkpoint += 1;
						exec();
					}
					else if (endTotal == len) {
						exec();
					}
				}
				for (i=0; i<len; i++) {
					enemies[i].onAttack = function() { onEnd(false); };
					enemies[i].afterHit = function() { onEnd(true); };
					setTimeout((function(enemy){
						return function() {
							that.enemies.push(enemy);
						};
					})(enemies[i]),2000*i);
				}
			},
			function() {
				that.drawSign = function(ctx) {
					var s = Ptero.assets.sprites['msg_complete'];
					var pos = {
						x: 0,
						y: 0,
						z: Ptero.frustum.near,
					};
					s.draw(ctx, pos);
				};
				setTimeout(function(){
					that.checkpoint += 1;
					that.drawSign = null;
					exec();
				}, 1500);
			},
			//function() {
			//	that.signTime = that.signLen;
			//	that.drawSign = function(ctx) {
			//		var s = Ptero.assets.sprites['msg_tut4'];
			//		var pos = {
			//			x: 0,
			//			y: 0,
			//			z: Ptero.frustum.near,
			//		};
			//		s.draw(ctx, pos);
			//	};
			//	setTimeout(function(){
			//		that.checkpoint += 1;
			//		exec();
			//	}, that.signTime*1000);
			//},
			(function(){
				var first = true;
				return function() {
					that.drawSign = function(ctx) {
						var s = Ptero.assets.mosaics['msg_helpnet'];
						var pos = {
							x: 0,
							y: 0,
							z: Ptero.frustum.near,
						};
						s.draw(ctx, pos, "help");
						if (!first) {
							s = Ptero.assets.sprites['msg_tryagain'];
							pos.y += 0.1;
							s.draw(ctx, pos);
						}
					};
					setTimeout(function(){
						that.checkpoint += 1;
						first = false;
						that.drawSign = null;
						exec();
					}, that.signLen*1000);
					Ptero.scene_play.enableNet(true);

					var bounty = new Ptero.Bounty();
					Ptero.bounty = bounty;
					var babyIndex = 0;
					var adultIndex = 2;
					bounty.setItems([babyIndex,adultIndex]);
				};
			})(),
			function() {
				// "CAPTURE THE PTERODACTYLS TO GAIN HEALTH!"

				var babyIndex = 0;
				var adultIndex = 2;
				var enemies = [
					that.createRandomEnemy({colorIndex:babyIndex}),
					that.createRandomEnemy({colorIndex:adultIndex}),
				];
				
				var i,len=enemies.length;
				var endTotal = 0;
				var numCaught = 0;
				function onEnd(isCaught) {
					endTotal += 1;
					if (isCaught) {
						numCaught += 1;
					}
					if (numCaught == len) {
						that.checkpoint += 1;
						exec();
					}
					else if (endTotal == len) {
						that.checkpoint -= 1;
						exec();
					}
				}
				for (i=0; i<len; i++) {
					enemies[i].onAttack = function() { onEnd(false); };
					enemies[i].afterHit = function() { onEnd(false); };
					enemies[i].onCaught = function() { onEnd(true); };
					setTimeout((function(enemy){
						return function() {
							that.enemies.push(enemy);
						};
					})(enemies[i]),2000*(i+1));
				}
			},
			function() {
				that.drawSign = function(ctx) {
					var s = Ptero.assets.sprites['msg_complete'];
					var pos = {
						x: 0,
						y: 0,
						z: Ptero.frustum.near,
					};
					s.draw(ctx, pos);
				};
				setTimeout(function(){
					that.checkpoint += 1;
					that.drawSign = null;
					exec();
				}, that.signLen*1000);
			},
			//function() {
			//	that.signTime = that.signLen;
			//	that.drawSign = function(ctx) {
			//		var s = Ptero.assets.sprites['msg_tut5'];
			//		var pos = {
			//			x: 0,
			//			y: 0,
			//			z: Ptero.frustum.near,
			//		};
			//		s.draw(ctx, pos);
			//	};
			//	setTimeout(function(){
			//		that.checkpoint += 1;
			//		exec();
			//	}, that.signTime*1000);

			//	var bounty = new Ptero.Bounty();
			//	Ptero.bounty = bounty;
			//	var bountyIndexes = [2,3];
			//	bounty.setItems(bountyIndexes);

			//},
			(function(){

				var first = true;
				return function() {
					var bounty = new Ptero.Bounty();
					Ptero.bounty = bounty;
					var bountyIndexes = [2,3];
					bounty.setItems(bountyIndexes);

					that.drawSign = function(ctx) {
						var s = Ptero.assets.mosaics['msg_helpbounty'];
						var pos = {
							x: 0,
							y: 0,
							z: Ptero.frustum.near,
						};
						s.draw(ctx, pos, "help");
						if (!first) {
							s = Ptero.assets.sprites['msg_tryagain'];
							pos.y += 0.1;
							s.draw(ctx, pos);
						}
					};
					setTimeout(function(){
						that.checkpoint += 1;
						first = false;
						that.drawSign = null;
						exec();
					}, that.signLen*1000);
				};
			})(),
			function() {
				// "CAPTURE THE CORRECT PTERODACTYLS!"

				var indexes = [ 0,1,2,3 ];
				var i,len=indexes.length;
				var enemies = [];
				for (i=0; i<len; i++) {
					enemies.push(that.createRandomEnemy({colorIndex:i}));
				}
				
				var endTotal = 0;
				var numCaught = 0;
				var bountyLen = 2;
				function onEnd(isCaught) {
					endTotal += 1;
					console.log(isCaught);
					if (isCaught) {
						numCaught += 1;
					}
					if (endTotal == len) {
						if (numCaught == bountyLen) {
							that.checkpoint += 1;
							exec();
						}
						else {
							that.checkpoint -= 1;
							exec();
						}
					}
				}
				for (i=0; i<len; i++) {
					enemies[i].onAttack = function() { onEnd(false); };
					enemies[i].afterHit = function() { onEnd(false); };
					if (i >= 2) {
						enemies[i].onCaught = function() { onEnd(true); };
					}
					setTimeout((function(enemy){
						return function() {
							that.enemies.push(enemy);
						};
					})(enemies[i]),2000*(i+1));
				}
			},
			function() {
				that.drawSign = function(ctx) {
					var s = Ptero.assets.sprites['msg_complete'];
					var pos = {
						x: 0,
						y: 0,
						z: Ptero.frustum.near,
					};
					s.draw(ctx, pos);
				};
				setTimeout(function(){
					that.checkpoint += 1;
					that.drawSign = null;
					exec();
				}, that.signLen*1000);
			},
			function() {
				that.drawSign = function(ctx) {
					var s = Ptero.assets.sprites['msg_ready'];
					var pos = {
						x: 0,
						y: 0,
						z: Ptero.frustum.near,
					};
					s.draw(ctx, pos);
				};
				setTimeout(function(){
					Ptero.settings.enableTutorial(false);
					that.drawSign = null;
					Ptero.refreshBounty();
					Ptero.overlord = Ptero.makeOverlord();
					Ptero.orb.setTargets(Ptero.overlord.enemies);
				}, that.signLen*1000);
			},
		];

		function exec() {
			console.log('checkpoint '+that.checkpoint);
			that.checkpoints[that.checkpoint]();
		}
		setTimeout(exec, 2000);
	},
	stopScript: function() {
		this.stopped = true;
	},
	update: function(dt) {

		// update enemies
		var e,pos;
		var i,len=this.enemies.length;
		for (i=0; this.enemies[i];) {
			e = this.enemies[i];
			if (e.isDead) {
				// remove enemy if needed
				this.enemies.splice(i,1);
			}
			else {
				e.update(dt);
				pos = e.getPosition();
				if (pos) {
					Ptero.deferredSprites.defer(
						(function(e) {
							return function(ctx){
								e.draw(ctx);
							};
						})(e),
						pos.z);
				}
				i++;
			}
		}
	},
};

//////////////////////////////////////////////////////////////////////////////

Ptero.OverlordPattern = function(paths) {
	this.paths = paths;
	this.enemies = [];
	this.createScript();
	this.stopped = false;
};

Ptero.OverlordPattern.prototype = {
	draw: function(ctx) {
	},
	stopScript: function() {
		this.stopped = true;
	},
	createScript: function() {

		var t = 0;
		var events = [];
		var that = this;
		function addEnemy(num) {
			if (num==undefined) {
				num = 1;
			}
			var i;
			for (i=0; i<num; i++) {
				that.enemies.push(that.createRandomEnemy());
			}
		}
		function addEvent(dt,action) {
			t += dt;
			events.push({ time: t, action: action });
		}
		function addLineup(waves) {
			var i,len=waves.length;
			var j;
			for (i=0; i<len; i++) {
				var w = waves[i];
				var dt = w[0];
				var count = w[1];

				addEvent(dt, addEnemy);

				dt = 0.75;
				for (j=1; j<count; j++) {
					addEvent(dt, addEnemy);
				}
			}
		}

		addLineup([
			[2, 1],
			[3, 2],
			[4, 3],
			[5, 4],
			[6, 5],
			[5, 6],
			[9, 2],
			[3, 3],
			[6, 4],
			[2, 8],
			[3, 3],
		]);

		this.script = new Ptero.TimedScript(events);
	},
	createRandomEnemy: function() {
		var enemyNames = Ptero.bounty.enemyNames;
		var enemyType = enemyNames[Math.floor(Math.random()*enemyNames.length)];
		var path = this.paths[Math.floor(Math.random()*this.paths.length)];
		return this.createEnemy(path,enemyType);
	},
	createEnemy: function(path, enemyType) {
		var state = {
			isAttack: true,
			enemyType: enemyType,
			points: path.models[0].points,
		};
		return Ptero.Enemy.fromState(state);
	},
	init: function() {
		// empty enemies list
		this.enemies.length = 0;

		this.script.init();
	},
	update: function(dt) {

		if (!this.stopped) {
			this.script.update(dt);
		}

		// update enemies
		var e,pos;
		var i,len=this.enemies.length;
		for (i=0; this.enemies[i];) {
			e = this.enemies[i];
			if (e.isDead) {
				// remove enemy if needed
				this.enemies.splice(i,1);
			}
			else {
				e.update(dt);
				pos = e.getPosition();
				if (pos) {
					Ptero.deferredSprites.defer(
						(function(e) {
							return function(ctx){
								e.draw(ctx);
							};
						})(e),
						pos.z);
				}
				i++;
			}
		}
	},
};

//////////////////////////////////////////////////////////////////////////////

Ptero.OverlordRandom = function(paths) {
	this.paths = paths;
	this.enemies = [];
};

Ptero.OverlordRandom.prototype = {
	draw: function(ctx) {
	},
	createRandomEnemy: function(age) {
		var enemyNames = Ptero.bounty.enemyNames;
		var enemyType;
		if (age == 'baby') {
			enemyType = enemyNames[Math.floor(Math.random()*2)];
		}
		else if (age == 'adult') {
			enemyType = enemyNames[Math.floor(Math.random()*2)+2];
		}
		else {
			enemyType = enemyNames[Math.floor(Math.random()*enemyNames.length)];
		}
		var path = this.paths[Math.floor(Math.random()*this.paths.length)];
		return this.createEnemy(path,enemyType);
	},
	createEnemy: function(path, enemyType) {
		var state = {
			isAttack: true,
			enemyType: enemyType,
			points: path.models[0].points,
		};
		return Ptero.Enemy.fromState(state);
	},
	getNextDelayTime: function() {
		var max = 7;
		var min = 2;
		var t = Math.floor(Math.random()*(max-min))+min;
		return t;
	},
	init: function() {
		// empty enemies list
		this.enemies.length = 0;

		// refresh countdown to enemy release
		this.time = this.getNextDelayTime();
	},
	update: function(dt) {

		this.time -= dt;
		if (this.time <= 0) {
			// add random enemy
			this.enemies.push(this.createRandomEnemy());
			
			// refresh countdown to enemy release
			this.time = this.getNextDelayTime();
		}

		// update enemies
		var e,pos;
		var i,len=this.enemies.length;
		for (i=0; this.enemies[i];) {
			e = this.enemies[i];
			if (e.isDead) {
				// remove enemy if needed
				this.enemies.splice(i,1);
			}
			else {
				e.update(dt);
				pos = e.getPosition();
				if (pos) {
					Ptero.deferredSprites.defer(
						(function(e) {
							return function(ctx){
								e.draw(ctx);
							};
						})(e),
						pos.z);
				}
				i++;
			}
		}
	},
};
