if(/source=/g.test(window.location.search) === true){
    document.querySelector('.G1qVSlLk').setAttribute('redirect-page', '')
    const result = (window.location.search).match(/\=[a-zA-Z0-9/]+/g)[0].replace(/\=/g, '')

    appendArrow(result)
}
function appendArrow(href){
    const arrowback = document.createElement('div')
    arrowback.className = 'sendback'
    arrowback.innerHTML = `    <a href="/${href}">
        <iron-icon aria-ripple>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" fill="#000000a9" height="20" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        </iron-icon>                         
    </a>
    <h1 class="OePdZjKkR">Назад</h1>`

    document.querySelector('.exqyWGy2Ko').append(arrowback)
}