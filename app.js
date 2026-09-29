// Shared helpers for the Canberra Data Walk sample app.

// Fetch JSON from any URL and throw on non-2xx responses.
// Also logs any SQL the backend executed (via X-Debug-SQL / X-Debug-Params headers).
async function fetchJson(url, options) {
  const response = await fetch(url, options);

  const rawSql = response.headers.get('X-Debug-SQL');
  if (rawSql) {
    const rawParams = response.headers.get('X-Debug-Params');
    let params = {};
    try { params = JSON.parse(decodeURIComponent(rawParams || '{}')); } catch (e) {}
    console.groupCollapsed('%cSQL %c' + (options && options.method ? options.method : 'GET') + ' ' + url,
      'color:#2a6f4e;font-weight:bold', 'color:#666;font-weight:normal');
    console.log(decodeURIComponent(rawSql).trim());
    if (Object.keys(params).length) console.log('params:', params);
    console.groupEnd();
  }

  if (!response.ok) {
    let detail = '';
    try {
      const body = await response.clone().json();
      if (body && body.detail) detail = ' - ' + body.detail;
      else if (body && body.error) detail = ' - ' + body.error;
    } catch (e) { /* body wasn't JSON */ }
    throw new Error('Request failed (' + response.status + ')' + detail);
  }
  return response.json();
}

// --- Visitor name cookie ---------------------------------------------------
// A cookie remembers the visitor's name for a year, so they only enter it once.

function getVisitorName() {
  const match = document.cookie.match(/(?:^|; )visitorName=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : '';
}

function setVisitorName(name) {
  const oneYear = 365 * 24 * 60 * 60;
  document.cookie =
    'visitorName=' + encodeURIComponent(name) +
    '; max-age=' + oneYear +
    '; path=/; SameSite=Lax';
}
