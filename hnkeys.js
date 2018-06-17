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

function getLink (titlerow, path) {
 // Items pages — when title is selected, opens the article
  if (path === '/item') {
    link = titlerow.find('.title a').first();
    return link;
  }

  // Comments link
  link = titlerow.next().find('a[href^=item]').first();
  if (link.length) return link;

  // Some items don't have a comments link - fall back to the title link
  link = titlerow.find('.title a').first()
  return link;
}


// Opens comment link in selected row in new tab
// If row only contains 'more' link, opens that in same tab
function openComments (titlerow) {
  var link
    , path = window.location.pathname
    , fullPath = path + window.location.search;

  // More link - open in same tab
  link = titlerow.find('a[href^=/x?], a[href^=news]').first();
  if (link.length) {
    location.href = link.attr('href');
    return;
  }

  link = getLink(titlerow, path);

  // Don't open a link to the current page
  if (link.length && "/" + link.attr('href') != fullPath) {
    window.open(link.attr('href'), "_blank");
    console.log('tried to open: ' + link.text());
  }
}

function toggleExpanded (row) {
  var link = row.find('a.togg')[0];
  link && link.click();
  return getSelectables();
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

// jQuery's is(":visible") returns true when visibility == "hidden", wtf
function isVisible(el) {
  return getComputedStyle(el).visibility === "visible";
}

function queryVisible(el, selector) {
  var res = el.find(selector)[0];
  return res && isVisible(res) ? res : null;
}

function vote(commentrow, direction) {
  var id = commentrow.parents('tr')[0].id;
  var link = queryVisible(commentrow, '#' + direction + '_' + id);
  if (!link) {
    link = queryVisible(commentrow, '#un_' + id);
  }
  link && link.click();
}

function upvote(commentrow) {
  vote(commentrow, "up")
}

function downvote(commentrow) {
  vote(commentrow, "down")
}

function getSelectables() {
  titletables = $('table:eq(2) tr:has(.title)') // any titles present on page
  commenttables = $('table:gt(3):has(.default):visible') // any comments on page. returns nothing on home page
  return titletables.add(commenttables)
}

// Handle them keypresses!
$(document).ready(function(){
  let cur = 0; // current item
  let selectables = getSelectables();
  const combos = [
    { key: "j"
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
  , { key: "x"
    , handler: function() { selectables = toggleExpanded(selectables.eq(cur)); }
    }
  ];

  for (let combo of combos) {
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

