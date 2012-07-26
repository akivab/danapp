var goog = {};

goog.clickbuster = {};

goog.FastButton = function(element, handler) {
  this.element = element;
  this.handler = handler;

  element.addEventListener('touchstart', this, false);
  element.addEventListener('click', this, false);
};

goog.FastButton.prototype.handleEvent = function(event) {
  switch (event.type) {
    case 'touchstart': this.onTouchStart(event); break;
    case 'touchmove': this.onTouchMove(event); break;
    case 'touchend': this.onClick(event); break;
    case 'click': this.onClick(event); break;
  }
};

goog.FastButton.prototype.onTouchStart = function(event) {
  event.stopPropagation();

  this.element.addEventListener('touchend', this, false);
  document.body.addEventListener('touchmove', this, false);

  this.startX = event.touches[0].clientX;
  this.startY = event.touches[0].clientY;
};

goog.FastButton.prototype.onTouchMove = function(event) {
  if (Math.abs(event.touches[0].clientX - this.startX) > 10 ||
      Math.abs(event.touches[0].clientY - this.startY) > 10) {
    this.reset();
  }
};

goog.FastButton.prototype.onClick = function(event) {
  event.stopPropagation();
  this.reset();
  this.handler(event);

  console.log("YOU CLICKED DUMBASS");
  if (event.type == 'touchend') {
    goog.clickbuster.preventGhostClick(this.startX, this.startY);
  }
};

goog.FastButton.prototype.reset = function() {
  this.element.removeEventListener('touchend', this, false);
  document.body.removeEventListener('touchmove', this, false);
};

goog.clickbuster.preventGhostClick = function(x, y) {
  goog.clickbuster.coordinates.push(x, y);
  window.setTimeout(goog.clickbuster.pop, 2500);
};

goog.clickbuster.pop = function() {
  goog.clickbuster.coordinates.splice(0, 2);
};

goog.clickbuster.onClick = function(event) {
  for (var i = 0; i < goog.clickbuster.coordinates.length; i += 2) {
    var x = goog.clickbuster.coordinates[i];
    var y = goog.clickbuster.coordinates[i + 1];
    if (Math.abs(event.clientX - x) < 25 && Math.abs(event.clientY - y) < 25) {
      event.stopPropagation();
      event.preventDefault();
    }
  }
};

document.addEventListener('click', goog.clickbuster.onClick, true);
goog.clickbuster.coordinates = [];
