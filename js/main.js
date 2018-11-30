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
let timeStaled = 3600000;
let maxPos = 300;

document.addEventListener("DOMContentLoaded", init);

function init() {
    addEventListeners();
    getPosterSizesAndURL();
    getLSData();
    document.getElementById("search-input").focus();
}

function addEventListeners() {
    let searchButton = document.querySelector(".searchButtonDiv");
    searchButton.addEventListener("click", startSearch);
    searchButton.addEventListener("keypress", pressEvent);
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

function getPosterSizesAndURL() {
    let url = `${movieDBURL}configuration?api_key=${APIKEY}`;
console.log(`${movieDBURL}configuration?api_key=${APIKEY}`);

    fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
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

function pressEvent(e) {
    let keyCode = e.keyCode;
    if (keyCode == 13) {
        startSearch();
    }
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
    let dataCard = document.querySelector("#search-results");
    dataCard.innerHTML = "";
    let url = `${movieDBURL}search/${settingType}?api_key=${APIKEY}&query=${searchString.value}`;
    fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if (data.results.length == 0) {
                alert("Sorry, no result for this search!");
                return;
            }
            if (settingType == "movie") {
                fillDataCardsMV(data);
            } else {
                fillDataCardsTV(data);
            }
        })
        .catch(function (error) {
            alert(error);
        })
}

function fillDataCardsMV(data) {
    console.log(data);
    let dataCard = document.querySelector("#search-results");
    for (let item in data.results) {
        let sec = document.createElement("section");
        sec.setAttribute("class", "title");
        let divImg = document.createElement("div");
        divImg.setAttribute("class", "image");
        let img = document.createElement("img");
        if (data.results[item].poster_path != null) {
            img.setAttribute("src", imageURL + "w185/" + data.results[item].poster_path);
        } else if (data.results[item].backdrop_path != null) {
            img.setAttribute("src", imageURL + "w185/" + data.results[item].backdrop_path);
        } else {
            img.setAttribute("src", "icon/png/noimage.jpg");
        }
        img.setAttribute("alt", data.results[item].title);
        let divTtl = document.createElement("div");
        divTtl.setAttribute("class", "nameTitle");
        divTtl.textContent = data.results[item].title;
        let divDate = document.createElement("div");
        divDate.setAttribute("class", "date");
        divDate.textContent = data.results[item].release_date;
        let divTxtTtl = document.createElement("div");
        divTxtTtl.setAttribute("class", "txtTitle");

        let ovw = data.results[item].overview;
        if (ovw == "") {
            ovw = "We don't have an overview to show you here. As soons as we have one, you're going to see it. Meanwhile, help us expand our database by adding one.";
        }
        if (ovw.length > maxPos) {
            let txtTrunc = ovw.substring(0, maxPos - 3) + '...';
            divTxtTtl.textContent = txtTrunc;
        } else {
            divTxtTtl.textContent = ovw;
        }
        dataCard.appendChild(sec);
        sec.appendChild(divImg);
        divImg.appendChild(img);
        sec.appendChild(divTtl);
        sec.appendChild(divDate);
        sec.appendChild(divTxtTtl);
    }
}

function fillDataCardsTV(data) {
    console.log(data);
    let dataCard = document.querySelector("#search-results");
    for (let item in data.results) {
        let sec = document.createElement("section");
        sec.setAttribute("class", "title");
        let divImg = document.createElement("div");
        divImg.setAttribute("class", "image");
        let img = document.createElement("img");
        if (data.results[item].poster_path != null) {
            img.setAttribute("src", imageURL + "w185/" + data.results[item].poster_path);
        } else if (data.results[item].backdrop_path != null) {
            img.setAttribute("src", imageURL + "w185/" + data.results[item].backdrop_path);
        } else {
            img.setAttribute("src", "icon/png/noimage.jpg");
        }
        img.setAttribute("alt", data.results[item].title);
        let divTtl = document.createElement("div");
        divTtl.setAttribute("class", "nameTitle");
        divTtl.textContent = data.results[item].name;
        let divDate = document.createElement("div");
        divDate.setAttribute("class", "date");
        divDate.textContent = data.results[item].first_air_date;
        let divTxtTtl = document.createElement("div");
        divTxtTtl.setAttribute("class", "txtTitle");

        let ovw = data.results[item].overview;
        if (ovw == "") {
            ovw = "We don't have an overview to show you here. As soons as we have one, you're going to see it. Meanwhile, help us expand our database by adding one.";
        }
        if (ovw.length > maxPos) {
            let txtTrunc = ovw.substring(0, maxPos - 3) + '...';
            divTxtTtl.textContent = txtTrunc;
        } else {
            divTxtTtl.textContent = ovw;
        }
        dataCard.appendChild(sec);
        sec.appendChild(divImg);
        divImg.appendChild(img);
        sec.appendChild(divTtl);
        sec.appendChild(divDate);
        sec.appendChild(divTxtTtl);
    }
}

/***********************************
        MODALS / OVERLAYS
***********************************/

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
