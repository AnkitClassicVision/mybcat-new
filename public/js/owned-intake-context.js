/**
 * Remember first-touch on every page, then attach it to owned /forms/intake POSTs.
 * Keeps the live contact source (contact). Does not enable PostHog.
 */
(function () {
  if (window.MybcatAttribution && typeof window.MybcatAttribution.remember === "function") {
    window.MybcatAttribution.remember(
      typeof location !== "undefined" ? location.href : "",
      typeof document !== "undefined" ? document.referrer : ""
    );
  }

  function enrich(payload) {
    if (!payload || typeof payload !== "object") return payload;
    var current = payload.context && typeof payload.context === "object" ? payload.context : {};
    var source = current.source || "contact";
    var attribution = window.MybcatAttribution;
    if (!attribution || typeof attribution.formContext !== "function") return payload;
    var extra = attribution.formContext(source, current.pageUri || window.location.href, {
      pageName: current.pageName || document.title,
    });
    payload.context = Object.assign({}, current, extra, {
      source: source,
      pageName: current.pageName || document.title,
    });
    return payload;
  }

  var orig = window.fetch;
  window.fetch = function (input, init) {
    var url = typeof input === "string" ? input : (input && input.url) || "";
    if (String(url).indexOf("/forms/intake") !== -1 && init && typeof init.body === "string") {
      try {
        init = Object.assign({}, init, { body: JSON.stringify(enrich(JSON.parse(init.body))) });
      } catch (err) {
        /* leave the original body */
      }
    }
    return orig.call(this, input, init);
  };
})();
