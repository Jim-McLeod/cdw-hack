// Fetches the Canberra Data Walk JSON once and reuses it.
// Beginners: change DATA_URL to point at your own Azure Blob Storage URL when you're ready.
//var DATA_URL = 'data/canberra-data-walk.json';
var DATA_URL = 'https://canberradataweek.com/assets/canberra-data-walk.json';


var walkPromise = null;

function loadWalk() {
  if (!walkPromise) {
    walkPromise = fetch(DATA_URL).then(function (response) {
      if (!response.ok) {
        throw new Error('Could not load data (' + response.status + ')');
      }
      return response.json();
    });
  }
  return walkPromise;
}
