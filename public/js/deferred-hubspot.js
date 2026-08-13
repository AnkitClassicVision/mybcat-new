(function () {
  'use strict';
  var loaded = false;

  function load() {
    if (loaded || document.getElementById('hs-script-loader')) return;
    loaded = true;
    window.hsConversationsSettings = { loadImmediately: false };
    var script = document.createElement('script');
    script.id = 'hs-script-loader';
    script.async = true;
    script.defer = true;
    script.src = 'https://js.hs-scripts.com/23344341.js';
    document.head.appendChild(script);
  }

  window.addEventListener('mybcat:marketing-consent', load, { once: true });
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (eventName) {
    document.addEventListener(eventName, load, { once: true, passive: true });
  });
})();
