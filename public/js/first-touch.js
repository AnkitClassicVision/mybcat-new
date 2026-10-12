/**
 * First-touch attribution for mybcat.com and go.mybcat.com.
 * sessionStorage keeps first-load values for the tab. Last-touch refreshes.
 * Attach the returned object on form POST context (owned endpoint only).
 * PostHog identify() is a no-op unless a later owner enables PostHog.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.MybcatAttribution = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  var FIRST_KEY = "mbcat_first_touch";
  var LAST_KEY = "mbcat_last_touch";
  var PARAMS = [
    ["utm_source", "utmSource"],
    ["utm_medium", "utmMedium"],
    ["utm_campaign", "utmCampaign"],
    ["utm_content", "utmContent"],
    ["utm_term", "utmTerm"],
    ["gclid", "gclid"],
    ["fbclid", "fbclid"],
    ["li_fat_id", "liFatId"],
  ];

  function nowIso() {
    return new Date().toISOString();
  }

  function readStore(key) {
    try {
      var raw = sessionStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  }

  function writeStore(key, value) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      /* private mode */
    }
  }

  function capture(url, referrer) {
    var parsed;
    try {
      parsed = new URL(url, "https://mybcat.com");
    } catch (err) {
      parsed = { searchParams: { get: function () { return null; } }, href: String(url || "") };
    }
    var row = {};
    PARAMS.forEach(function (pair) {
      var value = parsed.searchParams && parsed.searchParams.get
        ? parsed.searchParams.get(pair[0])
        : null;
      if (value) row[pair[1]] = value;
    });
    if (referrer) row.referrer = String(referrer);
    if (parsed.href) row.landingPage = parsed.href;
    return row;
  }

  function remember(url, referrer) {
    var incoming = capture(url, referrer);
    incoming.lastTouchAt = nowIso();
    var first = readStore(FIRST_KEY);
    if (!first || !first.firstTouchAt) {
      first = Object.assign({}, incoming, { firstTouchAt: incoming.lastTouchAt });
      writeStore(FIRST_KEY, first);
    }
    writeStore(LAST_KEY, incoming);
    return { firstTouch: first, lastTouch: incoming };
  }

  function formContext(source, pageUri, extra) {
    var remembered = remember(
      pageUri || (typeof location !== "undefined" ? location.href : ""),
      typeof document !== "undefined" ? document.referrer : ""
    );
    var last = remembered.lastTouch || {};
    var context = {
      source: source || "website-form",
      pageUri: pageUri || last.landingPage || "",
      utmSource: last.utmSource,
      utmMedium: last.utmMedium,
      utmCampaign: last.utmCampaign,
      utmContent: last.utmContent,
      utmTerm: last.utmTerm,
      gclid: last.gclid,
      fbclid: last.fbclid,
      liFatId: last.liFatId,
      referrer: last.referrer,
      landingPage: remembered.firstTouch.landingPage || last.landingPage,
      firstTouch: remembered.firstTouch,
      firstTouchAt: remembered.firstTouch.firstTouchAt,
      lastTouchAt: last.lastTouchAt,
    };
    if (extra) {
      Object.keys(extra).forEach(function (key) {
        if (extra[key]) context[key] = extra[key];
      });
    }
    return context;
  }

  function identify(email) {
    if (!email) return;
    if (typeof window !== "undefined" && window.posthog && window.posthog.identify) {
      window.posthog.identify(email);
    }
  }

  return { capture: capture, remember: remember, formContext: formContext, identify: identify };
});
