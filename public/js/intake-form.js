(function () {
  'use strict';

  function fieldList(form) {
    var fields = [];
    new FormData(form).forEach(function (rawValue, name) {
      if (name === 'consent_scope' || name === 'consent_timestamp') return;
      var value = String(rawValue).trim();
      if (!value) return;
      fields.push({ objectTypeId: name === 'website' ? '0-2' : '0-1', name: name, value: value });
    });
    return fields;
  }

  function consentScopes(form) {
    if (form.dataset.funnel === 'service') return ['business_inquiry_processing'];
    var scopes = ['confidential_acquisition_inquiry'];
    var serviceConsent = form.elements.namedItem('service_interest_consent');
    if (serviceConsent && serviceConsent.checked) scopes.push('service_marketing');
    return scopes;
  }

  function setBusy(form, busy) {
    var button = form.querySelector('[type="submit"]');
    form.setAttribute('aria-busy', busy ? 'true' : 'false');
    if (button) {
      button.disabled = busy;
      button.textContent = busy ? 'Sending…' : (button.dataset.defaultLabel || 'Submit');
    }
  }

  function showError(form, message) {
    var error = form.querySelector('[data-submit-error]');
    if (!error) return;
    error.textContent = message;
    error.hidden = false;
    error.focus();
  }

  function showSuccess(form) {
    var target = document.getElementById(form.dataset.successTarget || '');
    var wrapper = form.closest('[data-form-content]') || form.parentElement;
    if (wrapper) wrapper.hidden = true;
    if (target) {
      target.hidden = false;
      target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    }
    var meetingUrl = form.dataset.meetingUrl;
    if (meetingUrl) {
      var iframe = target && target.querySelector('[data-meeting-iframe]');
      var fallback = target && target.querySelector('[data-meeting-fallback]');
      if (iframe) iframe.src = meetingUrl;
      if (fallback) fallback.href = meetingUrl;
    }
  }

  async function submit(form) {
    var tracker = window.MyBCATAttribution;
    if (!tracker || typeof tracker.snapshot !== 'function') {
      showError(form, 'Attribution is still loading. Please try again.');
      return;
    }

    var error = form.querySelector('[data-submit-error]');
    if (error) error.hidden = true;
    setBusy(form, true);
    var attribution = tracker.snapshot({
      content_cluster: form.dataset.contentCluster || '',
      cta_id: form.dataset.ctaId || '',
    });
    var payload = {
      schema_version: 'seo-intake.v1',
      form_id: form.dataset.formId,
      funnel: form.dataset.funnel,
      fields: fieldList(form),
      context: { pagePath: window.location.pathname },
      attribution: attribution,
      consent: { scopes: consentScopes(form), timestamp: new Date().toISOString() },
    };

    try {
      var response = await fetch('/api/forms/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      var result = await response.json().catch(function () { return {}; });
      if (!response.ok || result.ok !== true) throw new Error('intake_failed');

      form.dataset.submitted = 'true';
      tracker.emit('lead_submit_success', {
        funnel: form.dataset.funnel,
        cta_id: form.dataset.ctaId || '',
        content_cluster: form.dataset.contentCluster || '',
        attribution_id: attribution.attribution_id,
      });
      showSuccess(form);
      document.dispatchEvent(new CustomEvent('mybcat:intake-success', {
        detail: { form_id: form.dataset.formId, funnel: form.dataset.funnel },
      }));
    } catch (_) {
      showError(form, 'We could not safely save your inquiry. Please check your connection and try again.');
      setBusy(form, false);
    }
  }

  function attach(form) {
    var button = form.querySelector('[type="submit"]');
    if (button) button.dataset.defaultLabel = button.textContent.trim();
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (form.dataset.submitted === 'true' || form.getAttribute('aria-busy') === 'true') return;
      if (!form.reportValidity()) return;
      submit(form);
    });
  }

  function init() {
    document.querySelectorAll('[data-seo-intake-form]').forEach(attach);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
