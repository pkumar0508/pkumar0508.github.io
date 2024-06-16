// adapted from Eloquent Javascript, Edition 2, Chapter 19

function createPaint() {
  var canvas = document.getElementById( "gl-canvas" );
  var cx = canvas.getContext("2d");

  cx.canvas.addEventListener("mousedown", function(event) {
    if (event.which == 1) {
      line(event, cx);
      event.preventDefault();
    }
  });
}

function relativePos(event, element) {
  var rect = element.getBoundingClientRect();
  return {x: Math.floor(event.clientX - rect.left),
          y: Math.floor(event.clientY - rect.top)};
}

function trackDrag(onMove, onEnd) {
  function end(event) {
    removeEventListener("mousemove", onMove);
    removeEventListener("mouseup", end);
    if (onEnd)
      onEnd(event);
  }
  addEventListener("mousemove", onMove);
  addEventListener("mouseup", end);
}

line = function(event, cx, onEnd) {
  var pos = relativePos(event, cx.canvas);
  trackDrag(function(event) {
    cx.beginPath();
    cx.moveTo(pos.x, pos.y);
    pos = relativePos(event, cx.canvas);
    cx.lineTo(pos.x, pos.y);
    cx.stroke();
  }, onEnd);
};
