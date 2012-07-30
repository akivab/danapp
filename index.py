from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
import re
import os
from google.appengine.ext.webapp import template
from django.utils import simplejson as json

def get_path(path_):
  return os.path.join(os.path.dirname(__file__), path_)

def ls(path_):
  return os.listdir(get_path(path_))

class MainPage(webapp.RequestHandler):
  def get(self):
    self.response.out.write(template.render(get_path('main.html'), {}))

class DataProvider(webapp.RequestHandler):
  def __init__(self):
    super(DataProvider, self).__init__()
    self.data = []

  def append(self, tag = None, content = None, src = None, className = None,
      href = None):
    tmpObj = {}
    if tag: tmpObj['t'] = tag
    if content: tmpObj['h'] = content
    if src: tmpObj['s'] = src
    if className: tmpObj['c'] = className
    if href: tmpObj['r'] = href
    self.data.append(tmpObj)

  def about(self):
    lines = open(get_path('data/bio.txt')).readlines()
    self.append(tag = 'img', src = '/i/dan.jpg')
    for line in lines:
      self.append(tag = 'p', content = line)

  def listings(self): 
    dirs = ls('data/listings')
    for i in dirs:
      pic_names = ls('data/images/%s' % i)
      details = get_path('data/listings/%s/details.txt' % i)
      detail_lines = open(details).readlines()
      for line in detail_lines:
        self.append(tag = 'p', content = line)
      for j in pic_names:
        self.append(tag = 'img', src = '/i/%s/%s' % (i,j))

  def newsletter(self):
    dirs = reversed(sorted(ls('data/newsletters')))
    for d in dirs:
      lines = open(get_path('data/newsletters/%s' % d)).readlines()
      title = lines[0]
      url = lines[1]
      date = lines[2].strip()
      self.data.append({'t':'div','h':title, 'nh':d, 'c': 'headline'})
    self.append(tag = 'a', content = 'subscribe',
        href = 'http://eepurl.com/eQ-aU', className = 'subscribe')

  def updateNewsletter(self):
    f = self.request.get('f')
    if not re.search('^\d+\.txt$', f): return
    image_regex = '^\s*http\:\/\/\S+(jpe?g|png|gif)\s*$'
    link_regex = 'https?\:\/\/\S+'
    lines = open(get_path('data/newsletters/%s' % f)).readlines()
    for line in lines:
      if re.search(image_regex, line, re.IGNORECASE):
        self.append(tag = 'img', src = line, className = 'newsletter')
      elif not re.search(link_regex, line):
        self.append(tag = 'p', content = line)
      else:
        for link in re.finditer(link_regex, line, re.IGNORECASE):
          clean = re.search('[\.\)]+$', link.group(0))
          end = link.end()
          if clean: end = link.start() + clean.start() 
          self.append(tag = 'div', content = line[:link.start()])
          self.append(tag = 'a', href = line[link.start():end],
              content = line[link.start():end])
          self.append(tag = 'div', content = line[end:])

  def get(self):
    elementId = self.request.get('e')
    callback = self.request.get('c')
    self.data = [] 
    if elementId == 'about': self.about()
    elif elementId == 'listings': self.listings()
    elif elementId == 'newsletter': self.newsletter()
    elif elementId == 'updateNewsletter': self.updateNewsletter()
    self.response.headers['Content-Type'] = "application/json" 
    self.response.out.write('%s(%s)' % (callback, json.dumps(self.data)))
    
application = webapp.WSGIApplication(
    [('/', MainPage),
     ('/d', DataProvider)],
     debug=True)

def main():
  run_wsgi_app(application)

if __name__ == "__main__":
  main()
