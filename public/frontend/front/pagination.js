function updateQueryStringParameter(uri, key, value) {
    var re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
    var separator = uri.indexOf('?') !== -1 ? '&' : '?';
    if (uri.match(re)) {
        return uri.replace(re, '$1' + key + '=' + value + '$2');
    }
    else {
        return uri + separator + key + '=' + value;
    }
}
console.log(document.querySelector('.pageButton'))
const pageButtons = Array.from(document.getElementsByClassName('pageButton') || []);
pageButtons.forEach((page) => {
    page.addEventListener('click', (event) => {
        event.preventDefault();
        window.location.replace(updateQueryStringParameter(document.location.search, 'page', page.attributes.value.value));
    });
});