/**
 * @license
 * chartLib.js - v0.001
 * Copyright (c) 2014-2015, Martin Briewig
 *
 * This is a library for charts. It uses d3.js for data-binding and pixi.js for rendering.
 * 
 */

var ChartLib = ChartLib || {};

/**
 * Bullet Chart, introduced by Stephen Few
 */
ChartLib.Bullet = function (element) {
	console.log(element);

	// inherit Pixi.js Graphics object
	PIXI.Graphics.apply(this, arguments);
	this.type = "bullet";

	// make the graphic interactive..
    this.interactive = true;
	
    // bind element 
	this.element = element;

	// flag for updateAnimation
	this.animate = true;


    this.init = function (element) {
    	// measures = [last, current, plan]
		this.measures = [ parseFloat(element.getAttribute("val_last")), 
	                     parseFloat(element.getAttribute("val_current")),
	                     parseFloat(element.getAttribute("val_plan")) ];

        // device pixel ratio stuff
        this._scale = parseFloat(element.getAttribute("scale"));

       	// have to use underscore as a prefix due to weired issues (perhaps value was overidden by another call....)
	    this._x = parseFloat(element.getAttribute("x")) * this._scale;
	    this._y = parseFloat(element.getAttribute("y")) * this._scale;
	    this._height = parseFloat(element.getAttribute("height")) * this._scale;

	    // Title
    	this._title = element.getAttribute("title");

    	// Title of bullet
    	if (!this._titleNode) {
    		this._titleWidth = parseFloat(element.getAttribute("title_width")) * this._scale;
			this._titleNode = new PIXI.Text(this._title, {font: (0.05 * this._height) + "em sans-serif", fill:"black", 
															wordWrap: true, wordWrapWith: this._titleWidth, align:"right"});

			// calculate textposition
			this._titleNode.position.x = this._x + (this._titleWidth - this._titleNode.width);
			this._titleNode.position.y = (this._y + (this._height/2)) - (this._titleNode.height / 2);

			// calc new x pos for bullet graphics
			this._bullet_x = this._x + this._titleWidth + 10;
			this.removeChild(this._titleNode);
			this.addChild(this._titleNode);
		}

	    // actual bullet width of current val (graphic attribute, does not correspond to the value)
	    this._width = parseFloat(element.getAttribute("width"));

	    this.range = [0, parseFloat(element.getAttribute("max_width")) * this._scale - this._titleWidth];

	    // traffic light ranges [red, yellow, green]
	    this.tl_range = [ parseFloat(element.getAttribute("range_green")),
	                    parseFloat(element.getAttribute("range_yellow")),
	                    parseFloat(element.getAttribute("range_red")) ]

	    // calc domain
	    var measurez = [this.measures[0], this.measures[1], this.measures[2]];
	    measurez.sort(d3.descending);
	    this.domain = [0, Math.max(this.tl_range[0], measurez[2])];

	    // calc axis
    	this._axisScale = d3.scale.linear()
	            	.domain(this.domain)
                	.range( this.range);

        var _arguments = [8];
    	this.tickFormat = this._axisScale.tickFormat.apply(this.scale, _arguments);
    	this.ticks = this._axisScale.ticks.apply(this._axisScale, _arguments);

	    // set animate to true, because there is new data in town!
	    this.animate = true;	    
    };

	// calculate the width of a given value (linear scaling)
	this.calc_width = function (val) {
        var width = d3.scale.linear()
            .domain(this.domain)
            .range( this.range);
        return Math.floor(width(val));
    };

	this.draw = function () {
		this.clear();

		// "traffic light" - green
		this.beginFill(0xEEEEEE);
        this.drawRect( this._bullet_x, this._y, this.calc_width(this.tl_range[0]), this._height);

        // "traffic light" - yellow
        this.beginFill(0xDDDDDD);
        this.drawRect( this._bullet_x, this._y, this.calc_width(this.tl_range[1]), this._height);

        // "traffic light" - red
        this.beginFill(0xCCCCCC);
        this.drawRect( this._bullet_x, this._y, this.calc_width(this.tl_range[2]), this._height);

        // plan val
        this.beginFill(0xB0C4DE);
        this.drawRect( this._bullet_x, this._y + (this._height * 0.25), this.calc_width(this.measures[2], this.range), this._height * 0.5);

        // current val
        this.beginFill(0x4682B4);
		this.drawRect( this._bullet_x, this._y + (this._height * 0.25), this.calc_width(this._width, this.range), this._height * 0.5);

        // last val
        this.beginFill(0x000000);
        this.drawRect( this._bullet_x + this.calc_width(this.measures[0], this.range), this._y + this._height * 0.15, 2, this._height * 0.7);

		this.endFill();

        // axis
        var steps = this.ticks.length;
        for (var i = 0; i < steps; i++) {
			this.beginFill(0xCCCCCC);
        	this.drawRect( this._bullet_x + this.calc_width(this.ticks[i], this.range) - 1, this._y + this._height, 2, this._height * 0.2);

        	// only add text once (+1  'cause of title node)
        	if (this.children.length < steps + 1) { 
				var text = new PIXI.Text(this.ticks[i], {font: (0.05 * this._height) + "em sans-serif", fill:"black"});
				text.position.x = Math.floor(this._bullet_x + this.calc_width(this.ticks[i], this.range) - (text.width / 2));
				text.position.y = Math.floor(this._y + this._height * 1.2);
				this.addChild(text);
			};
        }

	};

	// update values and redraw
	this.update = function (element) {
		this.init(element);
		this.draw();
	};

	// draw chart
	this.init(element);

	this.draw();
}

// Set prototype object to the accordinate Pixi.js Graphics object 
ChartLib.Bullet.prototype = PIXI.Graphics.prototype;
ChartLib.Bullet.prototype.constructor = ChartLib.Bullet;
