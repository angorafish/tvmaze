"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  const response = await fetch(`http://api.tvmaze.com/search/shows?q=${term}`);
  const data = await response.json();
  
  return data.map(item => {
return {
  id: item.show.id,
  name: item.show.name,
  summary: item.show.summary,
  image: item.show.image ? item.show.image.medium : "https://tinyurl.com/tv-missing"
    };
  });
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(`
      <div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
      <div class="media">
        <img src="${show.image}" alt="${show.name}" class="w-25 me-3">
        <div class="media-body">
          <h5 class="text-primary">${show.name}</h5>
          <div><small>${show.summary}</small></div>
          <button class="btn btn-outline-light btn-sm Show-getEpisodes" data-show-id="${show.id}">
            Episodes
          </button>
        </div>
      </div>
    </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(showId) {
const response = await fetch(`http://api.tvmaze.com/shows/${showId}/episodes`);
const episodes = await response.json();

return episodes.map(episode => ({
  id: episode.id,
  name: episode.name,
  season: episode.season,
  number: episode.number
}));
}

/** Write a clear docstring for this function... */

function populateEpisodes(episodes) {
  const $episodesList = $("#episodesList");
  $episodesList.empty();

  for (let episode of episodes) {
    const $episode = $(`<li>${episode.name} (season ${episode.season}, number ${episode.number})</li>`);
    $episodesList.append($episode);
  }
  $episodesArea.show();
 }

 $showsList.on("click", ".Show-getEpisodes", async function(evt) {
  const showId = $(evt.target).data("show-id");
  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
 });