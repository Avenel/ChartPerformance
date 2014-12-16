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

		// Title
		this._title = element.getAttribute("title");

		// domain
		this._domain_min = parseFloat(element.getAttribute("domain_min"));
		this._domain_max = parseFloat(element.getAttribute("domain_max"));
		this._domain = [this._domain_min, this._domain_max];

		// set animate to true, because there is new data in town!
		this._animate = true;

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
	this._animate = true;
	this.init(element);
	this.draw();
};

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
				wordWrap: true, wordWrapWith: this._categoryLabelWidth, align:"right"});

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
	}

	this.draw();

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
		}

		// values
		this.horizontalTGContainer.removeChildren();
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
	};

	this.draw = function () {
		// axis
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
	}

	this.draw();

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
		}

		// values
		this.verticalTGContainer.removeChildren();
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
		};

	this.draw = function () {
		// axis
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
	this.addChild(this._valueLabel);

	// draw simple bar
	this.draw = function() {
		this.beginFill(this._color);
		this.drawRect( this._x, this._y, this._width, this._height);
		this.endFill();

		if (this._textPos == TextPositionEnum.RIGHT) {
			this._valueLabel.position.x = this._x + this._width + 0.3*this._pxs;
		}

		if (this._textPos == TextPositionEnum.INNER) {
			// ommit too small widths
			if (this._valueLabel.width < this._width - 0.5*this._pxs) {
				this._valueLabel.visible = true;
				this._valueLabel.position.x = this._x + (this._width / 2) - this._valueLabel.width/2;
			} else {
				this._valueLabel.visible = false;
			}
		}
	};

	this.update = function (width) {
		this._width = width;
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
			var barY = parseFloat(child.getAttribute("y")) * this._scale;
			var currentBarWidth = (val > this._currentWidth)? this._axisScale(this._currentWidth) : barWidth;

			this.barContainer.children[i].update(currentBarWidth);
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

	// draw simple column
	this.draw = function () {
		this.clear();
		this.beginFill(this._color);
		this.drawRect( this._x, this._y, this._width, -this._height);
		this.endFill();

		if (this._textPos == TextPositionEnum.TOP) {
			this._valueLabel.position.y = this._y - this._height - 1.3*this._pxs;
		}

		if (this._textPos == TextPositionEnum.INNER) {
			// ommit to small height
			if (this._valueLabel.height < this._height - 1*this._pxs) {
				this._valueLabel.visible = true;
				this._valueLabel.position.y = this._y - (this._height / 2) - this._valueLabel.height/2;
			} else {
				this._valueLabel.visible = false;
			}
		}
	};

	this.update = function (height) {
		this._height = height;
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

			this.columnContainer.children[i].update(currentColumnHeight);
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

	this.update = function(heights) {
		for (var i=0; i<this.children.length; i++) {
			this.children[i].update(heights[i]);
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

			this.stackedColumnContainer.children[i].update(heights);
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

	this.update = function(widths) {
		for (var i=0; i<this.children.length; i++) {
			this.children[i].update(widths[i]);
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

			this.stackedBarContainer.children[i].update(widths);
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

	this.update = function(heights) {
		for (var i=0; i<this.children.length; i++) {
			this.children[i].update(heights[i]);
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

			this.groupedColumnContainer.children[i].update(heights);
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

	this.update = function(widths) {
		for (var i=0; i<this.children.length; i++) {
			this.children[i].update(widths[i]);
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

			this.groupedBarContainer.children[i].update(widths);
			i++;
		}
	};

	this.init(element);
	this.draw();
}

// Set prototype object to the accordinate Pixi.js Graphics object
ChartLib.GroupedBarChart.prototype = Object.create( ChartLib.BasicHorizontalChart.prototype );
ChartLib.GroupedBarChart.prototype.constructor = ChartLib.GroupedBarChart;
