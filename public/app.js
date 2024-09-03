// declaration of key container elements
const searchBox = document.querySelector('#searchBox');
const movieGrid = document.querySelector('#movie-grid');
const footer = document.querySelector('footer');
const container = document.querySelector('.container');
const movie = document.querySelector('.movie-searched');
const logoImg = document.querySelector('.logo-img');

const imgBaseUrl = 'https://image.tmdb.org/t/p/w500';
const baseURL = 'https://api.themoviedb.org/3'

export const options = {
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMDViZDQ5NmE3ZmU4YTlkMDM1YTM0NTZiNTExMzM1MiIsInN1YiI6IjY2NjE1M2Y1MjQ4YjZhY2JiMjAwYzM0YiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.cr2ZaV0XhojWlpFQNU5Q6jATFBhHLNxyjBO9k4pezCo'
  },
  params: {
    page: 1,
  }
};

// call searched movies from API
async function callSearched(movie) {
  try {
    const res = await axios.get(baseURL + `/search/movie?query=${movie}&include_adult=false&language=en-US`, options);
    return res.data;
  }
  catch (e) {
    movieGrid.innerText = `Error: ${e}`;
  }
}

// call popular movies from API
async function callPopular() {
  try {
    const res = await axios.get(baseURL + '/movie/popular?language=en-US', options);
    return res.data;
  }
  catch (e) {
    movieGrid.innerText = `Error: ${e}`;
  }
}

// creates individual movie elements
function createElement(result, btnId, api) {
  const movieDiv = document.createElement('div');
  const movieImg = document.createElement('img');

  //movieInfoDiv
  const movieInfoDiv = document.createElement('div');
  const movieTitle = document.createElement('h3');
  const movieRating = document.createElement('span');

  // overviewDiv
  const overviewDiv = document.createElement('div');
  const overviewTitle = document.createElement('h1');
  const overviewText = document.createElement('span');
  const overviewBtn = document.createElement('button');
  overviewBtn.setAttribute('data-id', btnId);

  const rating = result.vote_average.toFixed(1);

  movieImg.src = imgBaseUrl + result.poster_path;

  movieTitle.innerText = result.original_title;
  movieRating.innerText = rating;
  changeRatingColour(movieRating, rating);
  overviewText.innerText = result.overview;
  if (!result.overview) {
    overviewText.innerText = 'No overview';
  }
  overviewTitle.innerText = 'Overview';
  overviewBtn.innerText = 'More info';

  movieDiv.classList.add('movie');
  movieInfoDiv.classList.add('movie-info');
  movieRating.classList.add('rating');
  movieTitle.classList.add('title');
  overviewDiv.classList.add('overview');
  overviewBtn.classList.add('info-btn');

  overviewDiv.append(overviewTitle, overviewText, overviewBtn);
  movieInfoDiv.append(movieTitle, movieRating, overviewDiv);
  movieDiv.append(movieImg, movieInfoDiv);
  movieGrid.append(movieDiv);

  overviewBtn.addEventListener('click', async () => {
    window.scrollTo(0, 0);
    generateClickedMovie(result, api);
  })
}

async function generateClickedMovie(res, api) {
  const response = await axios.get(baseURL + `/movie/${res.id}/videos`, options);
  console.log('response: ', response);
  let videoHtml = '';
  if (response) {
    for (let video of response.data.results) {
      if (video.type === 'Trailer') {
        console.log('video', video);
        videoHtml = `<iframe class="trailer" width="560" height="315" src="https://www.youtube.com/embed/${video.key}" title="${video.name}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`
        break;
      } 
    }
  }
  // reset previous html
  movieGrid.innerHTML = '';
  footer.innerHTML = '';

  movie.innerHTML = `
    <div class="generated-container"> 
      <div class="top-section"> 
        <div class="one">
          <h1>${res.original_title}</h1>
          <span>${res.original_language}</span>
          <span> . </span>
          <span>${res.release_date}</span>
        </div>
        <div class="stats">
          <span> JMDB rating </span>
          <div class="rating-stat">
            <span class="material-symbols-outlined" class="star-icon">
              star
            </span>     
            <span class="vote"> ${res.vote_average.toFixed(1)}</span>
            <span> /10 </span>
          </div>
        </div>
      </div>
      <div class="media">
        <img src="${imgBaseUrl + res.poster_path}" class="movie-img">
        ${videoHtml}
      </div>
      <div class="bottom-section">
        <p class="description">${res.overview}</p>
        <button class="back-btn">Back</button>
      </div>
    </div>
  `;
  const backBtn = document.querySelector('.back-btn');
  backBtn.addEventListener('click', () => {
    movie.innerHTML = '';
    generateHTML(api);
  });
}

function changeRatingColour(element, rating) {
  if (rating < 5) {
    element.classList.add('red-style');
  } else if (rating >= 5 && rating <= 6.9) {
    element.classList.add('orange-style');
  } else {
    element.classList.add('green-style');
  }
}

// loops over movie data returned from API & generates individual movie elements
async function generateHTML(api) {
  const movie = searchBox.value;
  const res = await api(movie);
  const results = res.results;
  console.log(res)
  for (let i = 0; i < results.length; i++) {
    if (!results[i].poster_path) {
      continue;
    }
    createElement(results[i], i, api);
  }

  if (results.length < 1) {
    movieGrid.innerText = `No results found`;
  }
  pagination(api, res);
}

// creates pagination and handles logic of changing pages
function pagination(api, res) {
  let pageNum = options.params.page;
  const paginationDiv = document.createElement('div');
  const prevPage = document.createElement('div');
  const pageNumber = document.createElement('div');
  const nextPage = document.createElement('div');

  paginationDiv.classList.add('pagination');
  pageNumber.classList.add('page-number');
  nextPage.classList.add('next-page');
  prevPage.classList.add('prev-page');

  pageNumber.innerText = pageNum;
  prevPage.innerText = 'Previous Page';
  nextPage.innerText = 'Next Page';

  paginationDiv.append(prevPage, pageNumber, nextPage);
  footer.append(paginationDiv);

  if (res.page === 1) {
    prevPage.style.cursor = 'not-allowed';
    prevPage.style.color = 'gray';
  }

  //previous page
  if (res.page > 1) {
    prevPage.style.cursor = 'pointer';
    prevPage.addEventListener('click', async () => {
      movieGrid.innerHTML = '';
      footer.innerHTML = '';
      options.params.page--;
      await generateHTML(api);
    });
  }

  // if on last page
  if (pageNum === res.total_pages) {
    nextPage.style.cursor = 'not-allowed';
    nextPage.style.color = 'gray';
  } else {
    // next page
    nextPage.style.cursor = 'pointer';
    nextPage.addEventListener('click', async () => {
      movieGrid.innerHTML = '';
      footer.innerHTML = '';
      options.params.page++;
      await generateHTML(api);
    });
  }
}

// calls when page initially starts 
generateHTML(callPopular);

searchBox.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    options.params.page = 1;
    movieGrid.innerHTML = '';
    footer.innerHTML = '';
    movie.innerHTML = '';
    generateHTML(callSearched);
  }
});

searchBox.addEventListener('click', () => {
  searchBox.value = '';
});

logoImg.addEventListener('click', () => {
  movie.innerHTML = '';
  movieGrid.innerHTML = '';
  footer.innerHTML = '';

  generateHTML(callPopular);
});