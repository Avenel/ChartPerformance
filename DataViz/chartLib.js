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
* TextPosition Enum
*/
var TextPositionEnum = Object.freeze({
			INNER: 0, LEFT: 1, RIGHT: 2, TOP: 3, BOTTOM: 4
		});

/**
* Basic Chart "class".
*/
ChartLib.BasicChart = function(element) {

	// inherit Pixi.js Graphics object
	PIXI.Graphics.apply(this, arguments);
	this._type = "basicChart";

	// make the graphic interactive..
	this._interactive = true;

	// bind element
	this._element = element;

	// flag for updateAnimation
	this._animate = true;

	this.initDefault = function(element) {
		this._element = element;

		// device pixel ratio stuff
		this._scale = parseFloat(element.getAttribute("scale"));
		this._pxs = parseFloat(element.getAttribute("pxs")) * this._scale;

		// have to use underscore as a prefix due to weired issues (perhaps value
		// will be overidden by another call....)
		this._x = parseFloat(element.getAttribute("x")) * this._scale;
		this._y = parseFloat(element.getAttribute("y")) * this._scale;

		// width, height of chart
		this._width = parseFloat(element.getAttribute("width"));
		this._height = parseFloat(element.getAttribute("height"));

		// Title
		this._title = element.getAttribute("title");

		// domain
		this._domain_min = parseFloat(element.getAttribute("domain_min"));
		this._domain_max = parseFloat(element.getAttribute("domain_max"));
		this._domain = [this._domain_min, this._domain_max];

		// add container for category labels
		this._categoryLabelContainer = new PIXI.DisplayObjectContainer();
		this.addChild(this._categoryLabelContainer);
	}

}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.BasicChart.prototype = PIXI.Graphics.prototype;
ChartLib.BasicChart.prototype.constructor = ChartLib.BasicChart;

/**
* Update values and redraw.
*/
ChartLib.BasicChart.prototype.update = function (element) {
	this.init(element);
	this.draw();
};

/**
* Toogle Animation on and off, render one more time.
*/
ChartLib.BasicChart.prototype.toggleAnimate = function () {
	this._animate = !this._animate;
	this.update(this._element);
}

/**
* Draw method each chart should override.
* draw()
*/


/**
* Basic Horizontal "class" - inherits BasicChart
* Axis is vertical, but shapes grow horizontal
*/
ChartLib.BasicHorizontalChart = function (element) {
	ChartLib.BasicChart.apply(this);
	this.type = "basicHorizontalChart";

	this.initHorizontalChart = function (element) {
		// call super init
		this.initDefault(element);

		// current width of chart, necessary for animating transitions
		this._currentWidth = parseFloat(element.getAttribute("current_width"));

		// scale categoryHeight
		this._categoryHeight = parseFloat(element.getAttribute("category_height")) * this._scale;

		// category label width
		this._categoryLabelWidth = parseFloat(element.getAttribute("category_label_width")) * this._scale;

		// calc x pos for chart axis
		this._axis_x = this._x + this._categoryLabelWidth + 0.3 * this._pxs;

		// category labels
		if (!this._categoryLabels) {
			this._categoryLabels = new Array();

			for (var child = element.firstChild; child; child = child.nextSibling) {
				var categoryName = child.getAttribute("category_name");
				var categoryLabel = new PIXI.Text(categoryName, {font: (this._pxs) + "px arial", fill:"black",
				wordWrap: false, wordWrapWith: this._categoryLabelWidth, align:"right"});

				// calculate textposition
				categoryLabel.position.x = this._x + (this._categoryLabelWidth - categoryLabel.width);

				var yPos = parseFloat(child.getAttribute("y")) * this._scale;
				categoryLabel.position.y = (yPos + (this._categoryHeight/2)) - (categoryLabel.height / 2);

				this._categoryLabels[this._categoryLabels.length] = categoryLabel;
				this._categoryLabelContainer.addChild(categoryLabel);
			}
		}

		// max width of bar: max graphical width - width of valuetext
		this._max_width = (parseFloat(element.getAttribute("max_width")) * this._scale) - 3*this._pxs;

		// calc axis
		this._range = [0, this._max_width - this._categoryLabelWidth];
		this._axisScale = d3.scale.linear()
			.domain(this._domain)
			.range( this._range);



		// axis ticks
		var _arguments = [8];
		this._tickFormat = this._axisScale.tickFormat.apply(this._scale, _arguments);
		this._ticks = this._axisScale.ticks.apply(this._axisScale, _arguments);
	}
}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.BasicHorizontalChart.prototype = Object.create( ChartLib.BasicChart.prototype );
ChartLib.BasicHorizontalChart.prototype.constructor = ChartLib.BasicHorizontalChart;


/**
* Basis Vertical "class" - inherits BasicChart
* Axis is horizontal, but shapes grow vertical
*/
ChartLib.BasicVerticalChart = function (element) {
	ChartLib.BasicChart.apply(this);
	this.type = "basicVerticalChart";

	this.initVerticalChart = function (element) {
		// call super init
		this.initDefault(element);

		// current height of chart, necessary for animating transitions
		this._currentHeight = parseFloat(element.getAttribute("current_height"));

		// scale categoryWidth
		this._categoryWidth = parseFloat(element.getAttribute("category_width")) * this._scale;

		// calc y pos for Chart axis
		this._axis_y = this._y - (this._pxs * 1.3);

		// category label width
		this._categoryLabelWidth = parseFloat(element.getAttribute("category_label_width")) * this._scale;

		// category labels
		if (!this._categoryLabels) {
			this._categoryLabels = new Array();

			for (var child = this._element.firstChild; child; child = child.nextSibling) {
				var categoryName = child.getAttribute("category_name");
				var categoryLabel = new PIXI.Text(categoryName, {font: this._pxs + "px arial", fill:"black",
				wordWrap: true, wordWrapWith: this._categoryLabelWidth, align:"center"});

				// calculate textposition
				var xPos = parseFloat(child.getAttribute("x")) * this._scale;
				categoryLabel.position.x = xPos + this._categoryWidth/2 - (categoryLabel.width / 2);
				categoryLabel.position.y = this._y - this._pxs;

				this._categoryLabels[this._categoryLabels.length] = categoryLabel;
				this._categoryLabelContainer.addChild(categoryLabel);
			}
		}

		// max height of bar: max graphical height
		this._max_height = (parseFloat(element.getAttribute("max_height")) * this._scale) - 2*this._pxs;

		// calc axis
		this._range = [0, this._max_height];
		this._axisScale = d3.scale.linear()
			.domain(this._domain)
			.range( this._range);

		// axis ticks
		var _arguments = [8];
		this.tickFormat = this._axisScale.tickFormat.apply(this.scale, _arguments);
		this.ticks = this._axisScale.ticks.apply(this._axisScale, _arguments);
	}
}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.BasicVerticalChart.prototype = Object.create( ChartLib.BasicChart.prototype );
ChartLib.BasicVerticalChart.prototype.constructor = ChartLib.BasicVerticalChart;


/**
* Horizontal TargetGraph - graphical object
*/
ChartLib.HorizontalTargetGraph = function(x, y, last, current, plan, red, yellow, green, max_width, height, valueLabel, pxs) {

	// inherit Pixi.js Graphics object
	PIXI.Graphics.apply(this, arguments);

	this._x = x;
	this._y = y;
	this._last = last;
	this._current = current;
	this._plan = plan;
	this._red = red;
	this._yellow = yellow;
	this._green = green;
	this._max_width = max_width;
	this._height = height;

	this._valueLabel = valueLabel;
	this.addChild(valueLabel);

	this._pxs = pxs;

	this.draw = function () {
		this.clear();

		// "traffic light" - green
		this.beginFill(0xEFEFEF);
		this.drawRect( this._x, this._y, this._max_width, this._height);

		// "traffic light" - yellow
		this.beginFill(0xC3C3C3);
		this.drawRect( this._x, this._y, this._yellow, this._height);

		// "traffic light" - red
		this.beginFill(0x999999);
		this.drawRect( this._x, this._y, this._red, this._height);

		// plan val
		this.beginFill(0x000000);
		this.drawRect( this._x + this._plan, this._y + this._height * 0.15, 3, this._height * 0.7);

		// current val
		this.beginFill(0x000000);
		this.drawRect( this._x, this._y + (this._height * 0.25), this._current, this._height * 0.5);

		// last val
		this.beginFill(0x333333);
		this.drawCircle( this._x + this._last, this._y + (this._height/2), this._height * 0.4);

		this.endFill();
	};

	this.update = function(val_current) {
		this._current = val_current;
		this.draw();
	};

	this.update(current);
}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.HorizontalTargetGraph.prototype = PIXI.Graphics.prototype;
ChartLib.HorizontalTargetGraph.prototype.constructor = ChartLib.HorizontalTargetGraph;

/**
* Horizontal TargetGraphChart, introduced by Kohlhammer et al.
*/
ChartLib.HorizontalTargetGraphChart = function (element) {

	ChartLib.BasicHorizontalChart.apply(this);
	this.type = "horizontalTargetGraph";

	this.init = function (element) {
		// call super init
		this.initHorizontalChart(element);

		if (!this.horizontalTGContainer) {
			this.horizontalTGContainer = new PIXI.DisplayObjectContainer();
			this.addChild(this.horizontalTGContainer);


			// values
			for (var child = element.firstChild; child; child = child.nextSibling) {
				// measures = [last, current, plan]
				var measures = [ 	parseFloat(child.getAttribute("val_last")),
													parseFloat(child.getAttribute("val_current")),
													parseFloat(child.getAttribute("val_plan")) ];

				// traffic light ranges [red, yellow, green]
				var tl_range = [ parseFloat(child.getAttribute("range_red")),
													parseFloat(child.getAttribute("range_yellow")),
													parseFloat(child.getAttribute("range_green")) ]

				var barWidth = this._axisScale(measures[1]);
				var barY = parseFloat(child.getAttribute("y")) * this._scale;
				var currentBarWidth = (measures[1] > this._currentWidth)? this._axisScale(this._currentWidth) : barWidth;

				// value label
				var valueLabel = new PIXI.Text(measures[1], {font: (this._pxs ) + "px arial", fill:"black"});
				valueLabel.position.x = this._axis_x + this._axisScale(this._domain[1]) + 0.3*this._pxs;
				valueLabel.position.y = (barY + (this._categoryHeight/2)) - (valueLabel.height / 2);

				// create TG
				var last = this._axisScale(measures[0]);
				var current = this._axisScale(measures[1]);
				var plan = this._axisScale(measures[2]);
				var red = this._axisScale(tl_range[0]);
				var yellow = this._axisScale(tl_range[1]);
				var green = this._axisScale(tl_range[2]);
				// x, y, last, current, plan, green, yellow, red, max_width, height, valueLabel, pxs
				var horizontalTG = new ChartLib.HorizontalTargetGraph(this._axis_x, barY, last, currentBarWidth, plan,
																red, yellow, green, this._axisScale(this._domain[1]), this._categoryHeight, valueLabel, this._pxs);
				this.horizontalTGContainer.addChild(horizontalTG);
			}
		}
	};

	this.draw = function () {
		// update TG
		var i=0;
		for (var child = this._element.firstChild; child; child = child.nextSibling) {
			var val_current = parseFloat(child.getAttribute("val_current"));
			var barWidth = this._axisScale(val_current);
			var currentBarWidth = (val_current > this._currentWidth)? this._axisScale(this._currentWidth) : barWidth;


			this.horizontalTGContainer.children[i].update(currentBarWidth);
			i++;
		}
	};

	this.init(element);
	this.draw();
}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.HorizontalTargetGraphChart.prototype = Object.create( ChartLib.BasicHorizontalChart.prototype );
ChartLib.HorizontalTargetGraphChart.prototype.constructor = ChartLib.HorizontalTargetGraphChart;

/**
* Vertical TargetGraph - graphical object
*/
ChartLib.VerticalTargetGraph = function(x, y, last, current, plan, red, yellow, green, max_height, width, valueLabel, pxs) {

	// inherit Pixi.js Graphics object
	PIXI.Graphics.apply(this, arguments);

	this._x = x;
	this._y = y;
	this._last = last;
	this._current = current;
	this._plan = plan;
	this._red = red;
	this._yellow = yellow;
	this._green = green;
	this._max_height = max_height;
	this._width = width;

	this._valueLabel = valueLabel;
	this.addChild(valueLabel);

	this._pxs = pxs;

	this.draw = function() {
		this.clear();

		// "traffic light" - green
		this.beginFill(0xEFEFEF);
		this.drawRect( this._x, this._y, this._width, -this._max_height );

		// "traffic light" - yellow
		this.beginFill(0xC3C3C3);
		this.drawRect( this._x, this._y, this._width, -this._yellow);

		// "traffic light" - red
		this.beginFill(0x999999);
		this.drawRect( this._x, this._y, this._width, -this._red);

		// plan val
		this.beginFill(0x000000);
		this.drawRect( this._x + this._width*0.15, this._y - this._plan, this._width * 0.7, 3);

		// current val
		this.beginFill(0x000000);
		this.drawRect( this._x + (this._width * 0.25), this._y, this._width * 0.5, -this._current);

		// last val
		this.beginFill(0x333333);
		this.drawCircle( this._x + (this._width/2), this._y - this._last, this._width * 0.3);

		this.endFill();
	};

	this.update = function(val_current) {
		this._current = val_current;
		this.draw();
	};

	this.update(current);
}
// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.VerticalTargetGraph.prototype = PIXI.Graphics.prototype;
ChartLib.VerticalTargetGraph.prototype.constructor = ChartLib.VerticalTargetGraph;

/**
* Vertical TargetGraph, introduced by Kohlhammer et al.
*/
ChartLib.VerticalTargetGraphChart = function (element) {

	ChartLib.BasicVerticalChart.apply(this);
	this.type = "verticalTargetGraph";

	this.init = function (element) {
		// call super init
		this.initVerticalChart(element);

		if (!this.verticalTGContainer) {
			this.verticalTGContainer = new PIXI.DisplayObjectContainer();
			this.addChild(this.verticalTGContainer);

			// values
			for (var child = element.firstChild; child; child = child.nextSibling) {
				// measures = [last, current, plan]
				var measures = [ 	parseFloat(child.getAttribute("val_last")),
				parseFloat(child.getAttribute("val_current")),
				parseFloat(child.getAttribute("val_plan")) ];

				// traffic light ranges [red, yellow, green]
				var tl_range = [ parseFloat(child.getAttribute("range_red")),
				parseFloat(child.getAttribute("range_yellow")),
				parseFloat(child.getAttribute("range_green")) ]

				var columnHeight = this._axisScale(measures[1]);
				var columnX = parseFloat(child.getAttribute("x")) * this._scale;
				var currentColumnHeight = (measures[1] > this._currentHeight)? this._axisScale(this._currentHeight) : columnHeight;

				// value label
				var valueLabel = new PIXI.Text(measures[1], {font: (this._pxs ) + "px arial", fill:"black"});
				valueLabel.position.y = 0.3*this._pxs;
				valueLabel.position.x = (columnX + (this._categoryWidth/2)) - (valueLabel.width / 2);

				// create TG
				var last = this._axisScale(measures[0]);
				var current = this._axisScale(measures[1]);
				var plan = this._axisScale(measures[2]);
				var red = this._axisScale(tl_range[0]);
				var yellow = this._axisScale(tl_range[1]);
				var green = this._axisScale(tl_range[2]);

				var verticalTG = new ChartLib.VerticalTargetGraph(columnX, this._axis_y, last, currentColumnHeight, plan,
					red, yellow, green, this._axisScale(this._domain[1]), this._categoryWidth, valueLabel, this._pxs);
					this.verticalTGContainer.addChild(verticalTG);
			}
		}
	};

	this.draw = function () {
		// update TGs
		var i=0;
		for (var child = this._element.firstChild; child; child = child.nextSibling) {
			var current_val = parseFloat(child.getAttribute("val_current"));
			var columnHeight = this._axisScale(current_val);
			var currentColumnHeight = (current_val > this._currentHeight)? this._axisScale(this._currentHeight) : columnHeight;

			this.verticalTGContainer.children[i].update(currentColumnHeight);
			i++;
		}
	};

	this.init(element);
	this.draw();
}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.VerticalTargetGraphChart.prototype = Object.create( ChartLib.BasicVerticalChart.prototype );
ChartLib.VerticalTargetGraphChart.prototype.constructor = ChartLib.VerticalTargetGraphChart;


/**
* Bar - graphical object
*/
ChartLib.Bar = function (x, y, val, width, height, valueLabel, color, pxs, textPos) {
	// inherit Pixi.js Graphics object
	PIXI.Graphics.apply(this, arguments);

	this._x = x;
	this._y = y;
	this._val = val;
	this._width = width;
	this._height = height;
	this._color = color;
	this._pxs = pxs;
	this._textPos = textPos;

	this._valueLabel = valueLabel;
	this._valueLabel.visible = false;
	this.addChild(this._valueLabel);


	// draw simple bar
	this.draw = function() {
		this.beginFill(this._color);
		this.drawRect( this._x, this._y, this._width, this._height);
		this.endFill();

		if (this._textPos == TextPositionEnum.RIGHT) {
			this._valueLabel.position.x = this._x + this._width + 0.3*this._pxs;
		}

		if (this._textPos == TextPositionEnum.LEFT) {
			this._valueLabel.position.x = this._x + this._width - this._valueLabel.width - 0.3*this._pxs;
		}

		if (this._textPos == TextPositionEnum.INNER) {
			// ommit too small widths
			if (this._valueLabel.width < this._width - 0.5*this._pxs) {
				this._valueLabel.position.x = this._x + (this._width / 2) - this._valueLabel.width/2;
			} else {
				this._valueLabel.visible = false;
			}
		}
	};

	this.update = function (width, showText) {
		this._width = width;
		this._valueLabel.visible = showText;
		this.draw();
	}

	this.update(this._width);
}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.Bar.prototype = PIXI.Graphics.prototype;
ChartLib.Bar.prototype.constructor = ChartLib.Bar;

/**
* Bar Chart
*/
ChartLib.BarChart = function (element) {

	ChartLib.BasicHorizontalChart.apply(this);
	this.type = "barChart";

	this.init = function (element) {
		// call super init
		this.initHorizontalChart(element);

		if (!this.barContainer) {
			this.barContainer = new PIXI.DisplayObjectContainer();
			this.addChild(this.barContainer);

			// values
			this.values = new Array();
			for (var child = element.firstChild; child; child = child.nextSibling) {
				var val = parseFloat(child.getAttribute("value"));

				// value label
				var barWidth = this._axisScale(val);
				var barY = parseFloat(child.getAttribute("y")) * this._scale;
				var currentBarWidth = (val > this._currentWidth)? this._axisScale(this._currentWidth) : barWidth;

				var valueLabel = new PIXI.Text(val, {font: (this._pxs ) + "px arial", fill:"black"});
				valueLabel.position.x = this._axis_x + barWidth + 0.3*this._pxs;
				valueLabel.position.y = (barY + (this._categoryHeight/2)) - (valueLabel.height / 2);

				var bar = new ChartLib.Bar(this._axis_x, barY, val, currentBarWidth, this._categoryHeight, valueLabel, 0x000000, this._pxs);
				this.barContainer.addChild(bar)

				this.values[this.values.length] = val;
			}
		}
	};

	this.draw = function () {
		var i = 0;
		for (var child = this._element.firstChild; child; child = child.nextSibling) {
			var val = parseFloat(child.getAttribute("value"));
			var barWidth = this._axisScale(val);
			var currentBarWidth = (val > this._currentWidth)? this._axisScale(this._currentWidth) : barWidth;

			this.barContainer.children[i].update(currentBarWidth, !this._animate);
			i++;
		}
	};

	this.init(element);
	this.draw();
}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.BarChart.prototype = Object.create( ChartLib.BasicHorizontalChart.prototype );
ChartLib.BarChart.prototype.constructor = ChartLib.BarChart;


/**
* Column - graphical object
*/

ChartLib.Column = function (x, y, val, width, height, valueLabel, color, pxs, textPos) {
	// inherit Pixi.js Graphics object
	PIXI.Graphics.apply(this, arguments);

	this._x = x;
	this._y = y;
	this._val = val;
	this._width = width;
	this._height = height;
	this._color = color;
	this._pxs = pxs;
	this._textPos = textPos;

	this._valueLabel = valueLabel;
	this.addChild(this._valueLabel);
	this._valueLabel.visible = false;

	// draw simple column
	this.draw = function () {
		this.clear();
		this.beginFill(this._color);
		this.drawRect( this._x, this._y, this._width, -this._height);
		this.endFill();


		if (this._textPos == TextPositionEnum.TOP) {
			this._valueLabel.position.y = this._y - this._height - 1.3*this._pxs;
		}

		if (this._textPos == TextPositionEnum.BOTTOM) {
			this._valueLabel.position.y = this._y - this._height + 0.3*this._pxs;
		}

		if (this._textPos == TextPositionEnum.INNER) {
			// ommit to small height
			if (this._valueLabel.height < this._height - 1*this._pxs) {
				this._valueLabel.position.y = this._y - (this._height / 2) - this._valueLabel.height/2;
			} else {
				this._valueLabel.visible = false;
			}
		}
	};

	this.update = function (height, showText) {
		this._height = height;
		this._valueLabel.visible = showText;
		this.draw();
	}

	this.update(this._height);
}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.Column.prototype = PIXI.Graphics.prototype;
ChartLib.Column.prototype.constructor = ChartLib.Column;


/**
* Column Chart
*/
ChartLib.ColumnChart = function (element) {

	ChartLib.BasicVerticalChart.apply(this);
	this.type = "columnChart";

	this.init = function (element) {
		// call super init
		this.initVerticalChart(element);

		// column container
		if (!this.columnContainer) {
			this.columnContainer = new PIXI.DisplayObjectContainer();
			this.addChild(this.columnContainer);

			// values
			this.values = new Array();
			// this.columnContainer.removeChildren();
			for (var child = element.firstChild; child; child = child.nextSibling) {
				var val = parseFloat(child.getAttribute("value"));

				// value label
				var columnHeight = this._axisScale(val);
				var columnX = parseFloat(child.getAttribute("x")) * this._scale;
				var currentColumnHeight = (val > this._currentHeight)? this._axisScale(this._currentHeight) : columnHeight;

				var valueLabel = new PIXI.Text(val, {font: (this._pxs ) + "px arial", fill:"black"});
				valueLabel.position.x = columnX + ((this._categoryWidth/2) - (valueLabel.width / 2));
				valueLabel.position.y = this._axis_y - columnHeight - 0.3*this._pxs;

				var column = new ChartLib.Column(columnX, this._axis_y, val, this._categoryWidth,
											currentColumnHeight, valueLabel, 0x000000, this._pxs, TextPositionEnum.TOP);
				this.columnContainer.addChild(column)

				this.values[this.values.length] = val;
			}
		}
	}

	this.draw = function () {
		var i = 0;
		for (var child = this._element.firstChild; child; child = child.nextSibling) {
			var val = parseFloat(child.getAttribute("value"));
			var columnHeight = this._axisScale(val);
			var currentColumnHeight = (val > this._currentHeight)? this._axisScale(this._currentHeight) : columnHeight;

			this.columnContainer.children[i].update(currentColumnHeight, !this._animate);
			i++;
		}
	}

	this.init(element);
	this.draw();
}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.ColumnChart.prototype = Object.create( ChartLib.BasicVerticalChart.prototype );
ChartLib.ColumnChart.prototype.constructor = ChartLib.ColumnChart;

/**
* StackedColumn - graphical object
*/
ChartLib.StackedColumn = function (columns) {
	// inherit Pixi.js Graphics object
	PIXI.Graphics.apply(this, arguments);

	// adding columns
	for (var i=0; i<columns.length; i++) {
		this.addChild(columns[i]);
	}

	this.update = function(heights, showText) {
		for (var i=0; i<this.children.length; i++) {
			this.children[i].update(heights[i], showText);
		}
	}
}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.StackedColumn.prototype = PIXI.Graphics.prototype;
ChartLib.StackedColumn.prototype.constructor = ChartLib.StackedColumn;

/**
* Stacked Column Chart
*/
ChartLib.StackedColumnChart = function (element) {

	ChartLib.BasicVerticalChart.apply(this);
	this.type = "stackedColumnChart";

	this.init = function (element) {
		// call super init
		this.initVerticalChart(element);

		// stackedColumn container
		if (!this.stackedColumnContainer) {
			this.stackedColumnContainer = new PIXI.DisplayObjectContainer();
			this.addChild(this.stackedColumnContainer);


			// values
			this._values = new Array();
			for (var child = element.firstChild; child; child = child.nextSibling) {
				var values = child.getAttribute("values").split(",");
				var values_Sum = values.reduce(function(previousValue, currentValue, index, array) {
					return previousValue + currentValue;
				});
				var currentStackedColumnHeight = 0;
				var columns = new Array();

				for (var i=0; i<values.length; i++) {
					var val = parseFloat(values[i]);

					var columnX = parseFloat(child.getAttribute("x")) * this._scale;
					var columnHeight = this._axisScale(val);
					var currentColumnHeight = (val + currentStackedColumnHeight > this._currentHeight)?
						this._axisScale(this._currentHeight - currentStackedColumnHeight) : columnHeight;

					// value label
					var columnColor = 0x000000 + i*0x333333;
					var textColor = (columnColor < 0x666666)? "grey" : "black";
					var valueLabel = new PIXI.Text(val, {font: (this._pxs) + "px arial", fill:textColor});
					valueLabel.position.y = this._axis_y - currentStackedColumnHeight - (columnHeight / 2) + valueLabel.height/2;
					valueLabel.position.x = (columnX + (this._categoryWidth/2)) - (valueLabel.width / 2);

					var column = new ChartLib.Column(columnX, this._axis_y - this._axisScale(currentStackedColumnHeight), val, this._categoryWidth,
														0, valueLabel, columnColor, this._pxs, TextPositionEnum.INNER);
					columns[i] = column;

					currentStackedColumnHeight += val;
				}

				var stackedColumn = new ChartLib.StackedColumn(columns);
				this.stackedColumnContainer.addChild(stackedColumn);
			}
		}
	};

	this.draw = function() {
		// update columns
		var i = 0;
		for (var child = element.firstChild; child; child = child.nextSibling) {
			var values = child.getAttribute("values").split(",");
			var heights = new Array();
			var currentStackedColumnHeight = 0;

			for (var j=0; j<values.length; j++) {
				var val = parseFloat(values[j]);
				var columnHeight = this._axisScale(val);
				var currentColumnHeight = 0;

				// only render columns that are beneath or in the currentHeight range
				if ((currentStackedColumnHeight + val < this._currentHeight) ||
						(this._currentHeight >= currentStackedColumnHeight &&
						this._currentHeight < currentStackedColumnHeight + val)) {
					currentColumnHeight = (val + currentStackedColumnHeight > this._currentHeight)?
					this._axisScale(this._currentHeight - currentStackedColumnHeight) : columnHeight;
				}

				currentStackedColumnHeight += val;
				heights[j] = currentColumnHeight;
			}

			this.stackedColumnContainer.children[i].update(heights, !this._animate);
			i++;
		}
	};

	this.init(element);
	this.draw();
}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.StackedColumnChart.prototype = Object.create( ChartLib.BasicVerticalChart.prototype );
ChartLib.StackedColumnChart.prototype.constructor = ChartLib.StackedColumnChart;

/**
* StackedBar - graphical object
*/
ChartLib.StackedBar = function (bars) {
	// inherit Pixi.js Graphics object
	PIXI.Graphics.apply(this, arguments);

	// adding bars
	for (var i=0; i<bars.length; i++) {
		this.addChild(bars[i]);
	}

	this.update = function(widths, showText) {
		for (var i=0; i<this.children.length; i++) {
			this.children[i].update(widths[i], showText);
		}
	}
}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.StackedBar.prototype = PIXI.Graphics.prototype;
ChartLib.StackedBar.prototype.constructor = ChartLib.StackedBar;

/**
* Stacked Bar Chart
*/
ChartLib.StackedBarChart = function (element) {

	ChartLib.BasicHorizontalChart.apply(this);
	this.type = "stackedBarChart";

	this.init = function (element) {
		// call super init
		this.initHorizontalChart(element);

		// stackedBar container
		if (!this.stackedBarContainer) {
			this.stackedBarContainer = new PIXI.DisplayObjectContainer();
			this.addChild(this.stackedBarContainer);

			// values
			this._values = new Array();
			var i = 0;
			for (var child = element.firstChild; child; child = child.nextSibling) {
				var values = child.getAttribute("values").split(",");
				var values_Sum = values.reduce(function(previousValue, currentValue, index, array) {
					return previousValue + currentValue;
				});
				var currentStackedBarWidth = 0;
				var widths = new Array();
				var bars = new Array();

				for (var j=0; j<values.length; j++) {
					var val = parseFloat(values[j]);
					var barY = parseFloat(child.getAttribute("y")) * this._scale;
					var barWidth = this._axisScale(val);
					var currentBarWidth = (val + currentStackedBarWidth > this._currentWidth)?
						this._axisScale(this._currentWidth - currentStackedBarWidth) : barWidth;

					// value label
					var barColor = 0x000000 + j*0x333333;
					var textColor = (barColor < 0x666666)? "grey" : "black";
					var valueLabel = new PIXI.Text(val, {font: (this._pxs) + "px arial", fill:textColor});
					valueLabel.position.x = this._axis_x + currentStackedBarWidth + (barWidth / 2) - valueLabel.width/2;
					valueLabel.position.y = (barY + (this._categoryHeight/2)) - (valueLabel.height / 2);

					var bar = new ChartLib.Bar(this._axis_x + this._axisScale(currentStackedBarWidth), barY, val, 0,
						this._categoryHeight, valueLabel, barColor, this._pxs, TextPositionEnum.INNER);
					bars[j] = bar;

					currentStackedBarWidth += val;
				}

				var stackedBar = new ChartLib.StackedBar(bars);
				this.stackedBarContainer.addChild(stackedBar);
				i++;
			}
		}
	}

	this.draw = function() {
		// update bars
		var i=0;
		for (var child = element.firstChild; child; child = child.nextSibling) {
			var values = child.getAttribute("values").split(",");
			var widths = new Array();
			var currentStackedBarWidth = 0;

			for (var j=0; j<values.length; j++) {
				var val = parseFloat(values[j]);
				var barWidth = this._axisScale(val);
				var currentBarWidth = 0;

				// only render bars that are beneath or in the currentWidth range
				if ((currentStackedBarWidth + val < this._currentWidth) ||
					(this._currentWidth >= currentStackedBarWidth &&
						this._currentWidth < currentStackedBarWidth + val)) {
					currentBarWidth = (val + currentStackedBarWidth > this._currentWidth)?
						this._axisScale(this._currentWidth - currentStackedBarWidth) : barWidth;
				}

				currentStackedBarWidth += val;
				widths[j] = currentBarWidth;
			}

			this.stackedBarContainer.children[i].update(widths, !this._animate);
			i++;
		}
	};

	this.init(element);
	this.draw();
}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.StackedBarChart.prototype = Object.create( ChartLib.BasicHorizontalChart.prototype );
ChartLib.StackedBarChart.prototype.constructor = ChartLib.StackedBarChart;

/**
* Grouped Column - graphical object
*/

ChartLib.GroupedColumn = function (columns) {
	// inherit Pixi.js Graphics object
	PIXI.Graphics.apply(this, arguments);

	// adding columns
	for (var i=0; i<columns.length; i++) {
		this.addChild(columns[i]);
	}

	this.update = function(heights, showText) {
		for (var i=0; i<this.children.length; i++) {
			this.children[i].update(heights[i], showText);
		}
	}
}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.GroupedColumn.prototype = PIXI.Graphics.prototype;
ChartLib.GroupedColumn.prototype.constructor = ChartLib.GroupedColumn;

/**
* Grouped Column Chart
*/
ChartLib.GroupedColumnChart = function (element) {

	ChartLib.BasicVerticalChart.apply(this);
	this.type = "groupedColumnChart";

	this.init = function (element) {
		// call super init
		this.initVerticalChart(element);

		// groupedColumn container
		if (!this.groupedColumnContainer) {
			this.groupedColumnContainer = new PIXI.DisplayObjectContainer();
			this.addChild(this.groupedColumnContainer);

			// values
			this._values = new Array();
			for (var child = element.firstChild; child; child = child.nextSibling) {
				var values = child.getAttribute("values").split(",");
				var groupedColumnX = parseFloat(child.getAttribute("x")) * this._scale;
				var columns = new Array();

				for (var i=0; i<values.length; i++) {
					var val = parseFloat(values[i]);
					var columnWidth = this._categoryWidth/values.length;
					var columnX = groupedColumnX  + i*columnWidth;
					var columnHeight = this._axisScale(val);
					var currentColumnHeight = (val > this._currentHeight)?
					this._axisScale(this._currentHeight) : columnHeight;

					// value label
					var columnColor = 0x000000 + i*0x333333;
					var textColor = "black";
					var valueLabel = new PIXI.Text(val, {font: (this._pxs) + "px arial", fill:textColor});
					valueLabel.position.y = this._axis_y - currentColumnHeight - 1.3*this._pxs;
					valueLabel.position.x = columnX + (columnWidth/2) - (valueLabel.width / 2);

					var column = new ChartLib.Column(columnX, this._axis_y, val, columnWidth,
								0, valueLabel, columnColor, this._pxs, TextPositionEnum.TOP);

					columns[i] = column;
				}

				var groupedColumn = new ChartLib.GroupedColumn(columns);
				this.groupedColumnContainer.addChild(groupedColumn);
			}
		}
	};

	this.draw = function (element) {
		// update columns
		var i=0;
		for (var child = this._element.firstChild; child; child = child.nextSibling) {
			var values = child.getAttribute("values").split(",");
			var heights = new Array();

			for (var j=0; j<values.length; j++) {
				var val = parseFloat(values[j]);
				var columnHeight = this._axisScale(val);
				var currentColumnHeight = (val > this._currentHeight)?
					this._axisScale(this._currentHeight) : columnHeight;

				heights[j] = currentColumnHeight;
			}

			this.groupedColumnContainer.children[i].update(heights, !this._animate);
			i++;
		}
	};

	this.init(element);
	this.draw();
}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.GroupedColumnChart.prototype = Object.create( ChartLib.BasicVerticalChart.prototype );
ChartLib.GroupedColumnChart.prototype.constructor = ChartLib.GroupedColumnChart;


/**
* Grouped Bar - graphical object
*/
ChartLib.GroupedBar = function (bars) {
	// inherit Pixi.js Graphics object
	PIXI.Graphics.apply(this, arguments);

	// adding bars
	for (var i=0; i<bars.length; i++) {
		this.addChild(bars[i]);
	}

	this.update = function(widths, showText) {
		for (var i=0; i<this.children.length; i++) {
			this.children[i].update(widths[i], showText);
		}
	}
}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.GroupedBar.prototype = PIXI.Graphics.prototype;
ChartLib.GroupedBar.prototype.constructor = ChartLib.GroupedBar;


/**
* Grouped Bar Chart
*/
ChartLib.GroupedBarChart = function (element) {

	ChartLib.BasicHorizontalChart.apply(this);
	this.type = "groupedBarChart";

	this.init = function (element) {
		// call super init
		this.initHorizontalChart(element);

		// groupedColumn container
		if (!this.groupedBarContainer) {
			this.groupedBarContainer = new PIXI.DisplayObjectContainer();
			this.addChild(this.groupedBarContainer);


			// values
			this._values = new Array();

			for (var child = element.firstChild; child; child = child.nextSibling) {
				var values = child.getAttribute("values").split(",");
				var groupedBarY = parseFloat(child.getAttribute("y")) * this._scale;
				var bars = new Array();

				for (var i=0; i<values.length; i++) {
					var val = parseFloat(values[i]);
					var barHeight = this._categoryHeight/values.length;
					var barY = groupedBarY  + i*barHeight;
					var barWidth = this._axisScale(val);
					var currentBarWidth = (val > this._currentWidth)?
					this._axisScale(this._currentWidth) : barWidth;

					// value label
					var columnColor = 0x000000 + i*0x333333;
					var textColor = "black";
					var valueLabel = new PIXI.Text(val, {font: (this._pxs) + "px arial", fill:textColor});
					valueLabel.position.x = this._axis_x + currentBarWidth + 0.3*this._pxs;
					valueLabel.position.y = barY + (barHeight/2) - (valueLabel.height / 2);

					var bar = new ChartLib.Bar(this._axis_x, barY, val, currentBarWidth,
						barHeight, valueLabel, columnColor, this._pxs, TextPositionEnum.RIGHT);
					bars[i] = bar;
				}

				var groupedBar = new ChartLib.GroupedBar(bars);
				this.groupedBarContainer.addChild(groupedBar);
			}
		}
	};


	this.draw = function (element) {
		// update bars
		var i = 0;
		for (var child = this._element.firstChild; child; child = child.nextSibling) {
			var values = child.getAttribute("values").split(",");
			var widths = new Array();

			for (var j=0; j<values.length; j++) {
				var val = parseFloat(values[j]);
				var barWidth = this._axisScale(val);
				var currentBarWidth = (val > this._currentWidth)?
					this._axisScale(this._currentWidth) : barWidth;

				widths[j] = currentBarWidth;
			}

			this.groupedBarContainer.children[i].update(widths, !this._animate);
			i++;
		}
	};

	this.init(element);
	this.draw();
}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.GroupedBarChart.prototype = Object.create( ChartLib.BasicHorizontalChart.prototype );
ChartLib.GroupedBarChart.prototype.constructor = ChartLib.GroupedBarChart;

/**
* Horizontal Pin -- graphical
*/
ChartLib.HorizontalPin = function (x, y, val, width, valueLabel, pxs) {
	// inherit Pixi.js Graphics object
	PIXI.Graphics.apply(this, arguments);


	this._x = x;
	this._y = y;
	this._val = val;
	this._width = width;
	this._height = 0.3*pxs;
	this._pxs = pxs;

	this._color = (val < 0)? 0xFF0000 : 0x8CB400;
	this._textPos = (val < 0)? TextPositionEnum.LEFT : TextPositionEnum.RIGHT;

	this._valueLabel = valueLabel;
	this.addChild(this._valueLabel);


	this.draw = function () {
		this.clear();

		// pin
		this.beginFill(this._color);
		this.drawRect( this._x, this._y, this._width, this._height);
		this.endFill();

		// marker

		this.beginFill(0x000000);
		if (this._textPos == TextPositionEnum.LEFT) {
			this.drawRect( this._x + this._width - 0.7*this._pxs, this._y - 0.2*this._pxs , 0.7*this._pxs, 0.7*this._pxs);
			this._valueLabel.position.x = this._x + this._width - this._valueLabel.width - 1.3*this._pxs;
		}

		if (this._textPos == TextPositionEnum.RIGHT) {
			this.drawRect( this._x + this._width, this._y - 0.2*this._pxs , 0.7*this._pxs, 0.7*this._pxs);
			this._valueLabel.position.x = this._x + this._width + 1.3*this._pxs;
		}
		this.endFill();
	}

	this.update = function (width, val, showText) {
		this._width = width;
		this._val = val;
		this._color = (val < 0)? 0xFF0000 : 0x8CB400;
		this._textPos = (val < 0)? TextPositionEnum.LEFT : TextPositionEnum.RIGHT;
		this._valueLabel.visible = showText;
		this.draw();
	}
}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.HorizontalPin.prototype = PIXI.Graphics.prototype;
ChartLib.HorizontalPin.prototype.constructor = ChartLib.HorizontalPin;

/**
* Horizontal Pin Chart
*/
ChartLib.HorizontalPinChart = function (element) {
	ChartLib.BasicHorizontalChart.apply(this);
	this.type = "horizontalPinChart";

	this.init = function (element) {
		// call super init
		this.initHorizontalChart(element);

		// calc x pos for chart axis (center)
		this._max_width = (parseFloat(element.getAttribute("max_width")) * this._scale) - 10*this._pxs;
		this._axis_x = this._x + this._max_width / 2 + 5*this._pxs;

		// calc axis
		this._range = [0, this._max_width];
		this._axisScale = d3.scale.linear()
			.domain(this._domain)
			.range( this._range);

		// first we dont need category labels
		this._categoryLabelContainer.removeChildren();

		// calculate actual height
		this._height = (element.lastChild.getAttribute("y") - this._y + this._categoryHeight) * this._scale;

		// horizontalPins container
		if (!this.horizontalPinsContainer) {
			this.horizontalPinsContainer = new PIXI.DisplayObjectContainer();
			this.addChild(this.horizontalPinsContainer);

			// values
			this._values = new Array();

			for (var child = element.firstChild; child; child = child.nextSibling) {
				// value label
				var val = parseFloat(child.getAttribute("value"));
				var pinWidth = this._axisScale(val);
				var pinY = parseFloat(child.getAttribute("y")) * this._scale;
				var currentPinWidth = (Math.abs(val) > this._currentWidth)? this._axisScale((val / Math.abs(val)) * this._currentWidth) : pinWidth;

				var valueLabel = new PIXI.Text(val, {font: (this._pxs ) + "px arial", fill:"black"});
				valueLabel.position.x = this._axis_x;
				valueLabel.position.y = pinY - 0.375*this._pxs;

				var horizontalPin = new ChartLib.HorizontalPin(this._axis_x, pinY, val, currentPinWidth, valueLabel, this._categoryHeight, this._pxs);
				this.horizontalPinsContainer.addChild(horizontalPin);
			}
		}

	};

	this.draw = function () {
		// axis
		this.beginFill(0x000000);
		this.drawRect(this._axis_x, this._y, 1, this._height);
		this.endFill();

		var i = 0;
		for (var child = this._element.firstChild; child; child = child.nextSibling) {
			var val = parseFloat(child.getAttribute("value"));
			var pinWidth = this._axisScale(val);
			var currentPinWidth = (Math.abs(val) > this._currentWidth)? this._axisScale((val / Math.abs(val)) * this._currentWidth) : pinWidth;

			this.horizontalPinsContainer.children[i].update(currentPinWidth, val, !this._animate);
			i++;
		}
	};

	this.init(element);
	this.draw();
}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.HorizontalPinChart.prototype = Object.create( ChartLib.BasicHorizontalChart.prototype );
ChartLib.HorizontalPinChart.prototype.constructor = ChartLib.HorizontalPinChart;

/**
* Vertical Pin -- graphical
*/
ChartLib.VerticalPin = function (x, y, val, height, valueLabel, pxs) {
	// inherit Pixi.js Graphics object
	PIXI.Graphics.apply(this, arguments);

	this._x = x;
	this._y = y;
	this._val = val;
	this._width = 0.3*pxs;
	this._height = height;
	this._pxs = pxs;

	this._color = (val < 0)? 0xFF0000 : 0x8CB400;
	this._textPos = (val < 0)? TextPositionEnum.BOTTOM : TextPositionEnum.TOP;

	this._valueLabel = valueLabel;
	this.addChild(this._valueLabel);

	this.draw = function () {
		this.clear();

		// pin
		this.beginFill(this._color);
		this.drawRect( this._x, this._y, this._width, -this._height);
		this.endFill();

		// marker
		this.beginFill(0x000000);
		if (this._textPos == TextPositionEnum.BOTTOM) {
			this.drawRect( this._x - 0.2*this._pxs, this._y - this._height, 0.7*this._pxs, 0.7*this._pxs);
			this._valueLabel.position.y = this._y - this._height + 1.0*this._pxs;
		}

		if (this._textPos == TextPositionEnum.TOP) {
			this.drawRect( this._x - 0.2*this._pxs, this._y - this._height - 0.7*this._pxs, 0.7*this._pxs, 0.7*this._pxs);
			this._valueLabel.position.y = this._y - this._height - 2.0*this._pxs;
		}
		this.endFill();
	}

	this.update = function (height, val, showText) {
		this._height = height;
		this._val = val;
		this._color = (val < 0)? 0xFF0000 : 0x8CB400;
		this._textPos = (val < 0)? TextPositionEnum.BOTTOM : TextPositionEnum.TOP;
		this._valueLabel.visible = showText;
		this.draw();
	}
}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.VerticalPin.prototype = PIXI.Graphics.prototype;
ChartLib.VerticalPin.prototype.constructor = ChartLib.VerticalPin;

/**
* Vertical Pin Chart
*/
ChartLib.VerticalPinChart = function (element) {
	ChartLib.BasicVerticalChart.apply(this);
	this.type = "verticalPinChart";

	this.init = function (element) {
		// call super init
		this.initVerticalChart(element);

		// calc x pos for chart axis (center)
		this._max_height = (parseFloat(element.getAttribute("max_height")) * this._scale) - 4*this._pxs;
		this._axis_y = this._y + this._max_height / 2 + 2*this._pxs;

		// calc axis
		this._range = [0, this._max_height];
		this._axisScale = d3.scale.linear()
			.domain(this._domain)
			.range( this._range);

		// first we dont need category labels
		this._categoryLabelContainer.removeChildren();

		// calculate actual width
		this._width = (element.lastChild.getAttribute("x") - this._x + this._categoryWidth/2) * this._scale;

		// horizontalPins container
		if (!this.verticalPinsContainer) {
			this.verticalPinsContainer = new PIXI.DisplayObjectContainer();
			this.addChild(this.verticalPinsContainer);

			// values
			this._values = new Array();

			for (var child = element.firstChild; child; child = child.nextSibling) {
				// value label
				var val = parseFloat(child.getAttribute("value"));
				var pinHeight = this._axisScale(val);
				var pinX = parseFloat(child.getAttribute("x")) * this._scale;
				var currentPinHeight = (Math.abs(val) > this._currentHeight)? this._axisScale((val / Math.abs(val)) * this._currentHeight) : pinHeight;

				var valueLabel = new PIXI.Text(val, {font: (this._pxs ) + "px arial", fill:"black"});
				valueLabel.position.x = pinX - 0.375*this._pxs;
				valueLabel.position.y = this._axis_y;

				var verticalPin = new ChartLib.VerticalPin(pinX, this._axis_y, val, currentPinHeight, valueLabel, this._pxs);
				this.verticalPinsContainer.addChild(verticalPin);
			}
		}

	};

	this.draw = function () {
		// axis
		this.beginFill(0x000000);
		this.drawRect(this._x, this._axis_y, this._width, 1);
		this.endFill();

		var i = 0;
		for (var child = this._element.firstChild; child; child = child.nextSibling) {
			var val = parseFloat(child.getAttribute("value"));
			var pinHeight = this._axisScale(val);
			var currentPinHeight = (Math.abs(val) > this._currentHeight)? this._axisScale((val / Math.abs(val)) * this._currentHeight) : pinHeight;

			this.verticalPinsContainer.children[i].update(currentPinHeight, val, !this._animate);
			i++;
		}
	};

	this.init(element);
	this.draw();
}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.VerticalPinChart.prototype = Object.create( ChartLib.BasicVerticalChart.prototype );
ChartLib.VerticalPinChart.prototype.constructor = ChartLib.VerticalPinChart;

/**
* Bar in a Waterfallchart - graphical element
*/
ChartLib.WaterfallBar = function (bar, categoryHeight, type) {
	// inherit Pixi.js Graphics object
	PIXI.Graphics.apply(this, arguments);

	this._bar = bar;
	this.addChild(this._bar);

	this._categoryHeight = categoryHeight;
	this._type = type;

	this.draw = function() {
		// draw line to previous bar
		this.clear();
		this.beginFill(0x666666);
		this.drawRect((this._type == "variance")? this._bar._x : this._bar._x + this._bar._width, this._bar._y, 1, -this._categoryHeight/2);
		this.endFill();
	};

	this.update = function(width, showText, showBar) {
		this.visible = showBar;
		this._bar.update(width, showText);
		this.draw();
	};
}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.WaterfallBar.prototype = PIXI.Graphics.prototype;
ChartLib.WaterfallBar.prototype.constructor = ChartLib.WaterfallBar;

/**
* Horizontal WaterfallChart
*/
ChartLib.HorizontalWaterfallChart = function (element) {
	ChartLib.BasicHorizontalChart.apply(this);
	this.type = "horizontalWaterfallChart";

	this.init = function (element) {
		// call super init
		this.initHorizontalChart(element);

		this.currentLine = parseInt(element.getAttribute("current_line"));

		// calc x pos for chart axis (center)
		this._max_width = (parseFloat(element.getAttribute("max_width")) - this._categoryLabelWidth) * this._scale - 4*this._pxs;
		this._axis_x = this._x + this._categoryLabelWidth + 0.5*this._pxs;

		// calc axis
		this._range = [0, this._max_width];
		this._axisScale = d3.scale.linear()
			.domain(this._domain)
			.range( this._range);

		// calc actual height
		this._height = (parseFloat(this._element.lastChild.getAttribute("y")) - this._y + this._categoryHeight)*this._scale + 1*this._pxs;

		// horizontalPins container
		if (!this.waterfallBarsContainer) {
			this.waterfallBarsContainer = new PIXI.DisplayObjectContainer();
			this.addChild(this.waterfallBarsContainer);

			// values
			this.values = new Array();
			var prevBarX = this._axis_x;

			// first we dont need category labels
			// this._categoryLabelContainer.removeChildren();

			for (var child = element.firstChild; child; child = child.nextSibling) {
				var val = parseFloat(child.getAttribute("value"));

				var barType = child.getAttribute("type");
				var barWidth = this._axisScale(val);
				var barY = parseFloat(child.getAttribute("y")) * this._scale;
				var barX = (barType == "result")? this._axis_x : prevBarX;
				var currentBarWidth = 0; //barWidth; // (val > this._currentWidth)? this._axisScale(this._currentWidth) :

				var valText = new String(val).replace("-", "");
				var valueLabel = new PIXI.Text(valText, {font: (this._pxs ) + "px arial", fill:"black"});
				valueLabel.position.x = barX + barWidth + 0.3*this._pxs;
				valueLabel.position.y = (barY + (this._categoryHeight/2)) - (valueLabel.height / 2);

				var textPos = (val < 0)? TextPositionEnum.LEFT : TextPositionEnum.RIGHT;
				var color = (val < 0)? 0x333333 : 0x999999;
				color = (barType=="variance")? color : 0x000000
				var bar = new ChartLib.Bar(barX, barY, val, currentBarWidth, this._categoryHeight, valueLabel, color, this._pxs, textPos);
				var waterfallBar = new ChartLib.WaterfallBar(bar, this._categoryHeight, barType);
				this.waterfallBarsContainer.addChild(waterfallBar);

				prevBarX = barX + barWidth;
				this.values[this.values.length] = val;
			}
		}
	};

	this.draw = function () {
		// axis
		this.beginFill(0x000000);
		this.drawRect(this._axis_x, parseFloat(this._element.firstChild.getAttribute("y")), 2, this._height);
		this.endFill();

		var i = 0;
		for (var child = this._element.firstChild; child; child = child.nextSibling) {
			var curr_width = parseFloat(child.getAttribute("current_width"));
			var val = parseFloat(child.getAttribute("value"));

			var barWidth = this._axisScale(curr_width);
			var showBar = (this.currentLine >= i)? true : false;

			this.waterfallBarsContainer.children[i].update(barWidth, !this._animate, showBar);
			i++;
		}
	};

	this.init(element);
	this.draw();
}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.HorizontalWaterfallChart.prototype = Object.create( ChartLib.BasicHorizontalChart.prototype );
ChartLib.HorizontalWaterfallChart.prototype.constructor = ChartLib.HorizontalWaterfallChart;

/**
* Column in a Waterfallchart - graphical element
*/
ChartLib.WaterfallColumn = function(column, categoryWidth, type) {
	// inherit Pixi.js Graphics object
	PIXI.Graphics.apply(this, arguments);

	this._column = column;
	this.addChild(this._column);

	this._categoryWidth = categoryWidth;
	this._type = type;

	this.draw = function() {
		// draw line to previous bar
		this.clear()
		this.beginFill(0x666666);
		this.drawRect(this._column._x, (this._type == "variance")? this._column._y : this._column._y - this._column._height, -this._categoryWidth/2, 1);
		this.endFill();
	};

	this.update = function(height, showText, showColumn) {
		this.visible = showColumn;
		this._column.update(height, showText);
		this.draw();
	};
}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.WaterfallColumn.prototype = PIXI.Graphics.prototype;
ChartLib.WaterfallColumn.prototype.constructor = ChartLib.WaterfallColumn;

/**
* Vertical WaterfallChart
*/
ChartLib.VerticalWaterfallChart = function (element) {
	ChartLib.BasicVerticalChart.apply(this);
	this.type = "verticalWaterfallChart";

	this.init = function (element) {
		// call super init
		this.initVerticalChart(element);

		this.currentLine = parseInt(element.getAttribute("current_line"));

		// calc x pos for chart axis (center)
		this._max_height = (parseFloat(element.getAttribute("max_height"))) * this._scale - 1*this._pxs;
		this._axis_y = this._y - 1.3*this._pxs;

		// calc axis
		this._range = [0, this._max_height];
		this._axisScale = d3.scale.linear()
			.domain(this._domain)
			.range( this._range);

		// calc actual width
		this._width = (parseFloat(this._element.lastChild.getAttribute("x")) - this._x + this._categoryWidth)*this._scale + 1*this._pxs;

		// horizontalPins container
		if (!this.waterfallColumnsContainer) {
			this.waterfallColumnsContainer = new PIXI.DisplayObjectContainer();
			this.addChild(this.waterfallColumnsContainer);

			// values
			this.values = new Array();
			var prevColumnY = this._axis_y;

			// first we dont need category labels
			// this._categoryLabelContainer.removeChildren();

			for (var child = element.firstChild; child; child = child.nextSibling) {
				var val = parseFloat(child.getAttribute("value"));

				var columnType = child.getAttribute("type");
				var columnHeight = this._axisScale(val);
				var columnX = parseFloat(child.getAttribute("x")) * this._scale;
				var columnY = (columnType == "result")? this._axis_y : prevColumnY;
				var currentColumnHeight = columnHeight;

				var valText = new String(val).replace("-", "");
				var valueLabel = new PIXI.Text(valText, {font: (this._pxs ) + "px arial", fill:"black"});
				valueLabel.position.y = columnY - columnHeight - 0.3*this._pxs;
				valueLabel.position.x = (columnX + (this._categoryWidth/2)) - (valueLabel.width / 2);

				var textPos = (val < 0)? TextPositionEnum.BOTTOM : TextPositionEnum.TOP;
				var color = (val < 0)? 0x333333 : 0x999999;
				color = (columnType=="variance")? color : 0x000000
				var column = new ChartLib.Column(columnX, columnY, val, this._categoryWidth, currentColumnHeight, valueLabel, color, this._pxs, textPos);
				var waterfallColumn = new ChartLib.WaterfallColumn(column, this._categoryWidth, columnType);
				this.waterfallColumnsContainer.addChild(waterfallColumn);

				prevColumnY = columnY - columnHeight;
				this.values[this.values.length] = val;
			}
		}
	};

	this.draw = function () {
		// axis
		this.beginFill(0x000000);
		this.drawRect(parseFloat(this._element.firstChild.getAttribute("x")), this._axis_y, this._width, 2);
		this.endFill();

		var i = 0;
		for (var child = this._element.firstChild; child; child = child.nextSibling) {
			var val = parseFloat(child.getAttribute("current_height"));
			var columnHeight = this._axisScale(val);
			var showColumn = (this.currentLine >= i)? true : false;

			this.waterfallColumnsContainer.children[i].update(columnHeight, !this._animate, showColumn);
			i++;
		}
	};

	this.init(element);
	this.draw();
}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.VerticalWaterfallChart.prototype = Object.create( ChartLib.BasicVerticalChart.prototype );
ChartLib.VerticalWaterfallChart.prototype.constructor = ChartLib.VerticalWaterfallChart;

/**
 * Basic chart with two axis.
*/
ChartLib.Basic2AxisChart = function (element) {
	ChartLib.BasicChart.apply(this);
	this.type = "basic2AxisChart";

	this.init2AxisChart = function (element) {
		// call super init
		this.initDefault(element);

		// default x and y position of axis: bottom left
		this._x_axis_x = this._x + 3*this._pxs;
		this._x_axis_y = this._y - (this._pxs * 1.3);

		this._y_axis_x = this._x + 3*this._pxs;
		this._y_axis_y = this._y - (this._pxs * 1.3);

		// max width and height
		this._max_width = (parseFloat(element.getAttribute("max_width")) * this._scale) - 3*this._pxs;
		this._max_height = (parseFloat(element.getAttribute("max_height")) * this._scale) - 2*this._pxs;

		console.log("2axisChart: ", this._max_width, this._max_height);

		// calc axis
		this._domain_x_min = parseFloat(element.getAttribute("domain_x_min"));
		this._domain_x_max = parseFloat(element.getAttribute("domain_x_max"));
		this._domain_x = [this._domain_x_min, this._domain_x_max];
		this._range_x = [0, this._max_width];
		this._axisScale_x = d3.scale.linear()
			.domain(this._domain_x)
			.range( this._range_x);

		this._domain_y_min = parseFloat(element.getAttribute("domain_y_min"));
		this._domain_y_max = parseFloat(element.getAttribute("domain_y_max"));
		this._domain_y = [this._domain_y_min, this._domain_y_max];
		this._range_y = [0, this._max_height];
		this._axisScale_y = d3.scale.linear()
			.domain(this._domain_y)
			.range( this._range_y);

		// axis ticks
		var _arguments = [10];
		this.tickFormat_x = this._axisScale_x.tickFormat.apply(this.scale, _arguments);
		this.ticks_x = this._axisScale_x.ticks.apply(this._axisScale_x, _arguments);

		this.tickFormat_y = this._axisScale_y.tickFormat.apply(this.scale, _arguments);
		this.ticks_y = this._axisScale_y.ticks.apply(this._axisScale_y, _arguments);

		// x axis
		this._axis_x_container = new PIXI.DisplayObjectContainer();
		var steps = this.ticks_x.length;
		this.drawRect( this._x_axis_x, this._y_axis_y, this._max_width, this._pxs*0.05)
		for (var i = 0; i < steps; i++) {
			this.beginFill(0xCCCCCC);
			this.drawRect( this._x_axis_x + this._axisScale_x(this.ticks_x[i]), this._y_axis_y, this._pxs*0.1, this._pxs*0.2);

			// add labels
			var text = new PIXI.Text(this.ticks_x[i], {font: this._pxs + "px sans-serif", fill:"black"});
			text.position.y = this._y_axis_y + this._pxs*0.2;
			text.position.x = this._x_axis_x + this._axisScale_x(this.ticks_x[i]) - text.width/2;
			this._axis_x_container.addChild(text);
		}
		this.addChild(this._axis_x_container);


		// y axis
		this._axis_y_container = new PIXI.DisplayObjectContainer();
		steps = this.ticks_y.length;
		this.drawRect( this._x_axis_x, this._y_axis_y, this._pxs*0.05, -this._max_height);
		for (var i = 0; i < steps; i++) {
			this.beginFill(0xCCCCCC);
			this.drawRect( this._x_axis_x, this._y_axis_y - this._axisScale_y(this.ticks_y[i]), -this._pxs*0.2, this._pxs*0.1);

			// add labels
			var text = new PIXI.Text(this.ticks_y[i], {font: this._pxs + "px sans-serif", fill:"black"});
			text.position.x = this._y_axis_x - this._pxs*0.2 - text.width;
			text.position.y = this._y_axis_y - this._axisScale_y(this.ticks_y[i]) - text.height/2;
			this._axis_y_container.addChild(text);
		}
		this.addChild(this._axis_y_container);
	}
}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.Basic2AxisChart.prototype = Object.create( ChartLib.BasicChart.prototype );
ChartLib.Basic2AxisChart.prototype.constructor = ChartLib.Basic2AxisChart;

/**
* Basic dot in a scatterplot
*/
ChartLib.BasicDot = function (x, y, radius, color) {
	// inherit Pixi.js Graphics object
	PIXI.Graphics.apply(this, arguments);
	this.type = "basicDot";

	this._x = x;
	this._y = y;
	this._radius = radius;
	this._color = color;

	this.init = function (element) {
	};

	this.draw = function () {
		this.clear();
		this.beginFill(this._color);
		this.drawCircle( this._x - (this._radius/2), this._y - (this._radius/2), this._radius);
		this.endFill();
	};
}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.BasicDot.prototype = Object.create( PIXI.Graphics.prototype );
ChartLib.BasicDot.prototype.constructor = ChartLib.BasicDot;

/**
* Scatterplot - simple
*/
ChartLib.ScatterPlot = function(dots, color, pxs) {
	// inherit Pixi.js Graphics object
	PIXI.Graphics.apply(this, arguments);
	this.type = "scatterPlot";

	this._dots = dots;
	this.addChild(this._dots);
	this._color = color;
	this._pxs = pxs;

	this.init = function (element) {
	};

	this.draw = function () {
		// draw dots & lines
		for (var i=0; i<this._dots.children.length; i++) {
			this._dots.children[i].update();
		}
	}
}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.ScatterPlot.prototype = Object.create( PIXI.Graphics.prototype );
ChartLib.ScatterPlot.prototype.constructor = ChartLib.ScatterPlot;

ChartLib.ScatterPlotChart = function(element) {
	ChartLib.Basic2AxisChart.apply(this);
	this.type = "scatterPlotChart";

	this.init = function (element) {
		// call super init
		this.init2AxisChart(element);

		// column container
		if (!this.scatterPlotContainer) {
			this.scatterPlotContainer = new PIXI.DisplayObjectContainer();
			this.addChild(this.scatterPlotContainer);

			var i=0;
			for (var scatterPlot = element.firstChild; scatterPlot; scatterPlot = scatterPlot.nextSibling) {
				var dotContainer = new PIXI.DisplayObjectContainer();
				var scatterPlotColor = i*0x888888;
				for (var dot = scatterPlot.firstChild; dot; dot = dot.nextSibling) {
					var x = this._x_axis_x + this._axisScale_x(parseFloat(dot.getAttribute("x")));
					var y = this._y_axis_y - this._axisScale_y(parseFloat(dot.getAttribute("y")));

					var newDot = new ChartLib.BasicDot(x, y, this._pxs/5, scatterPlotColor);
					dotContainer.addChild(newDot);
				}

				var newScatterPlot = new ChartLib.ScatterPlot(dotContainer, scatterPlotColor, this._pxs);
				this.scatterPlotContainer.addChild(newScatterPlot);
				i++;
			}
		}
	};

	this.draw = function () {
		// draw scatterPlots
		for (var i = 0; i<this.scatterPlotContainer.children.length; i++) {
			this.scatterPlotContainer.children[i].draw();
		}
	};

	this.init(element);
}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.ScatterPlotChart.prototype = Object.create( ChartLib.Basic2AxisChart.prototype );
ChartLib.ScatterPlotChart.prototype.constructor = ChartLib.ScatterPlotChart;


/**
* Simple Line with dots
*/
ChartLib.Line = function(dots, color, pxs) {
	// inherit Pixi.js Graphics object
	PIXI.Graphics.apply(this, arguments);
	this.type = "line";

	this._dots = dots;
	this._color = color;
	this._pxs = pxs;

	this.init = function (element) {
	};

	this.draw = function () {
		// draw dots & lines
		for (var i=0; i<this._dots.children.length; i++) {
			//this.dotContainer.children[i].update();
			// draw line that connect two dots
			if (i>0 && i<this._dots.children.length-1) {
				this.lineStyle(this._pxs*0.1, this._color, 1.0);
				this.beginFill(this._color);
				this.moveTo(this._dots.children[i-1]._x, this._dots.children[i-1]._y);
				this.lineTo(this._dots.children[i]._x, this._dots.children[i]._y);
				this.endFill();
			}
		}
	}

}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.Line.prototype = Object.create( PIXI.Graphics.prototype );
ChartLib.Line.prototype.constructor = ChartLib.Line;

/**
* Linechart
*/
ChartLib.LineChart = function(element) {
	ChartLib.Basic2AxisChart.apply(this);
	this.type = "lineChart";

	this.init = function (element) {
		// call super init
		this.init2AxisChart(element);

		// column container
		if (!this.lineContainer) {
			this.lineContainer = new PIXI.DisplayObjectContainer();
			this.addChild(this.lineContainer);

			var i=0;
			for (var line = element.firstChild; line; line = line.nextSibling) {
				var dotContainer = new PIXI.DisplayObjectContainer();
				var lineColor = i*0x888888;

				// this.columnContainer.removeChildren();
				for (var dot = line.firstChild; dot; dot = dot.nextSibling) {
					var x = this._x_axis_x + this._axisScale_x(parseFloat(dot.getAttribute("x")));
					var y = this._y_axis_y - this._axisScale_y(parseFloat(dot.getAttribute("y")));

					var newDot = new ChartLib.BasicDot(x, y, this._pxs/5, lineColor);
					dotContainer.addChild(newDot);
				}

				var newLine = new ChartLib.Line(dotContainer, lineColor, this._pxs);
				this.lineContainer.addChild(newLine);
				i++;
			}
		}
	};

	this.draw = function () {
		for (var i=0; i<this.lineContainer.children.length; i++) {
			this.lineContainer.children[i].draw();
		}

	};

	this.init(element);
}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.LineChart.prototype = Object.create( ChartLib.Basic2AxisChart.prototype );
ChartLib.LineChart.prototype.constructor = ChartLib.LineChart;

/**
* Pie Segment
*/
ChartLib.PieSegment = function(angle, startAngle, radius, centerX, centerY, color, pxs, centerPadding) {
	// inherit Pixi.js Graphics object
	PIXI.Graphics.apply(this, arguments);
	this.type = "pieSegment";

	this._angle = angle;
	this._startAngle = startAngle;
	this._radius = radius;
	this._center_x = centerX;
	this._center_y = centerY;
	this._color = color;
	this._pxs = pxs;

	// centerPadding
	this._cp = centerPadding;

	this.init = function (element) {
	};

	this.draw = function () {
		this.beginFill(this._color);
		this.moveTo(this._center_x, this._center_y);
		this.arc(	this._center_x, this._center_y, this._radius, this._startAngle, this._startAngle + this._angle);
		this.endFill();

		// text
		var text = new PIXI.Text(Math.floor(this._angle * (180/Math.PI) / 360 * 100) + "%", {font: this._pxs + "px sans-serif", fill:"white"});

		// width at radius/2
		var angleWidthX = 	Math.abs(
													Math.cos(this._startAngle)*(this._radius*this._cp) -
													Math.cos(this._startAngle + this._angle)*(this._radius*this._cp)
												);

		var angleWidthY = 	Math.abs(
													Math.sin(this._startAngle)*(this._radius*this._cp) -
													Math.sin(this._startAngle + this._angle)*(this._radius*this._cp)
												);

		var angleWidthDiag = Math.sqrt(angleWidthX*angleWidthX + angleWidthY*angleWidthY);

		var textAngle = this._startAngle + (this._angle / 2);
		var quarter = Math.floor(textAngle / (Math.PI/2));
		switch(quarter) {
			// southeast
			case 0:
				if (text.width < angleWidthDiag && text.height < this._radius ) {
					text.position.x = this._center_x + Math.cos(textAngle)*((this._radius)*this._cp);
					text.position.y = this._center_y + Math.sin(textAngle)*((this._radius)*this._cp);
				}
				break;
			// southwest
			case 1:
				if (text.width < angleWidthDiag && text.height < this._radius ) {
					text.position.x = this._center_x + Math.cos(textAngle)*((this._radius)*this._cp);
					text.position.y = this._center_y + Math.sin(textAngle)*((this._radius)*this._cp);
				}
				break;
			// nordwest
			case 2:
				if (text.width < this._radius && text.height < angleWidthY ) {
					text.position.x = this._center_x + Math.cos(textAngle)*((this._radius + text.width/2)*this._cp);
					text.position.y = this._center_y + Math.sin(textAngle)*((this._radius + text.height)*this._cp);
				}
				break;
			// nordeast
			case 3:
				if (text.width < this._radius && text.height < angleWidthY ) {
					text.position.x = this._center_x + Math.cos(textAngle)*((this._radius )*this._cp);
					text.position.y = this._center_y + Math.sin(textAngle)*((this._radius + text.height)*this._cp);
				}
				break;
			default:
				break;
		}

		this.addChild(text);
	}
}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.PieSegment.prototype = Object.create( PIXI.Graphics.prototype );
ChartLib.PieSegment.prototype.constructor = ChartLib.PieSegment;

/**
* Pie Chart
*/
ChartLib.PieChart = function(element) {
	ChartLib.BasicChart.apply(this);
	this.type = "donutChart";

	this.init = function (element) {
		// call super init
		this.initDefault(element);

		this._max_width = parseFloat(element.getAttribute("max_width"))*this._scale;
		this._max_height = parseFloat(element.getAttribute("max_height"))*this._scale;

		this._center_x = (this._x + (this._width/2)) * this._scale;
		this._center_y = (this._y + (this._height/2)) * this._scale;

		this.radius = d3.min([this._max_width, this._max_height])/2;

		if (!this.segmentContainer) {
			this.segmentContainer = new PIXI.DisplayObjectContainer();
			this.addChild(this.segmentContainer);

			var i=0;
			var startAngle = 0;

			var color = d3.scale.category20c();
			for (var segment = element.firstChild; segment; segment = segment.nextSibling) {
				var angle = parseFloat(segment.getAttribute("val"));

				segmentColor = parseInt(color(segment.getAttribute("name")).replace("#", "0x"));

				var newSegment = new ChartLib.PieSegment(angle, startAngle, this.radius,
											this._center_x, this._center_y, segmentColor, this._pxs, 0.75);

				this.segmentContainer.addChild(newSegment);
				startAngle += angle;
				i++;
			}
		}
	};

	this.draw = function () {
		for (var i=0; i<this.segmentContainer.children.length; i++) {
			this.segmentContainer.children[i].draw();
		}
	};

	this.init(element);
}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.PieChart.prototype = Object.create( ChartLib.BasicChart.prototype );
ChartLib.PieChart.prototype.constructor = ChartLib.PieChart;

/**
* Donut Chart. Hole-radius is 1/2 of full radius
*/
ChartLib.DonutChart = function(element) {
	ChartLib.BasicChart.apply(this);
	this.type = "donutChart";

	this.init = function(element) {
		// call super init
		this.initDefault(element);

		this._max_width = parseFloat(element.getAttribute("max_width"))*this._scale;
		this._max_height = parseFloat(element.getAttribute("max_height"))*this._scale;

		this._center_x = (this._x + (this._width/2)) * this._scale;
		this._center_y = (this._y + (this._height/2)) * this._scale;

		this.radius = d3.min([this._max_width, this._max_height])/2;

		if (!this.segmentContainer) {
			this.segmentContainer = new PIXI.DisplayObjectContainer();
			this.addChild(this.segmentContainer);

			var i=0;
			var startAngle = 0;
			var color = 0xFF3333;

			for (var segment = element.firstChild; segment; segment = segment.nextSibling) {
				var angle = parseFloat(segment.getAttribute("val"));
				color = color + i*0x003333;

				var newSegment = new ChartLib.PieSegment(angle, startAngle, this.radius,
					this._center_x, this._center_y, color, this._pxs, 0.75);

				this.segmentContainer.addChild(newSegment);
				startAngle += angle;
				i++;
			}

			// donut hole
			var color = 0xFFFFFF;
			var newSegment = new ChartLib.PieSegment(2*Math.PI, 0, this.radius/2,
					this._center_x, this._center_y, color, this._pxs, 0);
			this.segmentContainer.addChild(newSegment);
		}
	};

	this.draw = function () {
		for (var i=0; i<this.segmentContainer.children.length; i++) {
			this.segmentContainer.children[i].draw();
		}
	};

	this.init(element);
}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.DonutChart.prototype = Object.create( ChartLib.BasicChart.prototype );
ChartLib.DonutChart.prototype.constructor = ChartLib.DonutChart;

/**
* Treemap node (simple, colored rectangle)
*/
ChartLib.TreemapNode = function(name, x, y, width, height, color, pxs) {
	// inherit Pixi.js Graphics object
	PIXI.Graphics.apply(this, arguments);
	this.type = "treemapNode";

	this._name = name;
	this._x = x;
	this._y = y;
	this._width = width;
	this._height = height;
	this._color = color;
	this._pxs = pxs;

	this.init = function() {
	};

	this.draw = function() {
		// only parent nodes got a color, so children have to be transparent
		this._color ? this.beginFill(this._color) : this.beginFill(0x000000, 0.0);
		this.lineStyle(1, 0xFFFFFF, 0.3);
		this.drawRect(this._x, this._y, this._width, this._height);
		this.endFill();

		// label
		if (name) {
			var text = new PIXI.Text(this._name, {font: this._pxs*0.5 + "px sans-serif", fill:"black"});
			if (text.width < this._width && text.height < this._height - this._pxs) {
				text.position.x = this._x + this._pxs*0.1;
				text.position.y = this._y + this._pxs*0.1;
				this.addChild(text);
			}
		}
	};
}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.TreemapNode.prototype = Object.create( PIXI.Graphics.prototype );
ChartLib.TreemapNode.prototype.constructor = ChartLib.TreemapNode;

/**
* Treemap
*/
ChartLib.Treemap = function(element) {
	ChartLib.BasicChart.apply(this);
	this.type = "treemap";

	this.init = function(element) {
		// call super init
		this.initDefault(element);

		if (!this.nodeContainer) {
			this.nodeContainer = new PIXI.DisplayObjectContainer();
			this.addChild(this.nodeContainer);

			for (var node = element.firstChild; node; node = node.nextSibling) {
				var x = parseFloat(node.getAttribute("left")) * this._scale;
				var y = parseFloat(node.getAttribute("top")) * this._scale;
				var width = parseFloat(node.getAttribute("width")) * this._scale;
				var height = parseFloat(node.getAttribute("height")) * this._scale;
				var color = parseInt(node.getAttribute("background"));
				var name = node.getAttribute("name");

				var treemapNode = new ChartLib.TreemapNode(name, x, y, width, height, color, this._pxs);
				this.nodeContainer.addChild(treemapNode);
			}
		}
	};

	this.draw = function() {
		for (var i=0; i<this.nodeContainer.children.length; i++) {
			this.nodeContainer.children[i].draw();
		}
	};

	this.init(element);
}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.Treemap.prototype = Object.create( ChartLib.BasicChart.prototype );
ChartLib.Treemap.prototype.constructor = ChartLib.Treemap;

/**
* Heatmap node - a rect in a heatmap, its color represents its value
*/
ChartLib.HeatmapNode = function(value, x, y, width, height, color) {
	// inherit Pixi.js Graphics object
	PIXI.Graphics.apply(this, arguments);
	this.type = "heatmapNode";

	this._value = value;
	this._x = x;
	this._y = y;
	this._width = width;
	this._height = height;
	this._color = color;

	this.init = function () {

	};

	this.draw = function () {
		this.clear();
		this.beginFill(this._color);
		this.lineStyle(3, 0xFFFFFF, 0.3);
		this.drawRect(this._x, this._y, this._width, this._height);
		this.endFill();
	};

	this.update = function(color) {
		this._color = color;
		this.draw();
	}
}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.HeatmapNode.prototype = Object.create( PIXI.Graphics.prototype );
ChartLib.HeatmapNode.prototype.constructor = ChartLib.HeatmapNode;

/**
* Heatmap, using treemap nodes
*/
ChartLib.Heatmap = function(element) {
	ChartLib.Basic2AxisChart.apply(this);
	this.type = "heatmap";

	this.init = function(element) {
		// call super init
		this.init2AxisChart(element);

		if (!this.nodeContainer) {
			this.nodeContainer = new PIXI.DisplayObjectContainer();
			this.addChild(this.nodeContainer);

			// calc grid size
			var cellCount = element.children.length;
			var cellWidth = parseFloat(element.getAttribute("cell_width")) * this._scale;
			var cellHeight = parseFloat(element.getAttribute("cell_height")) * this._scale;

			for (var node = element.firstChild; node; node = node.nextSibling) {
				var x = parseFloat(node.getAttribute("x")) * this._scale + 4.05*this._pxs;
				var y = parseFloat(node.getAttribute("y")) * this._scale + this._pxs;
				var width = cellWidth;
				var height = cellHeight;
				var color = parseInt(node.getAttribute("fill").replace("#", "0x"));
				var value = node.getAttribute("value");

				var heatmapNode = new ChartLib.HeatmapNode(value, x, y, width, height, color);
				this.nodeContainer.addChild(heatmapNode);
			}
		}
	};

	this.draw = function() {
		var i=0;
		for (var node = element.firstChild; node; node = node.nextSibling) {
			var color = parseInt(node.getAttribute("fill").replace("#", "0x"));
			this.nodeContainer.children[i].update(color);
			i++;
		}
	};

	this.init(element);
}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.Heatmap.prototype = Object.create( ChartLib.Basic2AxisChart.prototype );
ChartLib.Heatmap.prototype.constructor = ChartLib.Heatmap;
