(function () {
  var params = new URLSearchParams(window.location.search);
  var term = params.get('q') || 'stuff';
  var Term = term.charAt(0).toUpperCase() + term.slice(1);
  var TERM = term.toUpperCase();

  // Set address bar
  var locationUrl = document.getElementById('location-url');
  if (locationUrl) {
    locationUrl.textContent = 'http://home.solscape.com/search?q=' + encodeURIComponent(term);
  }

  // --- Result templates ---
  var titles = [
    term + '.com — The Official ' + Term + ' Homepage',
    'FREE ' + term + ' downloads — NO VIRUS GUARANTEED!!!',
    Term + ' Encyclopaedia — Everything You Need to Know About ' + Term,
    'Buy ' + Term + ' Online — Best Prices!!!',
    '~~*' + Term + ' WebRing*~~ — 847 sites and counting!',
    Term + ' Fan Club International — Est. 1996',
    'Dr. ' + Term + '\'s ' + Term + ' Page of ' + Term,
    'COOL ' + TERM + ' PICS — Updated Weekly!!!',
    Term + ' Central — Your #1 ' + Term + ' Resource Since 1995',
    'The Encyclopaedia of ' + Term + ' — Volume XII',
    'Welcome to ' + Term + 'World!!! (Under Construction)',
    'Geocities/' + Term + 'Fan99 — My ' + Term + ' Page',
    Term + '.org — The ' + Term + ' Foundation',
    'Ask Jeeves: What is ' + term + '?',
    'FREE ' + Term + ' Screensavers for Windows 95!!!',
    TERM + ' MEGA ARCHIVE — 10,000+ Files',
    Term + ' vs. ' + Term + ': The Ultimate Showdown',
    'Angelfire/' + term + 'lover — Dedicated to All Things ' + Term,
    'Lycos Search: ' + term + ' — Top 5% of the Web!',
    'The ' + Term + ' Report — Issue #47',
  ];

  var domains = [
    'www.' + term + '.com/index.html',
    'www.free' + term + '.com/download.htm',
    'encyclopaedia-' + term + '.org/main',
    'www.buy' + term + '.com/shop/deals.html',
    'www.webring.org/hub?ring=' + term + '&list',
    'members.aol.com/' + term + 'fan96/home.htm',
    'www.dr' + term + '.com/' + term + '/' + term + '.html',
    'www.cool' + term + 'pics.com/gallery',
    'www.' + term + 'central.com/main.htm',
    'www.' + term + '-encyclopaedia.co.uk/vol12.html',
    'www.' + term + 'world.com/~welcome.html',
    'www.geocities.com/SunsetStrip/4829/' + term + '.htm',
    'www.' + term + '.org/about.html',
    'www.askjeeves.com/ask?q=' + term,
    'www.screensavers4free.com/' + term + '.exe',
    'ftp.mega-' + term + '.com/archive/files.html',
    'www.' + term + 'battle.com/showdown.htm',
    'www.angelfire.com/' + term + 'lover/page1.html',
    'www.lycos.com/search/' + term + '.html',
    'www.' + term + 'report.com/issue47.html',
  ];

  var descriptions = [
    'The most comprehensive ' + term + ' resource on the World Wide Web. Features ' + term + ' facts, ' + term + ' pictures, and ' + term + ' information. Last updated: March 14, 1997.',
    'Download ' + term + ' absolutely FREE! No credit card required. 100% safe. Tested on Windows 3.1, Windows 95, and Macintosh. Click here NOW before this offer expires!!!',
    'A scholarly exploration of ' + term + ' throughout the ages. From ancient ' + term + ' to modern ' + term + ', this encyclopaedia covers all aspects of ' + term + ' in meticulous detail.',
    'Lowest prices on ' + term + ' GUARANTEED or your money back! We ship ' + term + ' worldwide. Order ' + term + ' today and receive a FREE ' + term + ' mousepad!',
    'Join 847 fellow ' + term + ' enthusiasts in the world\'s largest ' + term + ' web ring. Navigate through sites dedicated to ' + term + ', by ' + term + ' fans, for ' + term + ' fans.',
    'Welcome to the international fan club for ' + term + '. Monthly newsletter, exclusive ' + term + ' merchandise, and annual ' + term + 'Con tickets available for members.',
    'Dr. ' + Term + ' presents the definitive collection of ' + term + ' on the internet. Warning: this page contains a LOT of ' + term + '. Viewer discretion advised.',
    'Updated every Tuesday with fresh ' + term + ' pictures! Over 500 ' + term + ' images in our gallery. Best viewed in Netscape Navigator 3.0 at 800x600 resolution.',
    'Your number one source for ' + term + ' since 1995. News, reviews, forums, and chat rooms — all about ' + term + '. Sign our guestbook!',
    'The twelfth volume of our ongoing ' + term + ' encyclopaedia covers advanced ' + term + ' theory and applied ' + term + ' sciences. Now available in HTML format.',
    'Welcome to ' + Term + 'World!!! This page is under construction but will soon contain the best ' + term + ' content on the web. Please bookmark and check back!!!',
    'Hi my name is Brad and this is my ' + term + ' page. I really like ' + term + ' and I hope you do too. Please sign my guestbook and visit my other pages about ' + term + '.',
    'The ' + Term + ' Foundation is a non-profit organisation dedicated to the preservation and promotion of ' + term + ' for future generations.',
    'You asked Jeeves: "What is ' + term + '?" — Jeeves found 1,247 results across the World Wide Web. The most popular ' + term + ' pages are listed below.',
    'Transform your desktop with our amazing ' + term + ' screensavers! Featuring animated ' + term + ', 3D ' + term + ', and the classic flying ' + term + '. Compatible with Windows 95.',
    'The largest ' + term + ' archive on the internet. Over 10,000 files related to ' + term + '. FTP mirror sites available in 12 countries.',
    'The age-old question: which ' + term + ' would win in a fight? Vote in our poll and see the results! Over 50,000 votes cast so far.',
    'Hey! This is my Angelfire page about ' + term + '. I\'ve been collecting ' + term + ' stuff since 1994. Don\'t forget to check out my ' + term + ' MIDI collection!',
    'Lycos rated this among the Top 5% of all ' + term + ' pages on the World Wide Web. Featured in ' + Term + ' Monthly magazine, December 1996 issue.',
    'Issue #47 of The ' + Term + ' Report covers the latest developments in the world of ' + term + '. Subscribe now for just $2.99/month delivered to your email.',
  ];

  var badges = ['NEW!', 'HOT!', 'COOL!', 'UPDATED!', 'TOP 5%!', 'AWARD!'];

  var marqueeTexts = [
    '🔥 ' + TERM + ' ' + TERM + ' ' + TERM + ' ' + TERM + ' ' + TERM + ' ' + TERM + ' ' + TERM + ' ' + TERM + ' 🔥',
    '★ ★ ★  Best ' + Term + ' on the Web  ★ ★ ★  Click Here for FREE ' + Term + '  ★ ★ ★  Best ' + Term + ' on the Web  ★ ★ ★',
    '>>> CONGRATULATIONS! You are the 1,000,000th visitor searching for ' + term + '! Click HERE to claim your prize! <<<',
    '♦ ♦ ♦  ' + TERM + ' SUPER SALE — 50% OFF ALL ' + TERM + ' — LIMITED TIME ONLY  ♦ ♦ ♦',
  ];

  var marqueeColors = [
    { bg: '#FFFF00', color: '#FF0000' },
    { bg: '#00FFFF', color: '#000080' },
    { bg: '#FF00FF', color: '#FFFFFF' },
    { bg: '#00FF00', color: '#000000' },
  ];

  // --- Build header ---
  var header = document.getElementById('results-header');
  header.innerHTML =
    '<h2 class="results-title">Solscape Search Results</h2>' +
    '<p class="results-summary">Your search for <b>"' + term + '"</b> returned approximately <b>1,000,000</b> results</p>' +
    '<hr class="results-hr">';

  // --- Build results ---
  var list = document.getElementById('results-list');
  var marqueeIndex = 0;

  for (var i = 0; i < 20; i++) {
    // Insert a marquee every 5 results
    if (i > 0 && i % 5 === 0 && marqueeIndex < marqueeTexts.length) {
      var mq = document.createElement('marquee');
      mq.className = 'results-marquee';
      mq.textContent = marqueeTexts[marqueeIndex];
      mq.style.background = marqueeColors[marqueeIndex].bg;
      mq.style.color = marqueeColors[marqueeIndex].color;
      if (marqueeIndex % 2 === 1) mq.setAttribute('direction', 'right');
      mq.setAttribute('scrollamount', String(2 + marqueeIndex * 2));
      list.appendChild(mq);
      marqueeIndex++;
    }

    var entry = document.createElement('div');
    entry.className = 'result-entry';

    // Badge (30% chance)
    var badgeHtml = '';
    if (Math.random() < 0.3) {
      badgeHtml = ' <span class="result-badge">[' + badges[Math.floor(Math.random() * badges.length)] + ']</span>';
    }

    // Hit counter (20% chance)
    var counterHtml = '';
    if (Math.random() < 0.2) {
      var count = String(Math.floor(Math.random() * 99999));
      while (count.length < 6) count = '0' + count;
      counterHtml = '<div class="result-counter">Visitors: <span class="counter-digits">' + count + '</span></div>';
    }

    // Under construction (10% chance)
    var constructionHtml = '';
    if (Math.random() < 0.1) {
      constructionHtml = '<div class="result-construction">🚧 Under Construction 🚧</div>';
    }

    entry.innerHTML =
      '<a href="#" class="result-title">' + titles[i] + '</a>' + badgeHtml +
      '<div class="result-url">http://' + domains[i] + '</div>' +
      '<div class="result-desc">' + descriptions[i] + '</div>' +
      counterHtml +
      constructionHtml;

    list.appendChild(entry);
  }

  // --- Build footer ---
  var footer = document.getElementById('results-footer');
  footer.innerHTML =
    '<hr class="results-hr">' +
    '<div class="results-nav">' +
      '<span class="results-page active">1</span>' +
      '<a href="#" class="results-page">2</a>' +
      '<a href="#" class="results-page">3</a>' +
      '<a href="#" class="results-page">4</a>' +
      '<a href="#" class="results-page">5</a>' +
      '<a href="#" class="results-page">6</a>' +
      '<a href="#" class="results-page">7</a>' +
      '<a href="#" class="results-page">8</a>' +
      '<a href="#" class="results-page">9</a>' +
      '<a href="#" class="results-page">10</a>' +
      '<a href="#" class="results-page">Next &gt;</a>' +
    '</div>' +
    '<div class="results-footer-text">' +
      '<p>Visitor <span class="portal-counter">#' + String(Math.floor(Math.random() * 999999)).padStart(6, '0') + '</span></p>' +
      '<p>Copyright &copy; 1996 Solscape Communications Corporation. All rights reserved.</p>' +
      '<p class="results-best-viewed">Best viewed in Solscape Navigator 3.0 at 800x600 resolution</p>' +
    '</div>';
})();
