/* globals APIKEY */

const movieDBURL = "https:/api.themoviedb.org/3/";
let imageURL = null;
let imageSizes = {};
let searchString = "";
let settingType = null;
let indexOfType = 0;
let typeKey = "type";
let setKey = "set";
let dateKey = "date";
let timeStaled = 10000; //3600000;

document.addEventListener("DOMContentLoaded", init);

function init() {
    document.getElementById("search-input").focus();
    addEventListeners();
    getPosterSizesAndURL();
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
        settingType = JSON.parse(localStorage.getItem(setKey));

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
console.log(data);
            imageURL = data.images.base_url;
            imageSizes = data.images.poster_sizes;
            console.log(imageSizes);
        })
        .catch(function (error) {
            alert(error);
        })
}

function saveLSData() {
    localStorage.setItem(typeKey, JSON.stringify(indexOfType));
    localStorage.setItem(setKey, JSON.stringify(settingType));

    let now = new Date();
    localStorage.setItem(dateKey, JSON.stringify(now));
    document.getElementById("search-input").focus();
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
//            console.log(data);
//            imageURL = data.images.base_url;
//            imageSizes = data.images.poster_sizes;
            fillDataCards(data);
        })
        .catch(function (error) {
            alert(error);
        })
}

//             <section class="title">
//               <div class="image"><img src="https://image.tmdb.org/t/p/w200/kqjL17yufvn9OVLyXYpvtyrFfak.jpg" /></div>
//                <div class="nameTitle">MAD MAX</div>
//                <div class="date">2018-11-28</div>
//                <div class="txtTitle"><p>Lorem</p></div>

function fillDataCards(data) {
    let dataCard = document.querySelector("#search-results");
//    dataCard.innerHTML = "";
    for (let item in data.results) {
        let sec = document.createElement("section");
        sec.setAttribute("class", "title");
        sec.append;
        let divImg = document.createElement("div");
        divImg.setAttribute("class", "image");
        let img = document.createElement("img");
        img.setAttribute("src", imageURL + "w200/" + data.results[item].poster_path);
        dataCard.appendChild(img);
        dataCard.appendChild(divImg);
        //        sec.innerHTML = data.results[item];
        dataCard.appendChild(sec);
    }
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
