var size = {width: + d3.select('canvas').attr('width'), height: + d3.select('canvas').attr('height')}
rotate = [10, -10],
velocity = [.03, -.001],
time = Date.now();

var diameter = 320,
    radius = diameter/2,
    velocity = .01,
    then = Date.now();

var simplify = d3.geo.transform({ point: function(x, y, z) { this.stream.point(x, y); } })
var projection = d3.geo.orthographic()
    .scale(radius - 2)
    .translate([radius, radius])
    .clipAngle(90);

var path = d3.geo.path().projection(projection)

var svg = d3.select('.right').append('svg')
          .style('position', 'absolute')
         .style('top', size.height - 75)
        .style('left', '0')
          .attr(size)
        .attr('height', 100)

var webgl = d3.select('canvas')

d3.json('world-110m.json', draw_world)

function draw_world(err, world) {
  if (err) return

  webgl
  .append("path")
  .datum(topojson.mesh(world, world.objects.land, function(a, b) { return a == b && a.id !== 10 }))
  .attr({ class: 'world'
        , d: path
        , fill: 'grey'
        });
}

d3.timer(function() {
    var angle = velocity * (Date.now() - then);
    projection.rotate([angle,0,0]);
    d3.json('world-110m.json', draw_world);
});

function distance (x1, y1, x2, y2) {
  var xd = x2 - x1, yd = y2 - y1
  return xd * xd + yd * yd
}
