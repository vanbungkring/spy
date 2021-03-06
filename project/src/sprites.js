/*

Here we define structures for managing various sprites.

*/
Ptero.SpriteFont = function(img,dict) {
	this.chars = dict.chars;
	this.scale = dict.scale || 1;
	this.lineHeight = dict.lineHeight;
	this.img = img;
};

Ptero.SpriteFont.prototype = {
	getTextWidth: function(text) {
		var w = 0;
		var i,len=text.length;
		var c;
		for (i=0; i<len; i++) {
			c = this.chars[text[i]];
			if (c) {
				w += (i == len-1) ? Math.max(c.width, c.xadvance) : c.xadvance;
			}
		}
		return w;
	},
	draw: function(ctx, text, billboard, pos, align) {
		// FIXME: only uppercase for fonts that need it
		text = text.toUpperCase();

		if (typeof text != "string") {
			text = text.toString();
		}

		if (align == "left") {
			text = " "+text;
		}
		else if (align == "right") {
			text = text+" ";
		}

		var textWidth = this.getTextWidth(text);
		var textHeight = this.lineHeight*1.5;
		var textScale = (billboard.h*billboard.scale) / (textHeight*this.scale);

		ctx.save();
		billboard.transform(ctx, pos);
		var x,y;
		if (align == "left") {
			ctx.translate(0, billboard.h/2);
			ctx.scale(textScale, textScale);
			x = 0;
		}
		else if (align == "right") {
			ctx.translate(billboard.w, billboard.h/2);
			ctx.scale(textScale, textScale);
			x = -textWidth;
		}
		else if (align == "center") {
			ctx.translate(billboard.w/2, billboard.h/2);
			ctx.scale(textScale, textScale);
			x = -textWidth/2;
		}
		y = -this.lineHeight/2;
		var originX = 0;
		var c;
		var sx,sy,sw,sh;
		var dx,dy,dw,dh;
		var i,len=text.length;
		for (i=0; i<len; i++) {
			c = this.chars[text[i]];
			if (!c) {
				continue;
			}
			sx = c.x;
			sy = c.y;
			sw = dw = c.width;
			sh = dh = c.height;
			dx = x + c.xoffset;
			dy = y + c.yoffset;
			if (sw > 0 && sh > 0) { // needs a nonzero size
				ctx.drawImage(this.img, sx,sy,sw,sh, dx,dy,dw,dh);
			}
			x += c.xadvance; // should we add xoffset to this?
		}
		ctx.restore();
	},
};

Ptero.VectorSprite = function(dict) {

	var vectorPathData = dict.vectorPathData;
	this.isShape = vectorPathData.shapeCompatible;
	this.paths = vectorPathData.paths;

	// Create a preset shape that Cocoon's HTML5 Path API allows for fast vector drawing.
	if (navigator.isCocoonJS && this.isShape) {
		var i,len=this.paths.length;
		this.shape = new Shape();
		for (i=0; i<len; i++) {
			var path = new Path();
			this.paths[i](path);
			// compensate for cocoon's erroneous doubling of line width
			if (path.lineWidth) {
				path.lineWidth /= 2;
			}
			this.shape.addPath(path);
		}
	}

	this.width = dict.width;
	this.height = dict.height;

	if (dict.centerX == undefined) dict.centerX = 0.5;
	if (dict.centerY == undefined) dict.centerY = 0.5;

	var centerX = this.width * dict.centerX;
	var centerY = this.height * dict.centerY;

	this.billboard = new Ptero.Billboard(
		centerX,
		centerY,
		this.width,
		this.height,
		(dict.scale || 1));
}

Ptero.VectorSprite.prototype = {
	isPixelInside: function(pos,x,y) {
		if (!this.paths) {
			return;
		}

		var ctx = Ptero.screen.getCtx();

		ctx.save();
		this.billboard.transform(ctx, pos);

		var isInside = false;
		var i,len=this.paths.length;
		for (i=0; i<len; i++) {
			this.paths[i](ctx);
			if (ctx.isPointInPath(x,y)) {
				isInside = true;
				break;
			}
		}

		ctx.restore();

		return isInside;
	},
	draw: function(ctx,pos,color) {

		if (this.sprite) {
			// draw bitmap (see assets.js:postProcessVector)
			if (this.redSprite && color == 'red') {
				this.redSprite.draw(ctx,pos);
			}
			else if (this.whiteSprite && color == 'white') {
				this.whiteSprite.draw(ctx,pos);
			}
			else {
				this.sprite.draw(ctx,pos);
			}
		}
		else {
			// draw vector
			ctx.save();
			this.billboard.transform(ctx, pos);

			if (this.shape) {
				ctx.fillShape(this.shape);
			}
			else if (this.paths) {
				var i,len=this.paths.length;
				for (i=0; i<len; i++) {
					ctx.save();
					this.paths[i](ctx);
					if (ctx.strokeStyle) {
						ctx.stroke();
					}
					ctx.fill();
					ctx.restore();
				}
			}

			ctx.restore();
		}
	},
};

Ptero.Sprite = function(img,dict) {
	this.img = img;

	if (dict.centerX == undefined) dict.centerX = 0.5;
	if (dict.centerY == undefined) dict.centerY = 0.5;

	var centerX = img.width * dict.centerX;
	var centerY = img.height * dict.centerY;
	this.billboard = new Ptero.Billboard(
		centerX,
		centerY,
		img.width,
		img.height,
		(dict.scale || 1));
};

Ptero.Sprite.prototype = {
	draw: function(ctx,pos) {
		Ptero.painter.drawImage(
			ctx,
			this.img,
			pos,
			this.billboard
		);
	},
	drawBorder: function(ctx,pos,color,handle) {
		Ptero.painter.drawBorder(ctx,pos,color,this.billboard,handle);
	},
};

Ptero.SpriteTable = function(img,dict) {
	this.img = img;
	this.scale = dict.scale || 1;

	this.rows = dict.rows;
	this.cols = dict.cols;
	this.frames = dict.frames;
	this.fps = dict.fps;

	this.tileWidth = img.width / this.cols;
	this.tileHeight = img.height / this.rows;

	if (dict.centerX == undefined) dict.centerX = 0.5;
	if (dict.centerY == undefined) dict.centerY = 0.5;
	var tileCenterX = this.tileWidth * dict.centerX;
	var tileCenterY = this.tileHeight * dict.centerY;
	this.billboard = new Ptero.Billboard(
		tileCenterX,
		tileCenterY,
		this.tileWidth,
		this.tileHeight,
		this.scale);
};

Ptero.SpriteTable.prototype = {
	draw: function(ctx,pos,frame) {
		var row = Math.floor(frame / this.cols);
		var col = frame % this.cols;
		var sx = col * this.tileWidth;
		var sy = row * this.tileHeight;
		var sw = this.tileWidth;
		var sh = this.tileHeight;
		Ptero.painter.drawImageFrame(
			ctx,
			this.img,
			pos,
			sx,sy,sw,sh,
			this.billboard
		);
	},
	drawBorder: function(ctx,pos,color,handle) {
		Ptero.painter.drawBorder(ctx,pos,color,this.billboard,handle);
	},
};

Ptero.SpriteMosaic = function(img,dict) {
	this.img = img;
	this.frames = dict.mosaic;
	this.scale = dict.scale || 1;

	// one billboard for each frame
	this.billboards = {};

	// get image names
	this.frame_names = []
	var frame;
	for (key in this.frames) {
		if (this.frames.hasOwnProperty(key)) {

			this.frame_names.push(key);

			frame = this.frames[key];

			// create billboard for this frame
			var w = frame.origSize.width;
			var h = frame.origSize.height;
			var centerX = w * (frame.centerX == undefined ? 0.5 : frame.centerX);
			var centerY = h * (frame.centerY == undefined ? 0.5 : frame.centerY);
			this.billboards[key] = new Ptero.Billboard(centerX,centerY,w,h,this.scale);
		}
	}
	this.frame_names.sort()
	console.log(this.frame_names);

	this.numFrames = this.frame_names.length;
	this.fps = dict.fps || 10;

	// initialize billboard state
	this.billboard = this.billboards[this.frame_names[0]];
};

Ptero.SpriteMosaic.prototype = {
	getFrameSpaceRects: function(pos,frame_name) {
		var rects = [];
		var tiles = this.frames[frame_name].tiles;
		var i, numTiles = tiles.length, tile;
		for (i=0; i<numTiles; i++) {
			tile = tiles[i];
			rects.push(this.billboards[frame_name].getTileSpaceRect(
				pos, tile.origX, tile.origY, tile.w, tile.h));
		}
		return rects;
	},
	draw: function(ctx,pos,frame_name) {

		// set appropriate billboard
		this.billboard = this.billboards[frame_name];

		var frame = this.frames[frame_name];
		var size = frame.origSize;

		var tiles = frame.tiles;
		var i,numTiles = tiles.length;
		var sx,sy,w,h,dx,dy;
		var tile;
		for (i=0; i<numTiles; i++) {
			tile = tiles[i];

			sx = tile.x;
			sy = tile.y;
			w = tile.w;
			h = tile.h;
			dx = tile.origX;
			dy = tile.origY;

			Ptero.painter.drawImageFrameToSubRegion( ctx,
				this.img,
				pos,
				sx,sy,w,h,
				this.billboard,
				dx,dy);
		}
	},
};

Ptero.AnimSprite = function(dict) {
	if (dict.table) {
		this.table = dict.table;
		this.frameDuration = 1/this.table.fps;
		this.totalDuration = this.frameDuration * this.table.frames;
	}
	else if (dict.mosaic) {
		this.mosaic = dict.mosaic;
		this.frameDuration = 1/this.mosaic.fps;
		this.totalDuration = this.frameDuration * this.mosaic.numFrames;
	}
	else if (dict.vectorAnim) {
		this.vectorAnim = dict.vectorAnim;
		this.frameDuration = 1/this.vectorAnim.fps;
		this.totalDuration = this.frameDuration * this.vectorAnim.frames.length;
	}

	this.time = 0;
	this.frame = 0;

	this.animating = true;
	this.repeat = true;
};

Ptero.AnimSprite.prototype = {
	isPixelInside: function(pos,x,y) {
		if (this.vectorAnim) {
			var name = this.vectorAnim.frames[this.frame];
			var result = Ptero.assets.vectorSprites[name].isPixelInside(pos,x,y);
			return result;
		}
		else {
			return this.getBillboard().isInsideScreenRect(x,y,pos);
		}
	},
	shuffleTime: function() {
		this.time = Math.random()*this.totalDuration;
	},
	start: function start() {
		this.animating = true;
	},
	restart: function restart() {
		this.reset();
		this.start();
	},
	stop: function stop() {
		this.animating = false;
	},
	reset: function reset() {
		this.time = 0;
	},
	setRepeat: function setRepeat(on) {
		this.repeat = on;
	},
	setFinishCallback: function setFinishCallback(callback) {
		this.onFinish = callback;
	},
	isDone: function isDone() {
		return (this.time >= this.totalDuration);
	},
	update: function update(dt) {
		if (!this.animating) {
			return;
		}

		this.time += dt;
		if (this.time >= this.totalDuration) {
			this.onFinish && this.onFinish();
			if (!this.repeat) {
				this.stop();
				return;
			}
		}

		this.time %= this.totalDuration;
		this.frame = Math.floor(this.time / this.frameDuration);
	},
	draw: function(ctx,pos,frame) {
		if (frame == undefined) {
			frame = this.frame;
		}
		if (this.table) {
			this.table.draw(ctx,pos,frame);
		}
		else if (this.mosaic) {
			this.mosaic.draw(ctx,pos,this.mosaic.frame_names[frame]);
		}
		else if (this.vectorAnim) {
			var name = this.vectorAnim.frames[frame];
			Ptero.assets.vectorSprites[name].draw(ctx,pos);
		}
	},
	drawBorder: function(ctx,pos,color,handle) {
		if (this.table) {
			this.table.drawBorder(ctx,pos,color,handle);
		}
	},
	getBillboard: function() {
		if (this.table) {
			return this.table.billboard;
		}
		else if (this.mosaic) {
			return this.mosaic.billboard;
		}
		else if (this.vectorAnim) {
			var name = this.vectorAnim.frames[this.frame];
			return Ptero.assets.vectorSprites[name].billboard;
		}
	},
};

// Deferred sprites allow for drawing the sprites in a correct order.
// This allows closer sprites to be drawn over those further away.
Ptero.deferredSprites = (function(){
	var sprites=[];
	var len=0;
	function clear() {
		sprites.length = 0;
		len = 0;
	};
	function defer(draw,z) {
		sprites[len++] = {draw:draw, z:z};
	};
	function finalize() {
		sprites.sort(function(a,b) { return b.z - a.z; });
	};
	function draw(ctx) {
		var i;
		for (i=0; i<len; i++) {
			sprites[i].draw(ctx);
		}
	};
	return {
		clear: clear,
		defer: defer,
		finalize: finalize,
		draw: draw,
	};
})();

