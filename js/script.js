import key from "./config.js";

const header = document.querySelector('header');
const footer = document.querySelector('footer');
const main = document.querySelector('main');
const headerLogo = document.querySelector('.header-logo');
const currentDate = document.getElementById('current-date');
const articleContainer = document.getElementById('article-container')
const articleSearch = document.querySelector('.article-search')
const searchButton = document.querySelector('.search-button')
const searchInput = document.querySelector('.search-input')

const getCurrentDateInWords = () => {
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
    return new Intl.DateTimeFormat('en-US', options).format(new Date())
}

const setMainMinHeight = () => {
    const screenHeight = window.innerHeight
    const headerHeight = header.getBoundingClientRect().height
    const footerHeight = footer.getBoundingClientRect().height
    const bodyPadding = parseInt(getComputedStyle(document.body).paddingTop) + parseInt(getComputedStyle(document.body).paddingBottom)
  
    const mainMinHeight = screenHeight - (headerHeight + footerHeight + bodyPadding)
    main.style.minHeight = mainMinHeight + 'px'
}

const createArticles = (articles, type) => {
    let searchClass = 'article'

    if(type === 'search'){
        searchClass = 'article search-result'
    }

    const homepageArticles = articles.map((article) => {
        return `<a class="${searchClass}" href="${article.url}" target="_blank" data-aos="fade-up"> 
                    <div class="article-header">
                    <h2 class="article-title">${article.title}</h2>
                    <span class="by-line">${article.byline}</span>
                    </div>
                    <p class='abstract'>${article.abstract}</p>
                </a>`
    }).join('')
    articleContainer.innerHTML = homepageArticles
}

const prependHeader = (length) => {
    let headerClass = 'search-header'
    let title = 'search results'

    if(length === 0){
        headerClass = 'search-header no-result'
        title = 'no results'
    }

    const keywords = searchInput.value
    const searchHeader = document.createElement('div')
    searchHeader.className = `${headerClass}`
    searchHeader.innerHTML = `<span class='search-title'><b>${title}</b></span>
                              <span class="search-words">for "${keywords}"</span>`
    articleContainer.prepend(searchHeader)
}

const throwError = () => {
    articleContainer.innerHTML =
    `<div class="error-message">
        <i class="fa-solid fa-circle-exclamation"></i>
        <span>There was an error loading articles.</span>
    </div>`
}

const clearSearchInput = () => {
    searchInput.value = ""
}

const getHomepageArticles = async () => {
    clearSearchInput()
    try {
        const response = await fetch(`https://api.nytimes.com/svc/topstories/v2/home.json?api-key=${key}`)
        const data = await response.json()
        const articles = data.results.splice(0, 12)
        createArticles(articles)
    } catch (error) {
        throwError()
    }
}

const searchArticles = async () => {
    const query = searchInput.value
    if (query < 1) {
        searchInput.focus()
    } else {
        try {
                const response = await fetch(`https://api.nytimes.com/svc/search/v2/articlesearch.json?q=${query}&api-key=${key}`)
                const data = await response.json()
                const articles = data.response.docs.map(dataObject => (
                    {
                        url: dataObject.web_url || '–',
                        title: dataObject.headline.main || 'Untitled',
                        byline: dataObject.byline.original || 'No author mentioned',
                        abstract: dataObject.snippet || 'No summary',
                    }
                ))
                    createArticles(articles, 'search')
                    prependHeader(articles.length)
        } catch (error) {
            throwError()
        }
    }
}

const init = () => {
    currentDate.innerHTML = getCurrentDateInWords()
    setMainMinHeight()
    getHomepageArticles()
}

// Settings for AOS animations script
AOS.init({
    duration: 800,
    offset: 50,
    once: true
})

window.addEventListener('DOMContentLoaded', init)

window.addEventListener('resize', setMainMinHeight);

headerLogo.addEventListener('click', () => {
    getHomepageArticles()
})

    
currentDate.addEventListener('click', () => {
    getHomepageArticles()
})

searchButton.addEventListener('click', () => {
    searchArticles()
})
    
searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        e.preventDefault()
        searchArticles()
    }
})
