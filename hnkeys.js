function page(){
  return window.location.pathname;
}


function moveDown (selectables, cur) {
  cur = (cur + 1 > selectables.size() - 1) ? selectables.size() - 1 : cur + 1;
  select(selectables.eq(cur));
  return cur;
}


function moveUp (selectables, cur) {
  cur = (cur - 1 < 0) ? 0 : cur - 1;
  select(selectables.eq(cur));
  return cur;
}


// highlights the curth item of rows jquery object
// scrollToIt is an optional parameter. Defaults to true.
function select (row, scrollToIt) {
  scrollToIt = (typeof scrollToIt == 'undefined') ? true : scrollToIt;
  
  $('.active').removeClass('active');
  row.next().andSelf().addClass('active');
  
  // scroll to middle of screen, like google does.
  if(scrollToIt && !isScrolledIntoView(row)) {
    $('html, body').animate({scrollTop: row.offset().top - 0.5 * $(window).height() }, 0);
  }
}


// Returns true if on the viewer's screen
function isScrolledIntoView (el) {
  var docViewTop = $(window).scrollTop()
    , docViewBottom = docViewTop + $(window).height()
    
    , elemTop = el.offset().top
    , elemBottom = elemTop + el.height();

  return ((elemBottom >= docViewTop) && (elemTop <= docViewBottom)
    && (elemBottom <= docViewBottom) &&  (elemTop >= docViewTop) );
}


// Opens comment link in selected row in new tab
// If row only contains 'more' link, opens that in same tab
function openComments (titlerow) {
  var link
    , path = window.location.pathname;
  
  // Items pages — when title is selected, opens the article
  if (path === '/item') {
    link = titlerow.find('.title a').first();
    link && chrome.runtime.sendMessage({opentab: link.attr('href')});
    console.log('tried to open '+link.text());
    
  // Front page and other pages — warning: may be broken on other pages
  } else if (path === '/news' || path === '/' || path.indexOf('/x') > 0) {
    // 'comments' link
    link = titlerow.next().find('a[href^=item]').first();
    
    // handle 'more' link
    if (link.size() < 1) {
      link = titlerow.find('a[href^=/x]').first();
      console.log(link.text());
      window.location = 'http://news.ycombinator.com'+ link.attr('href');
    } else {
      console.log('opened');
      chrome.runtime.sendMessage({opentab: 'http://news.ycombinator.com/'+ link.attr('href')});
    }
  }
}


// Clicks reply link or focuses textarea if title is selected.
function reply (row) {
  var link = row.find('a[href^=reply]:visible')
                .last() // won't choose one entered by commenter
    , textarea = row.parent().find('textarea[name=text]')
                             .first();

  if (link.size() === 1) {
    window.location = link.attr('href');
    console.log(link);

  // focus reply box when title link selected on comment page
  } else if (textarea.size() === 1) {
    textarea.bind('keydown', 'esc', function() { textarea.blur(); });
    textarea.parent().bind('keydown', 'return', function(e) { e.stopPropagation(); });
      
    textarea.size() === 1 && textarea.focus();
    console.log(textarea);
  }
}

function upvote (commentrow) {
  var link = commentrow.find('a[href*=dir=up]:visible').first();
  link && link.click();
  console.log(link.attr('href'));
}

function downvote (commentrow) {
  var link = commentrow.find('a[href*=dir=down]:visible').first();
  link && link.click();
  console.log(link.attr('href'));
}

// Handle them keypresses!
$(document).ready(function(){
  // Add support for other styles
  var style = 'gmail'
  , cur = 0 // current item
  , titletables = $('table:eq(2) tr:has(.title)') // any titles present on page
  , commenttables = $('table:gt(3):has(.default)') // any comments on page. returns nothing on home page
  , selectables = titletables.add(commenttables)
  
  , combos =  [ { key: "j"
                , handler: function() { cur = moveDown(selectables, cur); }
                }
              , { key: "k"
                , handler: function() { cur = moveUp(selectables, cur); }
                }
              , { key: "o"
                , handler: function() { openComments(selectables.eq(cur)); }
                }
              , { key: "return"
                , handler: function() { openComments(selectables.eq(cur)); }
                }
              , { key: "r"
                , handler: function() { reply(selectables.eq(cur)); return false; }
                }
              , { key: "w"
                , handler: function() { upvote(selectables.eq(cur)); }
                }
              , { key: "s"
                , handler: function() { downvote(selectables.eq(cur)); }
                }
              ]
  , combo;
   
  // $(expression).bind(types, keys, handler);
  // $(expression).unbind(types, handler);
  // $(document).bind('keydown', 'ctrl+a', fn);
  for (i in combos) {
    combo = combos[i];
    $(document).bind('keydown', combo.key, combo.handler);
  }
  
  // Highlight the first thing on the page, but doesn't scroll to it
  select(selectables.eq(cur), false);
  
  // focuses textarea if reply page
  if(window.location.pathname.indexOf('/reply') > 0){
    $('textarea').focus();
  }

  // So cells don't show when highlighted
  $('table').attr('cellspacing', 0)
            .attr('cellpadding', 0);
});

