(function () {
  var params = new URLSearchParams(window.location.search);
  var term = params.get('q');

  if (!term) {
    document.getElementById('result-container').textContent = 'No search term.';
    return;
  }

  var container = document.getElementById('result-container');

  // Measure how wide one word + space is
  var measurer = document.createElement('span');
  measurer.className = 'result-word-measure';
  measurer.textContent = term + ' ';
  measurer.style.visibility = 'hidden';
  measurer.style.position = 'absolute';
  container.appendChild(measurer);
  var wordWidth = measurer.offsetWidth;
  container.removeChild(measurer);

  // Build a line that overfills the viewport width
  var pageWidth = window.innerWidth;
  var wordsPerLine = Math.ceil(pageWidth / Math.max(wordWidth, 1)) + 4;
  var lineText = '';
  for (var w = 0; w < wordsPerLine; w++) {
    lineText += term + ' ';
  }

  // Fill the viewport height with lines
  var lineCount = Math.ceil((window.innerHeight * 2) / 28);
  var opacities = [1, 0.8, 0.65, 0.5, 0.9, 0.6, 0.75, 0.85, 0.45, 0.95];

  for (var i = 0; i < lineCount; i++) {
    var line = document.createElement('div');
    line.className = 'result-line';
    line.textContent = lineText;
    line.style.opacity = opacities[i % opacities.length];
    container.appendChild(line);
  }
})();
