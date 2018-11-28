/* globals APIKEY */

const movieDBURL = "https:/api.themoviedb.org/3/";
let imageURL = null;
let imageSizes = {};
let searchString = "";
let settingType = null;

document.addEventListener("DOMContentLoaded", init);

function init() {
    addEventListeners();
    getLSData();
}

function addEventListeners() {
    let searchButton = document.querySelector(".searchButtonDiv");
    searchButton.addEventListener("click", startSearch);
    let settingButton = document.querySelector(".settingButtonDiv");
    settingButton.addEventListener("click", showOverlay);
//    document.querySelector("#modalButton").addEventListener("click", showOverlay);
    document.querySelector(".cancelButton").addEventListener("click", hideOverlay);    
    document.querySelector(".saveButton").addEventListener("click", function(e){
        let setList = document.getElementsByName("settings");
        let setType = null;
        for (let i = 0; i < setList.length; i++) {
            if (setList[i].checked) {
                setType = setList[i].value;
                settingType = setType;
                break;
            }
        }
        hideOverlay(e);
    });
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
        alert("Please type something!");
        searchString.focus();
        return;
    }
    getSearchResults();
}

function getSearchResults() {
    let url = `${movieDBURL}search/${settingType}?api_key=${APIKEY}&query=${searchString.value}`;
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

 
function showOverlay(e) {
    e.preventDefault();
    let overlay = document.querySelector(".overlay");
    overlay.classList.remove("hide");
    overlay.classList.add("show");
    showModal(e);
}

function showModal(e) {
    e.preventDefault();
    let modal = document.querySelector(".modal");
    modal.classList.remove("off");
    modal.classList.add("on");
}

function hideOverlay(e) {
    e.preventDefault();
    e.stopPropagation(); // don't allow clicks to pass through
    let overlay = document.querySelector(".overlay");
    overlay.classList.remove("show");
    overlay.classList.add("hide");
    hideModal(e);
}

function hideModal(e) {
    e.preventDefault();
    let modal = document.querySelector(".modal");
    modal.classList.remove("on");
    modal.classList.add("off");
}
