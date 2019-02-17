const button = document.querySelector('.filter-open')
const modal = document.querySelector('.filter-modal')
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
}
function setPosition(){
    const offset = button.offsetTop
    const height = button.offsetHeight

    modal.style.top = `${offset + height + 10}px`

    addListener()
}
setPosition()
