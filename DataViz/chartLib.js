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
* Horizontal TargetGraph, introduced by Kohlhammer et al.
*/
ChartLib.HorizontalTargetGraph = function (element) {
	// inherit Pixi.js Graphics object
	PIXI.Graphics.apply(this, arguments);
	this.type = "horizontalTargetGraph";

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
		this._pxs = parseFloat(element.getAttribute("pxs")) * this._scale;

		// have to use underscore as a prefix due to weired issues (perhaps value will be overidden by another call....)
		this._x = parseFloat(element.getAttribute("x")) * this._scale;
		this._y = parseFloat(element.getAttribute("y")) * this._scale;
		this._height = parseFloat(element.getAttribute("height")) * this._scale;
		// Title
		this._title = element.getAttribute("title");

		// Title of TargetGraph
		if (!this._titleNode) {
			this._titleWidth = parseFloat(element.getAttribute("title_width")) * this._scale;
			this._titleNode = new PIXI.Text(this._title, {font: (this._pxs) + "px arial", fill:"black",
			wordWrap: true, wordWrapWith: this._titleWidth, align:"right"});

			// calculate textposition
			this._titleNode.position.x = this._x + (this._titleWidth - this._titleNode.width);
			this._titleNode.position.y = (this._y + (this._height/2)) - (this._titleNode.height / 2);

			// calc new x pos for TargetGraph graphics
			this._targetGraph_x = this._x + this._titleWidth + 0.3*pxs;
			this.addChild(this._titleNode);
		}

		// actual TargetGraph width of current val (graphic attribute, does not correspond to the value)
		this._width = parseFloat(element.getAttribute("width"));

		// max width of bar: max graphical width - width of valuetext
		this.max_width = (parseFloat(element.getAttribute("max_width")) * this._scale) - 3*this._pxs;

		this.range = [0, this.max_width - this._titleWidth];

		// traffic light ranges [red, yellow, green]
		this.tl_range = [ parseFloat(element.getAttribute("range_green")),
		parseFloat(element.getAttribute("range_yellow")),
		parseFloat(element.getAttribute("range_red")) ]

		// calc domain
		var measurez = [this.measures[0], this.measures[1], this.measures[2]];
		measurez.sort(d3.descending);

		this.domain_min = parseFloat(element.getAttribute("domain_min"));
		this.domain_max = parseFloat(element.getAttribute("domain_max"));
		this.domain = [this.domain_min, this.domain_max];

		// calc axis
		this._axisScale = d3.scale.linear()
		.domain(this.domain)
		.range( this.range);

		var _arguments = [8];
		this.tickFormat = this._axisScale.tickFormat.apply(this.scale, _arguments);
		this.ticks = this._axisScale.ticks.apply(this._axisScale, _arguments);

		// value of current value
		if (!this._valueNode) {
			this._valueNode = new PIXI.Text(this.measures[1], {font: (this._pxs ) + "px arial", fill:"black"});
			this._valueNode.position.x = this._targetGraph_x + this.calc_width(this.domain_max) + 0.3*this._pxs;
			this._valueNode.position.y = (this._y + (this._height/2)) - (this._valueNode.height / 2);
			this.addChild(this._valueNode);
		}

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
		this.beginFill(0xEFEFEF);
		this.drawRect( this._targetGraph_x, this._y, this.calc_width(this.domain_max), this._height);

		// "traffic light" - yellow
		this.beginFill(0xC3C3C3);
		this.drawRect( this._targetGraph_x, this._y, this.calc_width(this.tl_range[1]), this._height);

		// "traffic light" - red
		this.beginFill(0x999999);
		this.drawRect( this._targetGraph_x, this._y, this.calc_width(this.tl_range[2]), this._height);

		// plan val
		this.beginFill(0x000000);
		this.drawRect( this._targetGraph_x + this.calc_width(this.measures[2], this.range), this._y + this._height * 0.15, 3, this._height * 0.7);

		// current val
		this.beginFill(0x000000);
		this.drawRect( this._targetGraph_x, this._y + (this._height * 0.25), this.calc_width(this._width, this.range), this._height * 0.5);

		// last val
		this.beginFill(0x333333);
		this.drawCircle( this._targetGraph_x + this.calc_width(this.measures[0], this.range), this._y + (this._height/2), this._height * 0.3);

		this.endFill();
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
ChartLib.HorizontalTargetGraph.prototype = PIXI.Graphics.prototype;
ChartLib.HorizontalTargetGraph.prototype.constructor = ChartLib.HorizontalTargetGraph;

/**
* Vertical TargetGraph, introduced by Kohlhammer et al.
*/
ChartLib.VerticalTargetGraph = function (element) {
	// inherit Pixi.js Graphics object
	PIXI.Graphics.apply(this, arguments);
	this.type = "verticalTargetGraph";

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
		this._pxs = parseFloat(element.getAttribute("pxs")) * this._scale;

		// have to use underscore as a prefix due to weired issues (perhaps value will be overidden by another call....)
		this._x = parseFloat(element.getAttribute("x")) * this._scale;
		this._y = parseFloat(element.getAttribute("y")) * this._scale;

		// actual TargetGraph height of current val (graphic attribute, does not correspond to the value)
		this._height = parseFloat(element.getAttribute("height")) ;
		this._width = parseFloat(element.getAttribute("width")) * this._scale;

		// Title
		this._title = element.getAttribute("title");

		// calc new x pos for TargetGraph graphics
		this._targetGraph_y = this._y - (this._pxs * 0.3);

		// Title of TargetGraph
		if (!this._titleNode) {
			this._titleWidth = parseFloat(element.getAttribute("title_width")) * this._scale;
			this._titleNode = new PIXI.Text(this._title, {font: this._pxs + "px arial", fill:"black",
			wordWrap: true, wordWrapWith: this._titleWidth, align:"center"});

			// calculate textposition
			this._titleNode.position.x = this._x + this._width/2 - (this._titleNode.width / 2);
			this._titleNode.position.y = this._y ;

			this.addChild(this._titleNode);
		}

		this.max_height = (parseFloat(element.getAttribute("max_height")) * this._scale) - 1.3*this._pxs;
		this.range = [0, this.max_height];

		// traffic light ranges [red, yellow, green]
		this.tl_range = [ parseFloat(element.getAttribute("range_green")),
		parseFloat(element.getAttribute("range_yellow")),
		parseFloat(element.getAttribute("range_red")) ]

		// calc domain
		var measurez = [this.measures[0], this.measures[1], this.measures[2]];
		measurez.sort(d3.descending);

		this.domain_min = parseFloat(element.getAttribute("domain_min"));
		this.domain_max = parseFloat(element.getAttribute("domain_max"));
		this.domain = [this.domain_min, this.domain_max];

		// calc axis
		this._axisScale = d3.scale.linear()
		.domain(this.domain)
		.range( this.range);

		var _arguments = [8];
		this.tickFormat = this._axisScale.tickFormat.apply(this.scale, _arguments);
		this.ticks = this._axisScale.ticks.apply(this._axisScale, _arguments);

		// value of current value
		if (!this._valueNode) {
			this._valueNode = new PIXI.Text(this.measures[1], {font: (this._pxs) + "px arial", fill:"black"});
			this._valueNode.position.y = this._targetGraph_y - this.calc_height(this.domain_max) - 1.3*this._pxs;
			this._valueNode.position.x = (this._x + (this._width/2)) - (this._valueNode.width / 2);
			this.addChild(this._valueNode);
			console.log(this._valueNode);
		}

		// set animate to true, because there is new data in town!
		this.animate = true;
	};

	// calculate the width of a given value (linear scaling)
	this.calc_height = function (val) {
		var height = d3.scale.linear()
		.domain(this.domain)
		.range( this.range);
		return Math.floor(height(val));
	};

	this.draw = function () {
		this.clear();

		// "traffic light" - green
		this.beginFill(0xEFEFEF);
		this.drawRect( this._x, this._targetGraph_y, this._width, -this.calc_height(this.domain_max) );

		// "traffic light" - yellow
		this.beginFill(0xC3C3C3);
		this.drawRect( this._x, this._targetGraph_y, this._width, -this.calc_height(this.tl_range[1]));

		// "traffic light" - red
		this.beginFill(0x999999);
		this.drawRect( this._x, this._targetGraph_y, this._width, -this.calc_height(this.tl_range[2]));

		// plan val
		this.beginFill(0x000000);
		this.drawRect( this._x + this._width*0.15, this._targetGraph_y - this.calc_height(this.measures[2], this.range), this._width * 0.7, 3);

		// current val
		this.beginFill(0x000000);
		this.drawRect( this._x + (this._width * 0.25), this._targetGraph_y, this._width * 0.5, -this.calc_height(this._height, this.range));

		// last val
		this.beginFill(0x333333);
		this.drawCircle( this._x + (this._width/2), this._targetGraph_y - this.calc_height(this.measures[0], this.range), this._width * 0.3);

		this.endFill();
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
ChartLib.VerticalTargetGraph.prototype = PIXI.Graphics.prototype;
ChartLib.VerticalTargetGraph.prototype.constructor = ChartLib.VerticalTargetGraph;

/**
* Bar Chart
*/
ChartLib.BarChart = function (element) {
	// inherit Pixi.js Graphics object
	PIXI.Graphics.apply(this, arguments);
	this.type = "barChart";

	// make the graphic interactive..
	this.interactive = true;

	// bind element
	this.element = element;

	// flag for updateAnimation
	this.animate = true;

	this.init = function (element) {
		// device pixel ratio stuff
		this._scale = parseFloat(element.getAttribute("scale"));
		this._pxs = parseFloat(element.getAttribute("pxs")) * this._scale;

		// have to use underscore as a prefix due to weired issues (perhaps value will be overidden by another call....)
		this._x = parseFloat(element.getAttribute("x")) * this._scale;
		this._y = parseFloat(element.getAttribute("y")) * this._scale;

		// actual TargetGraph height of current val (graphic attribute, does not correspond to the value)
		this._height = parseFloat(element.getAttribute("height")) * this._scale;
		this._width = parseFloat(element.getAttribute("width")) * this._scale;

		// Title
		this._title = element.getAttribute("title");

		// Title of TargetGraph
		if (!this._titleNode) {
			this._titleWidth = parseFloat(element.getAttribute("title_width")) * this._scale;
			this._titleNode = new PIXI.Text(this._title, {font: (this._pxs) + "px arial", fill:"black",
			wordWrap: true, wordWrapWith: this._titleWidth, align:"right"});

			// calculate textposition
			this._titleNode.position.x = this._x + (this._titleWidth - this._titleNode.width);
			this._titleNode.position.y = (this._y + (this._height/2)) - (this._titleNode.height / 2);

			// calc new x pos for TargetGraph graphics
			this._targetGraph_x = this._x + this._titleWidth + 0.3*this._pxs;
			this.addChild(this._titleNode);
		}

		// actual TargetGraph width of current val (graphic attribute, does not correspond to the value)
		this._width = parseFloat(element.getAttribute("width"));

		// max width of bar: max graphical width - width of valuetext
		this.max_width = (parseFloat(element.getAttribute("max_width")) * this._scale) - 3*this._pxs;

		this.range = [0, this.max_width - this._titleWidth];

		// calculate domain
		this.domain_min = parseFloat(element.getAttribute("domain_min"));
		this.domain_max = parseFloat(element.getAttribute("domain_max"));
		this.domain = [this.domain_min, this.domain_max];

		// calc axis
		this._axisScale = d3.scale.linear()
		.domain(this.domain)
		.range( this.range);

		// value of current value
		this._value = parseFloat(element.getAttribute("value"));
		if (!this._valueNode) {
			this._valueNode = new PIXI.Text(this._value, {font: (this._pxs ) + "px arial", fill:"black"});
			this._valueNode.position.x = this._targetGraph_x + this.calc_width(this._width) + 0.3*this._pxs;
			this._valueNode.position.y = (this._y + (this._height/2)) - (this._valueNode.height / 2);
			this.addChild(this._valueNode);
		}

		// set animate to true, because there is new data in town!
		this.animate = true;
	}

	// calculate the width of a given value (linear scaling)
	this.calc_width = function (val) {
		var width = d3.scale.linear()
		.domain(this.domain)
		.range( this.range);
		return Math.floor(width(val));
	};

	this.draw = function () {
		this.clear();

		// current val
		this.beginFill(0x000000);
		this.drawRect( this._targetGraph_x, this._y, this.calc_width(this._width, this.range), this._height);
		this.endFill();

		this._valueNode.position.x = this._targetGraph_x + this.calc_width(this._width) + 0.3*this._pxs;
	}

	this.update = function (element) {
		this.init(element);
		this.draw();
	}

	this.init(element);
	this.draw();
}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.BarChart.prototype = PIXI.Graphics.prototype;
ChartLib.BarChart.prototype.constructor = ChartLib.BarChart;

/**
* Column Chart
*/
ChartLib.ColumnChart = function (element) {
	// inherit Pixi.js Graphics object
	PIXI.Graphics.apply(this, arguments);
	this.type = "columnChart";

	// make the graphic interactive..
	this.interactive = true;

	// bind element
	this.element = element;

	// flag for updateAnimation
	this.animate = true;

	this.init = function (element) {
		// device pixel ratio stuff
		this._scale = parseFloat(element.getAttribute("scale"));
		this._pxs = parseFloat(element.getAttribute("pxs")) * this._scale;

		// have to use underscore as a prefix due to weired issues (perhaps value will be overidden by another call....)
		this._x = parseFloat(element.getAttribute("x")) * this._scale;
		this._y = parseFloat(element.getAttribute("y")) * this._scale;

		// actual TargetGraph height of current val (graphic attribute, does not correspond to the value)
		this._width = parseFloat(element.getAttribute("width")) * this._scale;
		this._height = parseFloat(element.getAttribute("height"));

		// Title
		this._title = element.getAttribute("title");

		// calc new x pos for TargetGraph graphics
		this._targetGraph_y = this._y - (this._pxs * 0.3);

		// Title of TargetGraph
		if (!this._titleNode) {
			this._titleWidth = parseFloat(element.getAttribute("title_width")) * this._scale;
			this._titleNode = new PIXI.Text(this._title, {font: this._pxs + "px arial", fill:"black",
			wordWrap: true, wordWrapWith: this._titleWidth, align:"center"});

			// calculate textposition
			this._titleNode.position.x = this._x + this._width/2 - (this._titleNode.width / 2);
			this._titleNode.position.y = this._y ;

			this.addChild(this._titleNode);
		}

		// max width of bar: max graphical width - width of valuetext
		this.max_height = (parseFloat(element.getAttribute("max_height")) * this._scale) - 1*this._pxs;

		this.range = [0, this.max_height];

		// calculate domain
		this.domain_min = parseFloat(element.getAttribute("domain_min"));
		this.domain_max = parseFloat(element.getAttribute("domain_max"));
		this.domain = [this.domain_min, this.domain_max];

		// calc axis
		this._axisScale = d3.scale.linear()
		.domain(this.domain)
		.range( this.range);

		// value of current value
		this._value = parseFloat(element.getAttribute("value"));
		if (!this._valueNode) {
			this._valueNode = new PIXI.Text(this._value, {font: (this._pxs) + "px arial", fill:"black"});
			this._valueNode.position.y = this._targetGraph_y - this.calc_height(this._height) - 1.3*this._pxs;
			this._valueNode.position.x = (this._x + (this._width/2)) - (this._valueNode.width / 2);
			this.addChild(this._valueNode);
		}

		// set animate to true, because there is new data in town!
		this.animate = true;
	}

	// calculate the width of a given value (linear scaling)
	this.calc_height = function (val) {
		var height = d3.scale.linear()
		.domain(this.domain)
		.range( this.range);
		return Math.floor(height(val));
	};

	this.draw = function () {
		this.clear();

		// current val
		this.beginFill(0x000000);
		this.drawRect( this._x, this._targetGraph_y, this._width, -this.calc_height(this._height, this.range));
		this.endFill();

		this._valueNode.position.y = this._targetGraph_y - this.calc_height(this._height) - 1.3*this._pxs;
	}

	this.update = function (element) {
		this.init(element);
		this.draw();
	}

	this.init(element);
	this.draw();
}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.ColumnChart.prototype = PIXI.Graphics.prototype;
ChartLib.ColumnChart.prototype.constructor = ChartLib.ColumnChart;

/**
* Stacked Column Chart
*/
ChartLib.StackedColumnChart = function (element) {
	// inherit Pixi.js Graphics object
	PIXI.Graphics.apply(this, arguments);
	this.type = "stackedColumnChart";

	// make the graphic interactive..
	this.interactive = true;

	// bind element
	this.element = element;

	// flag for updateAnimation
	this.animate = true;

	this.init = function (element) {
		// device pixel ratio stuff
		this._scale = parseFloat(element.getAttribute("scale"));
		this._pxs = parseFloat(element.getAttribute("pxs")) * this._scale;

		// have to use underscore as a prefix due to weired issues (perhaps value will be overidden by another call....)
		this._x = parseFloat(element.getAttribute("x")) * this._scale;
		this._y = parseFloat(element.getAttribute("y")) * this._scale;

		// actual TargetGraph height of current val (graphic attribute, does not correspond to the value)
		this._width = parseFloat(element.getAttribute("width")) * this._scale;
		this._height = parseFloat(element.getAttribute("height"));

		// Title
		this._title = element.getAttribute("title");

		// calc new x pos for TargetGraph graphics
		this._targetGraph_y = this._y - (this._pxs * 0.3);

		// Title of TargetGraph
		if (!this._titleNode) {
			this._titleWidth = parseFloat(element.getAttribute("title_width")) * this._scale;
			this._titleNode = new PIXI.Text(this._title, {font: this._pxs + "px arial", fill:"black",
			wordWrap: true, wordWrapWith: this._titleWidth, align:"center"});

			// calculate textposition
			this._titleNode.position.x = this._x + this._width/2 - (this._titleNode.width / 2);
			this._titleNode.position.y = this._y ;

			this.addChild(this._titleNode);
		}

		// max width of bar: max graphical width - width of valuetext
		this.max_height = (parseFloat(element.getAttribute("max_height")) * this._scale) - 1*this._pxs;

		this.range = [0, this.max_height];

		// calculate domain
		this.domain_min = parseFloat(element.getAttribute("domain_min"));
		this.domain_max = parseFloat(element.getAttribute("domain_max"));
		this.domain = [this.domain_min, this.domain_max];

		// calc axis
		this._axisScale = d3.scale.linear()
		.domain(this.domain)
		.range( this.range);

		// calc new x pos for TargetGraph graphics
		this._targetGraph_y = this._y - (this._width * 0.3);

		// values
		this._values = element.getAttribute("values").split(",");
		if (!this._valueNodes) {
			this._valueNodes = new Array();
			this._values_sum = 0;
			for (var i=0; i<this._values.length; i++) {
				var columnColor = 0x000000 + i*0x333333;
				var textColor = (columnColor < 0x666666)? "grey" : "black";
				var valueNode = new PIXI.Text(this._values[i], {font: (this._pxs) + "px arial", fill:textColor});
				valueNode.position.y = this._targetGraph_y - this.calc_height(this._height) - 1.3*this._pxs;
				valueNode.position.x = (this._x + (this._width/2)) - (valueNode.width / 2);

				// ommit too small column heights, cause text will not fit in properly
				if (valueNode.height < this.calc_height(this._values[i]) - 1*this._pxs) {
					this.addChild(valueNode);
				}
				this._valueNodes[i] = valueNode;
				this._values_sum += parseFloat(this._values[i]);
			}
		}

		// set animate to true, because there is new data in town!
		this.animate = true;
	};

	// calculate the width of a given value (linear scaling)
	this.calc_height = function (val) {
		var height = d3.scale.linear()
		.domain(this.domain)
		.range( this.range);
		return Math.floor(height(val));
	};

	this.draw = function() {
		this.clear();

		// current val
		var current_height = 0;
		for (var i=0; i<this._values.length; i++) {
			this.beginFill(0x000000 + i*0x333333);
			var relHeight = (this._values[i] / this._values_sum) * this._height;
			this.drawRect( this._x, this._targetGraph_y - current_height, this._width, -this.calc_height(relHeight, this.range));
			this.endFill();

			this._valueNodes[i].position.y = this._targetGraph_y - current_height - this.calc_height(relHeight) +
																				this.calc_height(relHeight)/2 - this._valueNodes[i].height/2;
			current_height += this.calc_height((this._values[i] / this._values_sum) * this._height);
		}
	};

	this.update = function(element) {
		this.init(element);
		this.draw();
	};

	this.init(this.element);
	this.draw();
}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.StackedColumnChart.prototype = PIXI.Graphics.prototype;
ChartLib.StackedColumnChart.prototype.constructor = ChartLib.StackedColumnChart;

/**
* Stacked Bar Chart
*/
ChartLib.StackedBarChart = function (element) {
	// inherit Pixi.js Graphics object
	PIXI.Graphics.apply(this, arguments);
	this.type = "stackedBarChart";

	// make the graphic interactive..
	this.interactive = true;

	// bind element
	this.element = element;

	// flag for updateAnimation
	this.animate = true;

	this.init = function (element) {
		// device pixel ratio stuff
		this._scale = parseFloat(element.getAttribute("scale"));
		this._pxs = parseFloat(element.getAttribute("pxs")) * this._scale;

		// have to use underscore as a prefix due to weired issues (perhaps value will be overidden by another call....)
		this._x = parseFloat(element.getAttribute("x")) * this._scale;
		this._y = parseFloat(element.getAttribute("y")) * this._scale;

		// actual TargetGraph height of current val (graphic attribute, does not correspond to the value)
		this._width = parseFloat(element.getAttribute("width")) * this._scale;
		this._height = parseFloat(element.getAttribute("height")) * this._scale;

		// Title
		this._title = element.getAttribute("title");
		// Title of TargetGraph
		if (!this._titleNode) {
			this._titleWidth = parseFloat(element.getAttribute("title_width")) * this._scale;
			this._titleNode = new PIXI.Text(this._title, {font: (this._pxs) + "px arial", fill:"black",
			wordWrap: true, wordWrapWith: this._titleWidth, align:"right"});

			// calculate textposition
			this._titleNode.position.x = this._x + (this._titleWidth - this._titleNode.width);
			this._titleNode.position.y = (this._y + (this._height/2)) - (this._titleNode.height / 2);

			// calc new x pos for TargetGraph graphics
			this._targetGraph_x = this._x + this._titleWidth + 0.3*pxs;
			this.addChild(this._titleNode);
		}

		// actual TargetGraph width of current val (graphic attribute, does not correspond to the value)
		this._width = parseFloat(element.getAttribute("width"));

		// max width of bar: max graphical width - width of valuetext
		this.max_width = (parseFloat(element.getAttribute("max_width")) * this._scale) - 3*this._pxs;

		this.range = [0, this.max_width - this._titleWidth];

		// calculate domain
		this.domain_min = parseFloat(element.getAttribute("domain_min"));
		this.domain_max = parseFloat(element.getAttribute("domain_max"));
		this.domain = [this.domain_min, this.domain_max];

		// calc axis
		this._axisScale = d3.scale.linear()
		.domain(this.domain)
		.range( this.range);

		// values
		this._values = element.getAttribute("values").split(",");
		if (!this._valueNodes) {
			this._valueNodes = new Array();
			this._values_sum = 0;
			for (var i=0; i<this._values.length; i++) {
				var columnColor = 0x000000 + i*0x333333;
				var textColor = (columnColor < 0x666666)? "grey" : "black";
				var valueNode = new PIXI.Text(this._values[i], {font: (this._pxs) + "px arial", fill:textColor});
				valueNode.position.x = this._targetGraph_x - this.calc_width(this._width) - 1.3*this._pxs;
				valueNode.position.y = (this._y + (this._height/2)) - (valueNode.height / 2);

				// ommit too small column heights, cause text will not fit in properly
				if (valueNode.width < this.calc_width(this._values[i]) - 1*this._pxs) {
					this.addChild(valueNode);
				}
				this._valueNodes[i] = valueNode;
				this._values_sum += parseFloat(this._values[i]);
			}
		}

		// set animate to true, because there is new data in town!
		this.animate = true;
	}

	// calculate the width of a given value (linear scaling)
	this.calc_width = function (val) {
		var width = d3.scale.linear()
		.domain(this.domain)
		.range( this.range);
		return Math.floor(width(val));
	};


	this.draw = function() {
		this.clear();

		// current val
		var current_width = 0;
		for (var i=0; i<this._values.length; i++) {
			this.beginFill(0x000000 + i*0x333333);
			var relWidth = (this._values[i] / this._values_sum) * this._width;
			this.drawRect( this._targetGraph_x + current_width, this._y, this.calc_width(relWidth, this.range), this._height);
			this.endFill();

			this._valueNodes[i].position.x = this._targetGraph_x + current_width + this.calc_width(relWidth)/2 - this._valueNodes[i].width/2;
			current_width += this.calc_width((this._values[i] / this._values_sum) * this._width);
		}
	};

	this.update = function(element) {
		this.init(element);
		this.draw();
	};

	this.init(this.element);
	this.draw();

}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.StackedBarChart.prototype = PIXI.Graphics.prototype;
ChartLib.StackedBarChart.prototype.constructor = ChartLib.StackedBarChart;

/**
* Grouped Column Chart
*/
ChartLib.GroupedColumnChart = function (element) {
	// inherit Pixi.js Graphics object
	PIXI.Graphics.apply(this, arguments);
	this.type = "groupedColumnChart";

	// make the graphic interactive..
	this.interactive = true;

	// bind element
	this.element = element;

	// flag for updateAnimation
	this.animate = true;

	this.init = function (element) {
		// device pixel ratio stuff
		this._scale = parseFloat(element.getAttribute("scale"));
		this._pxs = parseFloat(element.getAttribute("pxs")) * this._scale;

		// have to use underscore as a prefix due to weired issues (perhaps value will be overidden by another call....)
		this._x = parseFloat(element.getAttribute("x")) * this._scale;
		this._y = parseFloat(element.getAttribute("y")) * this._scale;

		// actual TargetGraph height of current val (graphic attribute, does not correspond to the value)
		this._width = parseFloat(element.getAttribute("width")) * this._scale;
		this._height = parseFloat(element.getAttribute("height")) * this._scale;

		// Title
		this._title = element.getAttribute("title");

		// calc new x pos for TargetGraph graphics
		this._targetGraph_y = this._y - (this._pxs * 0.3);

		// Title of TargetGraph
		if (!this._titleNode) {
			this._titleWidth = parseFloat(element.getAttribute("title_width")) * this._scale;
			this._titleNode = new PIXI.Text(this._title, {font: this._pxs + "px arial", fill:"black",
			wordWrap: true, wordWrapWith: this._titleWidth, align:"center"});

			// calculate textposition
			this._titleNode.position.x = this._x + this._width/2 - (this._titleNode.width / 2);
			this._titleNode.position.y = this._y ;

			this.addChild(this._titleNode);
		}

		// max width of bar: max graphical width - width of valuetext
		this.max_height = (parseFloat(element.getAttribute("max_height")) * this._scale) - 1*this._pxs;

		this.range = [0, this.max_height];

		// calculate domain
		this.domain_min = parseFloat(element.getAttribute("domain_min"));
		this.domain_max = parseFloat(element.getAttribute("domain_max"));
		this.domain = [this.domain_min, this.domain_max];

		// calc axis
		this._axisScale = d3.scale.linear()
		.domain(this.domain)
		.range( this.range);

		// values
		this._values = element.getAttribute("values").split(",");
		// category category width
		this._categoryWidth = this._width / this._values.length;
		if (!this._valueNodes) {
			this._valueNodes = new Array();
			this._values_sum = 0;
			for (var i=0; i<this._values.length; i++) {
				var textColor = "black";
				var valueNode = new PIXI.Text(this._values[i], {font: (this._pxs) + "px arial", fill:textColor});
				valueNode.position.y = this._targetGraph_y;
				valueNode.position.x = (this._x + i*this._categoryWidth + (this._categoryWidth/2)) - (valueNode.width / 2);

				// ommit too small column heights, cause text will not fit in properly
				if (valueNode.width < this._width/this._values[i].length) {
					this.addChild(valueNode);
				}
				this._valueNodes[i] = valueNode;
				this._values_sum += parseFloat(this._values[i]);
			}
		}

		// set animate to true, because there is new data in town!
		this.animate = true;
	};

	// calculate the width of a given value (linear scaling)
	this.calc_height = function (val) {
		var height = d3.scale.linear()
		.domain(this.domain)
		.range( this.range);
		return Math.floor(height(val));
	};

	this.draw = function (element) {
		this.clear();

		// current val
		var current_width = 0;
		for (var i=0; i<this._values.length; i++) {
			this.beginFill(0x000000 + i*0x333333);
			var relHeight = (this._values[i] / this._values_sum) * this._height;
			this.drawRect( this._x + current_width, this._targetGraph_y, this._categoryWidth, -this.calc_height(relHeight, this.range));
			this.endFill();

			this._valueNodes[i].position.y = this._targetGraph_y - this.calc_height(relHeight) - this._valueNodes[i].height - 0.3*this._pxs;
			current_width += this._categoryWidth;
		}
	};

	this.update = function (element) {
		this.init(element);
		this.draw();
	};

	this.init(element);
	this.draw();

}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.GroupedColumnChart.prototype = PIXI.Graphics.prototype;
ChartLib.GroupedColumnChart.prototype.constructor = ChartLib.GroupedColumnChart;

/**
* Grouped Bar Chart
*/
ChartLib.GroupedBarChart = function (element) {
	// inherit Pixi.js Graphics object
	PIXI.Graphics.apply(this, arguments);
	this.type = "groupedBarChart";

	// make the graphic interactive..
	this.interactive = true;

	// bind element
	this.element = element;

	// flag for updateAnimation
	this.animate = true;

	this.init = function (element) {
		// device pixel ratio stuff
		this._scale = parseFloat(element.getAttribute("scale"));
		this._pxs = parseFloat(element.getAttribute("pxs")) * this._scale;

		// have to use underscore as a prefix due to weired issues (perhaps value will be overidden by another call....)
		this._x = parseFloat(element.getAttribute("x")) * this._scale;
		this._y = parseFloat(element.getAttribute("y")) * this._scale;

		// actual TargetGraph height of current val (graphic attribute, does not correspond to the value)
		this._width = parseFloat(element.getAttribute("width")) * this._scale;
		this._height = parseFloat(element.getAttribute("height")) * this._scale;

		// Title
		this._title = element.getAttribute("title");

		// Title of TargetGraph
		if (!this._titleNode) {
			this._titleWidth = parseFloat(element.getAttribute("title_width")) * this._scale;
			this._titleNode = new PIXI.Text(this._title, {font: (this._pxs) + "px arial", fill:"black",
			wordWrap: true, wordWrapWith: this._titleWidth, align:"right"});

			// calculate textposition
			this._titleNode.position.x = this._x + (this._titleWidth - this._titleNode.width);
			this._titleNode.position.y = (this._y + (this._height/2)) - (this._titleNode.height / 2);

			// calc new x pos for Graph graphics
			this._targetGraph_x = this._x + this._titleWidth + 0.3*pxs;
			this.addChild(this._titleNode);
		}

		// actual TargetGraph width of current val (graphic attribute, does not correspond to the value)
		this._width = parseFloat(element.getAttribute("width"));

		// max width of bar: max graphical width - width of valuetext
		this.max_width = (parseFloat(element.getAttribute("max_width")) * this._scale) - 3*this._pxs;

		this.range = [0, this.max_width - this._titleWidth];

		// calculate domain
		this.domain_min = parseFloat(element.getAttribute("domain_min"));
		this.domain_max = parseFloat(element.getAttribute("domain_max"));
		this.domain = [this.domain_min, this.domain_max];

		// calc axis
		this._axisScale = d3.scale.linear()
		.domain(this.domain)
		.range( this.range);

		// values
		this._values = element.getAttribute("values").split(",");
		this._categoryHeight = this._height / this._values.length;
		if (!this._valueNodes) {
			this._valueNodes = new Array();
			this._values_sum = 0;
			for (var i=0; i<this._values.length; i++) {
				var columnColor = 0x000000 + i*0x333333;
				var textColor = "black";
				var valueNode = new PIXI.Text(this._values[i], {font: (this._pxs) + "px arial", fill:textColor});
				valueNode.position.x = this._targetGraph_x;
				valueNode.position.y = (this._y + i*this._categoryHeight + (this._categoryHeight/2)) - (valueNode.height / 2);

				// ommit too small bar heights, cause text will not fit in properly
				if (valueNode.height < this._categoryHeight) {
					this.addChild(valueNode);
				}
				this._valueNodes[i] = valueNode;
				this._values_sum += parseFloat(this._values[i]);
			}
		}

		// set animate to true, because there is new data in town!
		this.animate = true;
	}

	// calculate the width of a given value (linear scaling)
	this.calc_width = function (val) {
		var width = d3.scale.linear()
		.domain(this.domain)
		.range( this.range);
		return Math.floor(width(val));
	};

	this.draw = function (element) {
		this.clear();

		// current val
		var current_height = 0;
		for (var i=0; i<this._values.length; i++) {
			this.beginFill(0x000000 + i*0x333333);
			var relWidth = (this._values[i] / this._values_sum) * this._width;
			this.drawRect( this._targetGraph_x, this._y + current_height, this.calc_width(relWidth, this.range), this._categoryHeight);
			this.endFill();

			this._valueNodes[i].position.x = this._targetGraph_x + this.calc_width(relWidth) + 0.3*this._pxs;
			current_height += this._categoryHeight;
		}
	};

	this.update = function(element) {
		this.init(element);
		this.draw();
	};

	this.init(this.element);
	this.draw();


}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.GroupedBarChart.prototype = PIXI.Graphics.prototype;
ChartLib.GroupedBarChart.prototype.constructor = ChartLib.GroupedBarChart;
