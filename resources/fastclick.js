var qoob = {};

qoob.clickbuster = {};

qoob.FastButton = function(element, handler) {
  this.element = element;
  this.handler = handler;

  element.addEventListener('touchstart', this, false);
  element.addEventListener('click', this, false);
};

qoob.FastButton.prototype.handleEvent = function(event) {
  switch (event.type) {
    case 'touchstart': this.onTouchStart(event); break;
    case 'touchmove': this.onTouchMove(event); break;
    case 'touchend': this.onClick(event); break;
    case 'click': this.onClick(event); break;
  }
};

qoob.FastButton.prototype.onTouchStart = function(event) {
  event.stopPropagation();

  this.element.addEventListener('touchend', this, false);
  document.body.addEventListener('touchmove', this, false);

  this.startX = event.touches[0].clientX;
  this.startY = event.touches[0].clientY;
};

qoob.FastButton.prototype.onTouchMove = function(event) {
  if (Math.abs(event.touches[0].clientX - this.startX) > 10 ||
      Math.abs(event.touches[0].clientY - this.startY) > 10) {
    this.reset();
  }
};

qoob.FastButton.prototype.onClick = function(event) {
  event.stopPropagation();
  this.reset();
  this.handler(event);

  if (event.type == 'touchend') {
    qoob.clickbuster.preventGhostClick(this.startX, this.startY);
  }
};

qoob.FastButton.prototype.reset = function() {
  this.element.removeEventListener('touchend', this, false);
  document.body.removeEventListener('touchmove', this, false);
};

qoob.clickbuster.preventGhostClick = function(x, y) {
  qoob.clickbuster.coordinates.push(x, y);
  window.setTimeout(qoob.clickbuster.pop, 2500);
};

qoob.clickbuster.pop = function() {
  qoob.clickbuster.coordinates.splice(0, 2);
};

qoob.clickbuster.onClick = function(event) {
  for (var i = 0; i < qoob.clickbuster.coordinates.length; i += 2) {
    var x = qoob.clickbuster.coordinates[i];
    var y = qoob.clickbuster.coordinates[i + 1];
    if (Math.abs(event.clientX - x) < 25 && Math.abs(event.clientY - y) < 25) {
      event.stopPropagation();
      event.preventDefault();
    }
  }
};

document.addEventListener('click', qoob.clickbuster.onClick, true);
qoob.clickbuster.coordinates = [];
