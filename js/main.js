/* globals APIKEY */

const mdbURL = "https://api.themoviedb.org/3/";
let imageURL = null;
let imageSizes = {};
let searchString = "";
let settingType = null;
let indexOfType = 0;
let activePage = 1;
let typePage = "S";
let searchID = 0;
let typeKey = "type";
let setKey = "set";
let dateKey = "date";
let timeStaled = 3600000;
let maxPos = 200;


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
        let setList = document.getElementsByName("optSettings");
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
        let selIndex = document.getElementsByName("optSettings");
        indexOfType = JSON.parse(localStorage.getItem(typeKey));
        settingType = JSON.parse(localStorage.getItem(setKey));

        selIndex[indexOfType].checked = true;

        let now = new Date();
        let savedDate = JSON.parse(localStorage.getItem(dateKey));
        savedDate = new Date(savedDate);
        console.log(savedDate);
        console.log(now);
        if ((now - savedDate) > timeStaled) {
            getPosterSizesAndURL();
            saveLSData(indexOfType);
        }
    } else {
        indexOfType = 0;
    }
}

function getPosterSizesAndURL() {
    let url = `${mdbURL}configuration?api_key=${APIKEY}`;
    fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            imageURL = data.images.secure_base_url;
            imageSizes = data.images.poster_sizes;
            console.log(imageSizes);
            console.log(imageURL);
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
    if (settingType != null) {
        getSearchResults();
    } else {
        document.getElementsByName("optSettings")[0].checked = false;
        document.getElementsByName("optSettings")[1].checked = false;
        showOverlay();
    }
}

function getSearchResults() {
    let dataCard = document.querySelector("#search-results");
    if (activePage == 0) {
        activePage = 1;
    }
    searchID = 0;
    let url = `${mdbURL}search/${settingType}?api_key=${APIKEY}&page=${activePage}&query=${searchString.value}`;
    fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if (data.results.length == 0) {
                alert("Sorry, no result for this search!");
                return;
            }
            dataCard.innerHTML = "";
            document.querySelector(".items-pages").textContent = "Results: " + data.total_results + " item(s)";
            typePage = "S";
            loadStars(data.total_pages);

            if (settingType == "movie") {
                fillDataCardsMV(data, "#search-results");
            } else {
                fillDataCardsTV(data, "#search-results");
            }
        })
        .catch(function (error) {
            alert(error);
        })
}

function showRecom(e) {
    if (searchID == 0) {
        searchID = e.target.id;
        console.log(searchID);
    }
    if (activePage == 0) {
        activePage = 1;
    }
    let urlRecom = `${mdbURL}${settingType}/${searchID}/recommendations?api_key=${APIKEY}&page=${activePage}`;
    fetch(urlRecom)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if (data.results.length == 0) {
                alert("Sorry, no recommendations!");
                searchID = 0;
                return;
            }
            typePage = "R";
            loadStars(data.total_pages);
            let pages = [];
            pages = document.querySelectorAll(".page");
            pages[0].classList.toggle("hide");
            pages[1].classList.toggle("hide");
            document.querySelector(".items-pages").textContent = "Results: " + data.total_results + " item(s)";
            if (settingType == "movie") {
                fillDataCardsMV(data, "#recommend-results");
            } else {
                fillDataCardsTV(data, "#recommend-results");
            }
        })
        .catch(function (error) {
            alert(error);
        })
}

function loadStars(qt) {
    let divPage = document.querySelector(".paging");
    divPage.innerHTML = "";
    for (let item = 1; item <= qt; item++) {
        let img = document.createElement("img");
        img.setAttribute("class", "star pointer");
        img.setAttribute("title", "Page" + item);
        if (item == activePage) {
            img.setAttribute("src", "icon/png/stary.png");
        } else {
            img.setAttribute("src", "icon/png/star.svg");
        }
        img.setAttribute("id", item);
        img.setAttribute("alt", "Page" + item);
        divPage.appendChild(img);
        divPage.addEventListener("click", flipPage);
    }
}

function fillDataCardsMV(data, pageID) {
    console.log(data);
    let dataCard = document.querySelector(pageID);
    for (let item in data.results) {
        let sec = document.createElement("section");
        if (pageID == "#search-results") {
            sec.setAttribute("class", "title pointer");
        } else {
            sec.setAttribute("class", "title");
        }
        //        sec.setAttribute("id", "title_search");
        sec.setAttribute("id", data.results[item].id);
        let divImg = document.createElement("div");
        divImg.setAttribute("class", "image");
        let img = document.createElement("img");
        if (data.results[item].poster_path != null) {
            img.setAttribute("src", imageURL + "w185/" + data.results[item].poster_path);
        } else if (data.results[item].backdrop_path != null) {
            img.setAttribute("src", imageURL + "w185/" + data.results[item].backdrop_path);
        } else {
            img.setAttribute("src", "icon/png/noimage.png");
        }
        img.setAttribute("alt", data.results[item].title);
        let divTtl = document.createElement("div");
        divTtl.setAttribute("class", "nameTitle");
        divTtl.textContent = data.results[item].title;
        let divDate = document.createElement("div");
        divDate.setAttribute("class", "date");
        divDate.textContent = data.results[item].release_date;
        if (divDate.textContent == "") {
            divDate.textContent = "Date Not Defined";
        }
        let divTxtTtl = document.createElement("div");
        divTxtTtl.setAttribute("class", "txtTitle");

        let ovw = data.results[item].overview;
        if (ovw == "") {
            ovw = "We don't have an overview for this yet. As soons as we have one, it'll be shown here. Meanwhile, help us expand our database by adding one.";
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
        sec.addEventListener("click", showRecom);
    }
}

function fillDataCardsTV(data, pageID) {
    console.log(data);
    let dataCard = document.querySelector(pageID);
    for (let item in data.results) {
        let sec = document.createElement("section");
        if (pageID == "#search-results") {
            sec.setAttribute("class", "title pointer");
        } else {
            sec.setAttribute("class", "title");
        }
        //        sec.setAttribute("id", "title_search");
        sec.setAttribute("id", data.results[item].id);
        let divImg = document.createElement("div");
        divImg.setAttribute("class", "image");
        let img = document.createElement("img");
        if (data.results[item].poster_path != null) {
            img.setAttribute("src", imageURL + "w185/" + data.results[item].poster_path);
        } else if (data.results[item].backdrop_path != null) {
            img.setAttribute("src", imageURL + "w185/" + data.results[item].backdrop_path);
        } else {
            img.setAttribute("src", "icon/png/noimage.png");
        }
        img.setAttribute("alt", data.results[item].title);
        let divTtl = document.createElement("div");
        divTtl.setAttribute("class", "nameTitle");
        divTtl.textContent = data.results[item].name;
        let divDate = document.createElement("div");
        divDate.setAttribute("class", "date");
        divDate.textContent = data.results[item].first_air_date;
        if (divDate.textContent == "") {
            divDate.textContent = "Date Not Defined";
        }
        let divTxtTtl = document.createElement("div");
        divTxtTtl.setAttribute("class", "txtTitle");

        let ovw = data.results[item].overview;
        if (ovw == "") {
            ovw = "We don't have an overview for this yet. As soons as we have one, it'll be shown here. Meanwhile, help us expand our database by adding one.";
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
        sec.addEventListener("click", showRecom);
    }
}

function flipPage(e) {
    activePage = e.target.id;
    if (typePage == "S") {
        getSearchResults();
    } else {
        showRecom();
    }
}

/***********************************
        MODALS / OVERLAYS
***********************************/

function showOverlay(e) {
    console.log(settingType);
    if (settingType != null) {
        e.preventDefault();
    }
    let overlay = document.querySelector(".overlay");
    overlay.classList.remove("hide");
    overlay.classList.add("show");
    showModal(e);
}

function showModal(e) {
    if (settingType != null) {
        e.preventDefault();
    }
    let modal = document.querySelector(".modalw");
    modal.classList.remove("off");
    modal.classList.add("on");
}

function hideOverlay(e) {
    if (settingType != null) {
        e.preventDefault();
    }
    e.stopPropagation(); // don't allow clicks to pass through
    let overlay = document.querySelector(".overlay");
    overlay.classList.remove("show");
    overlay.classList.add("hide");
    hideModal(e);
}

function hideModal(e) {
    if (settingType != null) {
        e.preventDefault();
    }
    let modal = document.querySelector(".modalw");
    modal.classList.remove("on");
    modal.classList.add("off");
}
