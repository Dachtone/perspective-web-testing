'use strict'

Object.size = (obj)=>{
    let size = 0, key;
    for(key in obj){
        if(obj.hasOwnProperty(key)) size++;
    }
    return size
}

const button = document.querySelector('.filter-open')
const modal = document.querySelector('.filter-modal')
const search = document.querySelector('.filter-modal button')


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
}
function validSelect(node){
    if(node.getAttribute('select') == 'true'){
        return node.textContent
    }else{
        return ''
    }
}
const d = document.querySelector('[name="topic"] .place')

console.log(validSelect(d))
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
        'topic': '',
        'semester': '',
        'author': '',
        'completed': radio === undefined ? '' : radio
    })
    clear(data)
}
function clear(value){
    const item = value[0]

    for(let key in item){
        if(item[key] == ''){
            delete item[key]
        }
    }
    addMask(item)
}

function addMask(data){
    let result = ''
    let elementPosition = 0
    const length = Object.size(data)

    for(let key in data){
        elementPosition++;
        if(elementPosition !== length){
            result += `${key}=${data[key]}&`
        }else{
            result += `${key}=${data[key]}`
        }
    }

    sendAjax_filter(result)
}
function sendAjax_filter(data){
    const http = new XMLHttpRequest()

    http.open('GET', '/test')
    http.send(data)
    window.location.replace(`/tests?${data}`)
}

function setPosition(){
    const offset = button.offsetTop
    const height = button.offsetHeight

    modal.style.top = `${offset + height + 10}px`

    addListener()
}
setPosition()
