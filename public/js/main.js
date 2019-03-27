const searchResults = document.getElementsByClassName('visible-results');
if (searchResults.length > 0) {
    for (let searchResult of searchResults) {
        searchResult.addEventListener('click', (event) => {
            for (let item of searchResults) {
                item.lastElementChild.setAttribute('class', 'fa fa-chevron-down')
                item.nextElementSibling.style.display = 'none';
            }
            let elem = searchResult.nextElementSibling;
            if (elem.style.display === 'flex') {
                searchResult.lastElementChild.setAttribute('class', 'fa fa-chevron-down');
                elem.style.display = 'none';
            } else {
                searchResult.lastElementChild.setAttribute('class', 'fa fa-chevron-up');
                elem.style.display = 'flex'
            }
        });
    }
}