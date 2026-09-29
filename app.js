// Shared helpers for the Canberra Data Walk sample app.

// Fetch JSON from any URL and throw on non-2xx responses.
async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error('Request failed (' + response.status + ')');
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
