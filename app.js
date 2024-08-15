// declaration of key container elements
const searchBox = document.querySelector('#searchBox');
const movieGrid = document.querySelector('#movie-grid');
const footer = document.querySelector('footer');

const imgBaseUrl = 'https://image.tmdb.org/t/p/w500';

const options = {
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
    const res = await axios.get(`https://api.themoviedb.org/3/search/movie?query=${movie}&include_adult=false&language=en-US`, options);
    return res.data;
  }
  catch (e) {
    movieGrid.innerText = `Error: ${e}`;
  }
}

// call popular movies from API
async function callPopular() {
  try {
    const res = await axios.get('https://api.themoviedb.org/3/movie/popular?language=en-US', options);
    return res.data;
  }
  catch (e) {
    movieGrid.innerText = `Error: ${e}`;
  }
}

// creates individual movie elements
function createElement(result) {
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
  for (const result of results) {
    if (!result.poster_path) {
      continue;
    }
    createElement(result);
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

// calls when page first starts running
generateHTML(callPopular);

searchBox.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    options.params.page = 1;
    movieGrid.innerHTML = '';
    footer.innerHTML = '';
    generateHTML(callSearched);
  }
});

searchBox.addEventListener('click', () => {
  searchBox.value = '';
})