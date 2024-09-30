
import axios from "axios";
import iziToast from "izitoast";
import "izitoast/dist/css/iziToast.min.css";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";



const API_KEY = '46197993-0238acfcd6230053ff5f60fb7';
const BASE_URL = 'https://pixabay.com/api/';

const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('.search-input');
const gallery = document.querySelector('#gallery');
const loadMoreBtn = document.querySelector('#load-more');
const loadingMessage = document.querySelector('#loading-message');

let currentQuery = '';
let page = 1;
let totalHits = 0;  
let lightbox;
let isLoading = false;


async function fetchImages(query, page = 1) {
  if (isLoading) return; 
  isLoading = true;
  loadingMessage.style.display = 'block'; 
  
  try {
    const response = await axios.get(`${BASE_URL}`, {
      params: {
        key: API_KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: 40,  
        page: page,
      },
    });
    totalHits = response.data.totalHits;  
    loadingMessage.style.display = 'none'; 
    isLoading = false;
    return response.data;
  } catch (error) {
    loadingMessage.style.display = 'none';
    isLoading = false;
    console.error('Hata oluştu:', error);
  }
}


function renderImages(images) {
  const markup = images
    .map(
      (image) => `
        <li class="gallery-item">
          <a href="${image.largeImageURL}">
            <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
          </a>
          <div class="info">
            <p><b>Likes:</b> ${image.likes}</p>
            <p><b>Views:</b> ${image.views}</p>
            <p><b>Comments:</b> ${image.comments}</p>
            <p><b>Downloads:</b> ${image.downloads}</p>
          </div>
        </li>
      `
    )
    .join('');
  gallery.insertAdjacentHTML('beforeend', markup);

   const lightbox = new SimpleLightbox('.gallery a', {
    captionsData: 'alt', 
    captionDelay: 250, 
  });


  if (!lightbox) {
    lightbox = new SimpleLightbox('.gallery a');
    
  } else {
    lightbox.refresh();
  }
}


searchForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  gallery.innerHTML = ''; 
  currentQuery = searchInput.value.trim();
  if (!currentQuery) return;

  page = 1; 
  const data = await fetchImages(currentQuery, page);
  if (data.hits.length === 0) {
    loadMoreBtn.style.display = 'none';
    

    iziToast.error({
      title: 'No Results',
      message: "No images found. Please try a different query.",
      position: 'topRight', 
    });
    return;
  }

  renderImages(data.hits);
  loadMoreBtn.style.display = 'block'; 
  searchInput.value = ''; 

 
  if (page * 40 >= totalHits) {
    loadMoreBtn.style.display = 'none';
    iziToast.error({
      title: 'Sorry',
      message: "We're sorry, but you've reached the end of search results.",
      position: 'topRight', 
    });
  }
});


loadMoreBtn.addEventListener('click', async () => {
  page += 1;
  const data = await fetchImages(currentQuery, page);
  renderImages(data.hits);


  if (page * 40 >= totalHits) {
    loadMoreBtn.style.display = 'none';
    iziToast.error({
      title: 'Sorry',
      message: "We're sorry, but you've reached the end of search results.",
      position: 'topRight', 
    });
  }


  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
});