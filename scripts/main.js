var selected_id = null;
var top_stuck = false;
function $(s){ return document.getElementById(s); }
function act(id) {
  if(id == selected_id) return;
  switch(id) {
    case 'listings': break;
    case 'about': break;
    case 'newsletter': break;
    case 'information': break;
    case 'press': break;
    case 'contact':break;
    default: console.log(id); break;
  }
}
window.onscroll = function() {
  if (!top_stuck && window.pageYOffset >= $('logo').offsetHeight) {
    top_stuck = true;
    var cover = $('cover');
    var left = cover.offsetLeft;
    cover.style['-webkit-transition'] ='';
    cover.style.position = 'fixed';
    cover.style['padding-left'] = cover.style['padding-right'] = left + 'px';
    cover.style['top'] = 0;
  } else if (top_stuck && window.pageYOffset < $('logo').offsetHeight) {
    top_stuck = false;
    var cover = $('cover');
    cover.style['padding-left'] = cover.style['padding-right'] = 0;
    cover.style.position = 'static';
  }
};

function handler(evt) {
  var children = $('headers').children;
  for(var j = 0; j < children.length; j++)
    children[j].className = '';
  this.className = 'selected';
  act(this.id);
  selected_id = this.id;
}

window.onload = function() {
  var MAX_WIDTH = 510;
  var cover = $('cover');
  cover.style['-webkit-transition'] ='all .5s ease-in-out';
  setTimeout(function(){
      if (cover.offsetWidth >= MAX_WIDTH) {
      cover.style.overflow = 'hidden';
      }
      cover.style.opacity = '1';
      }, 0);
  var children = $('headers').children;
  for(var i = 0; i < children.length; i++) {
    new goog.FastButton(children[i], handler);
  }
};

