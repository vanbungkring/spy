
Ptero.Fourier.TimePane = function(w,h,maxTime) {
	this.pixelW = w;
	this.pixelH = h;
	this.maxTime = maxTime;
	this.minTime = 0.25;

	this.timeStartX = 100;
	this.timeEndX = this.pixelW - 50;
	this.timeLenX = this.timeEndX - this.timeStartX;
	this.scale = this.timeLenX / maxTime;
	this.zoom(this.scale, 0, this.timeStartX);

	this.timeY = this.pixelH / 2;

	this.nodeRadius = 4;
	var that = this;
	window.addEventListener("keydown", function(e) {
		if (e.keyCode == 18) {
			that.isZoomPanKey = true;
		}
	});
	window.addEventListener("keyup", function(e) {
		if (e.keyCode == 18) {
			that.isZoomPanKey = false;
		}
	});
};

Ptero.Fourier.TimePane.prototype = {

	zoom: function(scale, pos, pixel) {
		this.scale = Math.max(5, scale);
		this.pos = pos;
		var p = Math.max(this.timeStartX, pixel);
		p = Math.min(this.timeEndX, p);
		this.origin = Math.max(0, pos - (p - this.timeStartX) / this.scale);
	},

	/* COORDINATE FUNCTIONS */

	getY: function(wave) {
		var len = Ptero.Fourier.wave_list.waves.length;
		var y;
		if (len == 1) {
			y = 0;
		}
		else {
			y = wave.order / (len-1) - 0.5;
			y = -y;
		}
		return y;
	},

	screenToTime: function(x,y) {
		x = Math.max(this.timeStartX, x);
		x = Math.min(this.timeEndX, x);
		x -= this.timeStartX;
		var t = x / this.scale + this.origin;
		return t;
	},

	timeToScreen: function(t) {
		return {
			x: (t-this.origin) * this.scale + this.timeStartX,
			y: this.timeY,
		};
	},

	getNodeInfoFromCursor: function(x,y) {
		var wave = Ptero.Fourier.wave;
		if (!wave) {
			return null;
		}

		var min_dist = 10;

		var pos;
		var dx,dy,dist_sq;
		var offset_x, offset_y;

		var pos = this.timeToScreen(wave.startTime);
		pos.y = this.transform({t:0,y:this.getY(wave)}).y;
		if (Math.abs(pos.y - y) > min_dist ||
			x < pos.x - min_dist) {
			return null;
		}

		pos = this.timeToScreen(wave.maxTime);
		if (pos.x + min_dist < x) {
			return null;
		}

		return {
			offset_time: this.screenToTime(x) - wave.startTime,
		};

	},

	selectNode: function(node) {
		if (node) {
			Ptero.Fourier.wave.select();
			this.selectedOffsetTime = node.offset_time;
			Ptero.Fourier.wave_list.setTime(Ptero.Fourier.wave.startTime+node.offset_time);
		}
		else {
			Ptero.Fourier.wave.deselect();
			this.selectedOffsetTime = null;
		}
	},

	updateNodePosition: function(x,y) {
		if (!Ptero.Fourier.wave.isSelected) {
			return;
		}

		var time = this.screenToTime(x) - this.selectedOffsetTime;
		time = Math.max(0, time);

		Ptero.Fourier.wave.setStartTime(time);
	},


	setFocusPoint: function(x) {
		this.pos = this.screenToTime(x);
	},

	isSeeking: function() {
		return !Ptero.Fourier.wave.isSelected;
	},
	stopSeek: function() {
		Ptero.Fourier.wave_list.isPaused = false;
	},


	freezeAt: function(x) {
		var t = this.screenToTime(x);
		t = Math.max(0, t);
		t = Math.min(t, Ptero.Fourier.wave_list.maxTime);
		Ptero.Fourier.wave_list.setTime(t);
		Ptero.Fourier.wave_list.isPaused = true;
	},

	mouseStart: function(x,y) {
		if (this.isZoomPanKey) {
			this.isPanning = true;
			this.setFocusPoint(x);
		}
		else {
			this.isPanning = false;
			var node = this.getNodeInfoFromCursor(x,y);
			this.selectNode(node);

			if (this.isSeeking()) {
				this.freezeAt(x);
			}

			// make sure all enemies are alive and visible
			Ptero.Fourier.wave_list.resetWaves();
		}
	},
	mouseMove: function(x,y) {
		if (this.isPanning) {
			this.zoom(this.scale, this.pos, x);
		}
		else {
			this.updateNodePosition(x,y);
			this.freezeAt(x);

			// make sure all enemies are alive and visible
			Ptero.Fourier.wave_list.resetWaves();
		}
	},
	mouseEnd: function(x,y) {
		this.isPanning = false;
		if (this.isSeeking()) {
			this.stopSeek();
		}
	},
	mouseScroll: function(x,y,delta,deltaX,deltaY) {
		if (this.isZoomPanKey) {
			this.setFocusPoint(x);

			// from: http://stackoverflow.com/questions/2916081/zoom-in-on-a-point-using-scale-and-translate
			var scale = Math.pow(1 + Math.abs(deltaY)/4 , deltaY > 0 ? 1 : -1);

			this.scale *= scale;
			this.zoom(this.scale, this.pos, x);
		}
	},

	/* PAINTER FUNCTIONS */

	transform: function(pos) {
		// Input: pos.t, pos.y
		var s = this.timeToScreen(pos.t);
		var y = pos.y;
		var result = {
			x: s.x,
			y: (-y * this.pixelH/2) + this.pixelH/2,
		};
		return result;
	},
	moveTo: function(ctx,pos) {
		var p = this.transform(pos);
		ctx.moveTo(p.x,p.y);
	},
	lineTo: function(ctx,pos) {
		var p = this.transform(pos);
		ctx.lineTo(p.x,p.y);
	},
	line: function(ctx, p1, p2) {
		ctx.beginPath();
		this.moveTo(ctx, p1);
		this.lineTo(ctx, p2);
		ctx.stroke();
	},
	lines: function(ctx, points) {
		var i,len;
		ctx.beginPath();
		this.moveTo(ctx, points[0]);
		for (i=1,len=points.length; i<len; i++) {
			this.lineTo(ctx, points[i]);
		}
		ctx.closePath();
		ctx.stroke();
	},
	fillCircle: function(ctx, spacePos, radius, color) {
		ctx.beginPath();
		var pos = this.transform(spacePos);
		ctx.arc(pos.x, pos.y, radius, 0, Math.PI*2);
		ctx.fillStyle = color;
		ctx.fill();
	},
	strokeCircle: function(ctx, spacePos, radius, color, thickness) {
		ctx.beginPath();
		var pos = this.transform(spacePos);
		ctx.arc(pos.x, pos.y, radius, 0, Math.PI*2);
		ctx.lineWidth = thickness;
		ctx.strokeStyle = color;
		ctx.stroke();
	},

	/* DRAWING FUNCTIONS */

	drawAxes: function(ctx) {
		ctx.strokeStyle = "#444";
		ctx.lineWidth = 1;

		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.font = '1em serif';
		ctx.fillStyle = "#777";
		var s = {
			x: this.timeStartX,
			y: this.pixelH/2,
		};
		ctx.fillText('time (s)', s.x/2, s.y);
		ctx.fillText(Ptero.Fourier.wave_list.time.toFixed(2), s.x/2, s.y+20);

		ctx.save();
		ctx.beginPath();
		ctx.rect(this.timeStartX-this.nodeRadius, 0, this.timeLenX+2*this.nodeRadius, this.pixelH);
		ctx.clip();

		ctx.textBaseline = 'top';
		ctx.fillStyle = "#BBB";
		ctx.font = '0.8em serif';
		var h = 0.5;
		var startT = Math.ceil(this.origin);
		for (t=startT; t<=startT+this.timeLenX/this.scale; t++) {
			this.line(ctx,
				{t:t, y: h},
				{t:t, y: -h});
			s = this.transform({t:t, y: -h});
			ctx.fillText(t, s.x, s.y+5);
		}

		ctx.strokeStyle = Ptero.Fourier.wave_list.isEditing ? "#F00" : "#0FF";
		ctx.lineWidth = 2;
		var t = Ptero.Fourier.wave_list.time;
		this.line(ctx,
			{t:t, y: h},
			{t:t, y: -h});

	},

	drawWave: function(ctx, wave) {
		var isActive = (wave == Ptero.Fourier.wave && wave.isSelected);
		ctx.strokeStyle = isActive ? "#F00" : "#FFF";
		ctx.lineWidth = (Ptero.Fourier.wave == wave) ? 4 : 2;
		var y = this.getY(wave);
		ctx.lineCap = "round";
		this.line(ctx,
			{t:wave.startTime, y:y},
			{t:wave.maxTime, y:y});
	},

	/* MAIN FUNCTIONS */

	draw: function(ctx) {
		ctx.fillStyle = "#222";
		ctx.fillRect(0,0,this.pixelW,this.pixelH);
		this.drawAxes(ctx);

		var waves = Ptero.Fourier.wave_list.waves;
		var i,len=waves.length;
		var e;
		if (len > 1) {
			ctx.globalAlpha = 0.35;
			for (i=0; i<len; i++) {
				var e = waves[i];
				if (e != Ptero.Fourier.wave) {
					this.drawWave(ctx, e);
				}
			}
			ctx.globalAlpha = 1;
		}

		e = Ptero.Fourier.wave;
		if (e) {
			this.drawWave(ctx, e);
		}

		// remove clipping
		ctx.restore();
	},
	update: function(dt) {
	},
	init: function() {
	},
};
