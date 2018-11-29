/* globals APIKEY */

const movieDBURL = "https:/api.themoviedb.org/3/";
let imageURL = null;
let imageSizes = {};
let searchString = "";
let settingType = null;
let indexOfType = 0;
let typeKey = "type";
let dateKey = "date";
let timeStaled = 10000; //3600000;

document.addEventListener("DOMContentLoaded", init);

function init() {
    document.getElementById("search-input").focus();
    addEventListeners();
    getLSData();
}

function addEventListeners() {
    let searchButton = document.querySelector(".searchButtonDiv");
    searchButton.addEventListener("click", startSearch);
    let settingButton = document.querySelector(".settingButtonDiv");
    settingButton.addEventListener("click", showOverlay);

    document.querySelector(".cancelButton").addEventListener("click", hideOverlay);
    document.querySelector(".saveButton").addEventListener("click", function (e) {
        let setList = document.getElementsByName("settings");
        settingType = null;
        indexOfType = null;
        for (let i = 0; i < setList.length; i++) {
            if (setList[i].checked) {
                settingType = setList[i].value;
                indexOfType = i;
                saveLSData();
                break;
            }
        }
        hideOverlay(e);
    });
}

function getLSData() {
    // First see if data exists in local storage
    if (localStorage.getItem(typeKey)) {
        let selIndex = document.getElementsByName("settings");
        indexOfType = JSON.parse(localStorage.getItem(typeKey));

        selIndex[indexOfType].checked = true;

        let now = new Date();
        let savedDate = JSON.parse(localStorage.getItem(dateKey));
        savedDate = new Date(savedDate);
        if ((now - savedDate) > timeStaled) {
            console.log(savedDate);
            console.log(now);
            getPosterSizesAndURL();
            saveLSData(indexOfType);
        }
    } else {
        indexOfType = 0;
    }
}

function getLS2Data() {
    // load img sizes from local storage

    // it's first time and not exist

    // the data is stale (over 1 hour old)

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
            console.log(imageSizes);
        })
        .catch(function (error) {
            alert(error);
        })
}

function saveLSData() {
    localStorage.setItem(typeKey, JSON.stringify(indexOfType));
    let now = new Date();

    localStorage.setItem(dateKey, JSON.stringify(now));
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
    let modal = document.querySelector(".modalw");
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
    let modal = document.querySelector(".modalw");
    modal.classList.remove("on");
    modal.classList.add("off");
}
