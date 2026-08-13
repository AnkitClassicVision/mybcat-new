(function () {
  'use strict';

  var STORAGE_KEY = 'mybcat_attribution_v1';
  var BROWSER_EVENTS = new Set(['seo_cta_click', 'lead_submit_success', 'meeting_booked']);
  var SOURCES = new Set(['direct', 'google', 'bing', 'duckduckgo', 'yahoo', 'linkedin', 'facebook', 'instagram', 'newsletter', 'referral', 'organic', 'email', 'partner']);
  var MEDIA = new Set(['none', 'organic', 'referral', 'email', 'social', 'paid-search', 'cpc', 'ppc', 'display', 'partner']);

  function randomId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
    return 'attr-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
  }

  function clean(value, limit) {
    return typeof value === 'string' ? value.slice(0, limit || 500) : '';
  }

  function category(value, allowed, fallback) {
    var normalized = clean(value, 80).trim().toLowerCase();
    return allowed.has(normalized) ? normalized : fallback;
  }

  function pathOnly(value) {
    try {
      return clean(new URL(value, window.location.origin).pathname, 300) || '/';
    } catch (_) {
      return '/';
    }
  }

  function currentTouch() {
    var params = new URLSearchParams(window.location.search);
    var referrer = '';
    try {
      if (document.referrer && new URL(document.referrer).origin !== window.location.origin) {
        referrer = new URL(document.referrer).hostname;
      }
    } catch (_) {
      referrer = '';
    }
    var campaignSource = params.get('utm_source');
    var source = campaignSource || (referrer ? 'referral' : 'direct');
    var medium = params.get('utm_medium') || (referrer ? 'referral' : 'none');
    return {
      source: category(source, SOURCES, 'other'),
      medium: category(medium, MEDIA, 'other'),
      campaign: params.has('utm_campaign') ? 'unapproved-campaign' : '',
      landing_page: pathOnly(window.location.pathname),
    };
  }

  function readRecord() {
    try {
      var parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
      if (parsed && parsed.attribution_id && parsed.first_touch) return parsed;
    } catch (_) {
      // Corrupt or unavailable storage starts a new anonymous attribution record.
    }
    return null;
  }

  function writeRecord(record) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch (_) {
      // The in-memory record remains usable when storage is unavailable.
    }
  }

  var touch = currentTouch();
  var record = readRecord() || {
    attribution_id: randomId(),
    first_touch: touch,
    last_touch: touch,
    content_cluster: '',
    cta_id: '',
  };
  record.last_touch = touch;
  writeRecord(record);

  function snapshot(overrides) {
    var copy = JSON.parse(JSON.stringify(record));
    if (overrides) {
      if (overrides.content_cluster) copy.content_cluster = clean(overrides.content_cluster, 100);
      if (overrides.cta_id) copy.cta_id = clean(overrides.cta_id, 100);
    }
    return copy;
  }

  function emit(eventName, detail) {
    if (!BROWSER_EVENTS.has(eventName)) return false;
    var safeDetail = detail && typeof detail === 'object' ? detail : {};
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: eventName }, safeDetail));
    return true;
  }

  function attachCtas() {
    document.querySelectorAll('[data-seo-cta]').forEach(function (link) {
      link.addEventListener('click', function () {
        var detail = {
          funnel: clean(link.getAttribute('data-funnel'), 30),
          cta_id: clean(link.getAttribute('data-cta-id'), 100),
          content_cluster: clean(link.getAttribute('data-content-cluster'), 100),
          destination: pathOnly(link.getAttribute('href') || '/'),
        };
        record.content_cluster = detail.content_cluster;
        record.cta_id = detail.cta_id;
        writeRecord(record);
        emit('seo_cta_click', detail);
      });
    });
  }

  window.MyBCATAttribution = { snapshot: snapshot, emit: emit };
  window.addEventListener('mybcat:meeting-booked', function (event) {
    emit('meeting_booked', event.detail || {});
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attachCtas);
  else attachCtas();
})();
