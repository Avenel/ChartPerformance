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

    this.init = function () {
    	// measures = [last, current, plan]
		this.measures = [ parseFloat(element.getAttribute("val_last")), 
	                     parseFloat(element.getAttribute("val_current")),
	                     parseFloat(element.getAttribute("val_plan")) ];

	    this.bullet_x = parseFloat(element.getAttribute("x"));
	    this.bullet_y = parseFloat(element.getAttribute("y"));

	    this.h = parseFloat(element.getAttribute("height"));

	    this.range = [0, parseFloat(element.getAttribute("max_width"))];

	    // traffic light ranges [red, yellow, green]
	    this.tl_range = [ parseFloat(element.getAttribute("range_green")),
	                    parseFloat(element.getAttribute("range_yellow")),
	                    parseFloat(element.getAttribute("range_red")) ]

	    // calc domain
	    var measurez = [this.measures[0], this.measures[1], this.measures[2]];
	    measurez.sort(d3.descending);
	    this.domain = [0, Math.max(this.tl_range[0], measurez[2])];
    };

	// calculate the width of a given value (linear scaling)
	this.calc_width = function (val) {
        var width = d3.scale.linear()
            .domain(this.domain)
            .range( this.range);
        return width(val);
    };

	this.draw = function () {
		// "traffic light" - green
		this.beginFill(0xEEEEEE);
        this.drawRect( this.bullet_x, this.bullet_y, this.calc_width(this.tl_range[0]), this.h);

        // "traffic light" - yellow
        this.beginFill(0xDDDDDD);
        this.drawRect( this.bullet_x, this.bullet_y, this.calc_width(this.tl_range[1]), this.h);

        // "traffic light" - red
        this.beginFill(0xCCCCCC);
        this.drawRect( this.bullet_x, this.bullet_y, this.calc_width(this.tl_range[2]), this.h);

        // plan val
        this.beginFill(0xB0C4DE);
        this.drawRect( this.bullet_x, this.bullet_y + (this.h * 0.25), this.calc_width(this.measures[2], this.range), this.h * 0.5);

        // current val
        this.beginFill(0x4682B4);
		this.drawRect( this.bullet_x, this.bullet_y + (this.h * 0.25), this.calc_width(this.measures[1], this.range), this.h * 0.5);

        // last val
        this.beginFill(0x000000);
        this.drawRect( this.calc_width(this.measures[0], this.range), this.bullet_y + this.h * 0.15, 2, this.h * 0.7);

        this.endFill();
	};

	// update values and redraw
	this.update = function () {
		this.init();
	};

	// draw chart
	this.init();
	this.draw();
}

// Set prototype object to the accordinate Pixi.js Graphics object 
ChartLib.Bullet.prototype = PIXI.Graphics.prototype;
ChartLib.Bullet.prototype.constructor = ChartLib.Bullet;
