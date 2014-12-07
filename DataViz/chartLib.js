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

       	// have to use underscore as a prefix due to weired issues (perhaps value was overidden by another call....)
	    this._x = parseFloat(element.getAttribute("x"));
	    this._y = parseFloat(element.getAttribute("y"));
	    this._height = parseFloat(element.getAttribute("height"));

	    // actual bullet width of current val
	    this._width = parseFloat(element.getAttribute("width"));

	    this.range = [0, parseFloat(element.getAttribute("max_width"))];

	    // traffic light ranges [red, yellow, green]
	    this.tl_range = [ parseFloat(element.getAttribute("range_green")),
	                    parseFloat(element.getAttribute("range_yellow")),
	                    parseFloat(element.getAttribute("range_red")) ]

	    // calc domain
	    var measurez = [this.measures[0], this.measures[1], this.measures[2]];
	    measurez.sort(d3.descending);
	    this.domain = [0, Math.max(this.tl_range[0], measurez[2])];

	    // set animate to true, because there is new data in town!
	    this.animate = true;
    };

	// calculate the width of a given value (linear scaling)
	this.calc_width = function (val) {
        var width = d3.scale.linear()
            .domain(this.domain)
            .range( this.range);
        return width(val);
    };

	this.draw = function () {
		this.clear();

		// "traffic light" - green
		this.beginFill(0xEEEEEE);
        this.drawRect( this._x, this._y, this.calc_width(this.tl_range[0]), this._height);

        // "traffic light" - yellow
        this.beginFill(0xDDDDDD);
        this.drawRect( this._x, this._y, this.calc_width(this.tl_range[1]), this._height);

        // "traffic light" - red
        this.beginFill(0xCCCCCC);
        this.drawRect( this._x, this._y, this.calc_width(this.tl_range[2]), this._height);

        // plan val
        this.beginFill(0xB0C4DE);
        this.drawRect( this._x, this._y + (this._height * 0.25), this.calc_width(this.measures[2], this.range), this._height * 0.5);

        // current val
        this.beginFill(0x4682B4);
		this.drawRect( this._x, this._y + (this._height * 0.25), this.calc_width(this._width, this.range), this._height * 0.5);

        // last val
        this.beginFill(0x000000);
        this.drawRect( this.calc_width(this.measures[0], this.range), this._y + this._height * 0.15, 2, this._height * 0.7);

		this.endFill();

        // axis
        var rel = (this.range[1] / this.domain[1])
        var steps = (rel > 8)? 8 : rel;
        steps = (steps < 5)? 5 : steps;
        var step = this.domain[1] / steps;
        for (var i = 0; i < steps; i++) {
			this.beginFill(0x000000);
        	this.drawRect( this.calc_width(step*i, this.range), this._y + this._height, 1, this._height * 0.2);

        	// only add text once
        	if (this.children.length < steps) { 
				var text = new PIXI.Text((step*i).toFixed(1), {font: 0.45 * this._height + "px Arial", fill:"black"});
				text.position.x = this.calc_width(step*i, this.range);
				text.position.y = this._y + this._height * 1.3;
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
