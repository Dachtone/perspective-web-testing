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
function collectDatafromFilter(){
    const parent = document.querySelector('.filter-modal')

    const tittle = parent.querySelector('[name="headline"]')
    const subject = parent.querySelector('[name="subject"]')
    const theme = parent.querySelector('[name="topic"]')
    const semester = parent.querySelector('[name="semester"]')
    const author = parent.querySelector('[name="author"]')
    const completed = parent.querySelectorAll('input[type="radio"]')

    Array.prototype.forEach.call(completed, item =>{
        if(item.checked){
            console.log(item.value)
        }
    })
}


function setPosition(){
    const offset = button.offsetTop
    const height = button.offsetHeight

    modal.style.top = `${offset + height + 10}px`

    addListener()
}
setPosition()
