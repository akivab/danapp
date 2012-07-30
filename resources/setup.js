var qoob = qoob || {};

function $(s){
  return document.getElementById(s);
}

window.addEventListener('load', function(){
  var pageControl = new qoob.PageControl();
  window.updatePage = function(data) {
    pageControl.updatePage(data);
  }
  window.updateNewsletter = function(data) {
    pageControl.updateNewsletter(data);
  }
});

qoob.PageControl = function() {
  this.headers = $('headers');
  this.cover = $('cover');
  this.headersChildren = headers.children;
  this.topStuck = false;
  this.selectedId = '';
  this.viewedNewsletters = {};
  this.loadedObjects = {};
  this.setupPage();
};

qoob.PageControl.selectedHeaderClassName = 'selected';
qoob.PageControl.pageHost = '/d';

qoob.PageControl.prototype.act = function(element) {
  if (element.className == qoob.PageControl.selectedHeaderClassName) {
    return;
  }
  if (!element || !element.id) {
    return;
  }

  window.location.hash = element.id;
  window.scrollTo(0,0);

  for (var i = 0; i < this.headersChildren.length; i++) {
    this.headersChildren[i].className = '';
  }
 
  this.clearMain(element);
};

qoob.PageControl.prototype.clearMain = function(element) {
  element.className = qoob.PageControl.selectedHeaderClassName;
  this.swapPageElement(element.id);
};

qoob.PageControl.prototype.moreHandler = function(div) {
  var tmp = this;
  return function(evt) {
    var content = div.getElementsByClassName('newscontent')[0];
    var oldHeight = parseInt(div.style.maxHeight);
    var newHeight = oldHeight + 1000;
    if (content.offsetHeight >= oldHeight)
      div.style.maxHeight = newHeight + 'px';
  };
};

qoob.PageControl.prototype.updateNewsletter = function(data) {
  var divInfo = document.createElement('div');
  this.populatePage(data, divInfo);
  divInfo.className = 'newscontent';
  this.clickedNewsletterDiv.appendChild(divInfo);
};

qoob.PageControl.prototype.newsHandler = function(obj, file) {
  var tmp = this;
  return function(evt) {
    var headline = obj.getElementsByClassName('headline')[0];
    var more = obj.getElementsByClassName('clickformore')[0];
    if (!more) {
      more = document.createElement('a');
      more.className = 'clickformore';
      more.appendChild(document.createTextNode('more'));
      obj.appendChild(more);
      obj.style.maxHeight = '300px';
      new qoob.FastButton(more, tmp.moreHandler(obj));
    }
    if (!tmp.viewedNewsletters[file]) {
      tmp.getNewsletter(obj, file);
      tmp.viewedNewsletters[file] = true;
      headline.className = 'headline selected';
    } else {
      var child = obj.getElementsByClassName('newscontent')[0];
      var moreButton = obj.getElementsByClassName('clickformore')[0];
      if (child.style.display == 'none') {
        moreButton.style.display = child.style.display = 'inherit';
        headline.className = 'headline selected';
        obj.style.maxHeight = '300px';
      } else {
        obj.style.maxHeight = '100px';
        setTimeout(function() {
            moreButton.style.display = child.style.display = 'none';
            headline.className = 'headline';
        }, 500);
      }
    }
  };
};

qoob.PageControl.prototype.populatePage = function(data, obj) {
  for(var i in data) {
    var line = data[i];
    var lineObj = document.createElement(line.t);
    line.s && (lineObj.src = line.s);
    line.c && (lineObj.className = line.c);
    line.r && (lineObj.href = line.r);
    line.h && (lineObj.appendChild(document.createTextNode(line.h)));
    (line.t == 'a') && (lineObj.target = '_blank');
    if(line.nh) {
      var mainDiv = document.createElement('div');
      mainDiv.className = 'newscover';
      mainDiv.appendChild(lineObj);
      obj.appendChild(mainDiv);
      new qoob.FastButton(lineObj, this.newsHandler(mainDiv, line.nh)); 
    } else {
      obj.appendChild(lineObj);
    }
  }
};

qoob.PageControl.prototype.updatePage = function(data) {
  var allLinesObj = document.createElement('div');
  this.populatePage(data, allLinesObj);
  this.loadedObjects[this.selectedId] = allLinesObj;
  this.swapPageElement(this.selectedId);
};

qoob.PageControl.prototype.getNewsletter = function(element, file) {
  this.clickedNewsletterDiv = element;
  addScript('updateNewsletter', 'updateNewsletter', file)
};

function addScript(mainFunc, callbackFunc, opt_additionalInfo) {
  var script = document.createElement('script');
  var url = qoob.PageControl.pageHost + '?';
  url += 'e=' + mainFunc;
  url += '&c=' + callbackFunc;
  if (opt_additionalInfo) {
    url += '&f=' + opt_additionalInfo;
  }
  script.src = url;
  document.getElementsByTagName('head')[0].appendChild(script);
}

qoob.PageControl.prototype.swapPageElement = function(elementId) {
  this.selectedId = elementId;
  var loadedObject = this.loadedObjects[elementId];
  if (loadedObject) {
    this.renderPage(loadedObject);
    return;
  }
  addScript(elementId, 'updatePage');
};

qoob.PageControl.prototype.renderPage = function(element) {
  var main = $('main');
  main.style.opacity = '0';
  setTimeout(function() {
      while(main.firstChild) main.removeChild(main.firstChild);
      main.appendChild(element);
      setTimeout(function(){
        main.style.opacity = '1';
      }, 0);
  }, 200);
};

qoob.PageControl.prototype.checkForChanges = function() {
  this.unstickCover();
  this.getWindowScroll();
};

qoob.PageControl.prototype.setupPage = function() {
  this.unstickCover();
  this.cover.style.opacity = '1';
  for (var i = 0; i < this.headersChildren.length; i++) {
    this.getFastButton(this.headersChildren[i]);
  }
 
  var tmp = this; 
  var checkFunction = function() { tmp.checkForChanges(); };
  window.addEventListener('load', checkFunction);
  window.addEventListener('scroll', checkFunction);
  window.addEventListener('resize', checkFunction);
  setInterval(function(){
    if (window.location.hash != '') {
      var hash = window.location.hash.substring(1);
      var el = $(hash);
      el && tmp.act(el);
    }
  }, 100);
};

qoob.PageControl.prototype.getFastButton = function(headerElement) {
  var tmp = this;
  var handler = function(evt) {
    tmp.act(headerElement);
  }
  return new qoob.FastButton(headerElement, handler);
};

qoob.PageControl.prototype.controlScroller = function() {
  if (document.body.offsetWidth >= this.headers.offsetWidth) {
    this.cover.style.overflow = 'hidden';
    this.cover.style.width = this.headers.offsetWidth + 'px';
  } else { 
    this.cover.style.overflow = 'scroll';
    this.cover.style.width = document.body.offsetWidth + 'px';
  }
};

qoob.PageControl.prototype.stickCover = function() {
  var left = this.cover.offsetLeft;
  this.controlScroller();
  this.topStuck = true;
  this.cover.className = 'stuck';
  this.cover.style.paddingLeft = this.cover.style.paddingRight = left + 'px';
};

qoob.PageControl.prototype.unstickCover = function() {
  this.controlScroller();
  this.topStuck = false;
  this.cover.style.paddingLeft = this.cover.style.paddingRight = 0;
  this.cover.className = 'unstuck';
}

qoob.PageControl.prototype.getWindowScroll = function() { 
  if (!this.topStuck && 
      window.pageYOffset >= $('logo').offsetHeight) {
    this.stickCover();
  } else if (this.topStuck &&
      window.pageYOffset < $('logo').offsetHeight) {
    this.unstickCover();
  }
};

