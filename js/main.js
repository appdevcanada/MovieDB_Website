/* globals APIKEY */

const movieDBURL = "https:/api.themoviedb.org/3/";
let imageURL = null;
let imageSizes = {};
let searchString = "";

document.addEventListener("DOMContentLoaded", init);

function init() {
    addEventListeners();
    getLSData();
}

function addEventListeners() {
    let searchButton = document.querySelector(".searchButtonDiv");
    searchButton.addEventListener("click", startSearch)
}

function getLSData() {
    // load img sizes from local storage

    // it's first time and not exist

    // the data is stale (over 1 hour old)
    getPosterSizesAndURL();
    // else load from local storage
}

function getPosterSizesAndURL() {
    let url = `${movieDBURL}configuration?api_key=${APIKEY}`;
    console.log(url);
    fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            imageURL = data.images.secure_base_url;
            imageSizes = data.images.poster_sizes;
            console.log(imageURL);
            console.log(imageSizes);
        })
        .catch(function (error) {
            alert(error);
        })
}

function startSearch() {
    searchString = document.getElementById("search-input");
    if (!searchString.value) {
        alert("type something");
        searchString.focus();
        return;
    }
    getSearchResults();
}

function getSearchResults() {
    let url = `${movieDBURL}search/movie?api_key=${APIKEY}&query=${searchString.value}`;
    fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data);
        })
        .catch(function (error) {
            alert(error);
        })
}
