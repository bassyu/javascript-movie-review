import { getPopularMovies, getSearchMovies } from './api';
import { changeTitle, clearList, renderList, resetSearchBox, show, hide } from './dom';

import movieService from './domain/movieService';

import { $ } from './utils/domUtils';

const App = {
  MAX_MOVIES_PER_PAGE: 20,
  currentPage: 1,
  query: '',

  init() {
    this.bindEvents();
    this.renderPopularMovies();
  },

  bindEvents() {
    $('movie-header').addEventListener('home', () => {
      this.refresh();
      movieService.resetMovies();
      changeTitle('지금 인기 있는 영화');
      this.renderPopularMovies();
    });

    $('movie-header').addEventListener('search', ({ detail: query }) => {
      this.query = query;
      this.refresh();
      changeTitle(`"${this.query}" 검색 결과`);
      this.renderSearchMovies();
    });

    $('movie-list-section').addEventListener('loadMore', () => {
      if ($('#movie-list-title').textContent === '지금 인기 있는 영화') {
        this.renderPopularMovies();
      } else {
        this.renderSearchMovies();
      }
    });
  },

  async renderPopularMovies() {
    const newMovies = await this.loadMovies(getPopularMovies, [this.currentPage]);
    this.updatePage(newMovies);
  },

  async renderSearchMovies() {
    const newMovies = await this.loadMovies(getSearchMovies, [this.query, this.currentPage]);
    this.updatePage(newMovies);
  },

  updatePage(newMovies) {
    if (newMovies.length < this.MAX_MOVIES_PER_PAGE) hide('#load-more');
    this.currentPage += 1;
    renderList(newMovies);
  },

  async loadMovies(api, params) {
    show('#skeleton-list');

    try {
      const { results } = await api(...params);
      movieService.concatMovies(movieService.resultsToMovies(results));
      hide('#skeleton-list');

      return movieService.movies.slice(-results.length);
    } catch (error) {
      hide('#skeleton-list');
      alert(error.message);
    }
  },

  refresh() {
    this.currentPage = 1;
    clearList();
    resetSearchBox();
    show('#load-more');
  },
};

export default App;
