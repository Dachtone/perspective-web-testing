'use strict'

Object.size = (obj)=>{
    let size = 0, key;
    for(key in obj){
        if(obj.hasOwnProperty(key)) size++;
    }
    return size
}

// Workaround to save the filter value for custom selects
export function setSelects(search) {
    const selects = Array.from(document.getElementsByClassName('place'))
    for (var field in search) {
        if (field === 'set')
            continue

        for (var i = 0; i < selects.length; i++) {
            const select_template = selects[i].parentNode.parentNode
            if (select_template.attributes.name.value !== field)
                continue

            selects[i].setAttribute('value', search[field])
            var items = Array.from(select_template.getElementsByTagName('select-item'))
            for (var j = 0; j < items.length; j++) {
                if (items[j].attributes.value.value != search[field])
                    continue

                selects[i].textContent = items[j].textContent
            }
        }
    }
}

const button = document.querySelector('.filter-open')
const modal = document.querySelector('.filter-modal')
const search = document.getElementById('searchButton')
const clearButton = document.getElementById('clearButton')

function addListener(){
    document.addEventListener('mousedown', ({target})=>{
       if(modal.getAttribute('hidden-modal') == null){
           if(!modal.contains(target) && !button.contains(target)){
               modal.setAttribute('hidden-modal', '')
           }
       }
    })
    button.addEventListener('click', ()=> {
        modal.toggleAttribute('hidden-modal')
    })
    search.addEventListener('click', (e)=> {
        e.preventDefault()

        collectDatafromFilter()

    })
    clearButton.addEventListener(('click'), (e) => {
        e.preventDefault()
        window.location.replace('/tests')
    })
}

function collectDatafromFilter(){
    let data = []
    let radio
    const parent = document.querySelector('.filter-modal')

    const tittle = parent.querySelector('[name="headline"]')
    const subject = parent.querySelector('[name="subject"]')
    const theme = parent.querySelector('[name="topic"] .place')
    const semester = parent.querySelector('[name="semester"] .place')
    const author = parent.querySelector('[name="author"] .place')
    const completed = parent.querySelectorAll('input[type="radio"]')
    Array.prototype.forEach.call(completed, item =>{
        if(item.checked){
            radio = item.value
        }
    })
    
    data.push({
        'headline': tittle.value.trim(),
        'subject': subject.value.trim(),
        'topic': theme.getAttribute('value'),
        'semester': semester.getAttribute('value'),
        'author': author.getAttribute('value'),
        'completed': radio === undefined ? '' : radio
    })
    clear(data)
}

function clear(value){
    const item = value[0]

    for (let key in item){
        if (item[key] == '' || item[key] === undefined || item[key] === null) {
            delete item[key]
        }
    }
    addMask(item)
}

function addMask(data){
    let result = ''
    let elementPosition = 0
    const length = Object.size(data)

    for (let key in data) {
        elementPosition++;

        if (elementPosition !== length){
            result += `${key}=${data[key]}&`
        }
        else {
            result += `${key}=${data[key]}`
        }
    }

    sendAjax_filter(result)
}

function sendAjax_filter(data){
    /*
    const http = new XMLHttpRequest()
    console.log(data)
    http.open('GET', '/test')
    http.send(data)
    */
    window.location.replace(`/tests?${data}`)
}

function setPosition(){
    const offset = button.offsetTop
    const height = button.offsetHeight

    modal.style.top = `${offset + height + 10}px`

    addListener()
}

setPosition()
