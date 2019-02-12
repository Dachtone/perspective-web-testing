import {createElement} from './createElement.js'


export class FZselect{
    constructor(tamplate){
        typeof tamplate == 'string' ? this.obj = document.querySelectorAll(tamplate) : this.obj = tamplate

        this.tamplateSet()
    }
    initFalse(obj){
        obj.setAttribute('confirmed', 'false')
    }
    initTrue(obj){
        obj.setAttribute('confirmed', 'true')
    }
    initTittle(obj){
        const place = obj.querySelector('select-placeholder')
        const content = place.getAttribute('data-this')
        const costyul = createElement('select')
        const son_costyul = createElement('option')
        const ttle = createElement('div', {class: 'place'})
        const icon = createElement('select-icon')
         ttle.innerHTML = content;
         icon.innerHTML = ' <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'

        costyul.setAttribute('form','registerForm')
        costyul.setAttribute('required', '')
        costyul.setAttribute('name', 'inputType')
        son_costyul.setAttribute('selected', '')
        costyul.appendChild(son_costyul)

        place.appendChild(ttle)
        place.appendChild(icon)
        place.appendChild(costyul)
    }
    tamplateSet(){
        Array.prototype.forEach.call(this.obj, item =>{
            this.initTittle(item)
            this.initFalse(item)
            this.addListener(item)
            this.tamplatePosition(item)
        })
    }
    tamplatePosition(element){
        const wrap = element.querySelector('select-wrap')
        wrap.style = `top: ${element.clientHeight}px`
    }
    addListener(element){
      
        const html = document.querySelector('html')
        const wrapper = element
        const item = element.querySelectorAll('select-item')

        html.addEventListener('mousedown', (event)=>{
            this.rejectTamplate({parent: element, e:event})
        })
        wrapper.addEventListener('click', () => {
            this.tamplateOpen(wrapper)
        })
        Array.prototype.forEach.call(item, node =>{
            node.addEventListener('click', ()=>{
                this.itemChose({obj: wrapper, item: node})
            })
        })
    }
    rejectTamplate(data){
        const wrapp = data.parent
        const target = data.e.target

        if(!wrapp.contains(target)){
            this.tamplateClose(wrapp)
        }
    }
    tamplateClose(data){
        const menu = data.querySelector('select-wrap')
        menu.removeAttribute('visible')
    }
    tamplateOpen(data){
        const menu = data.querySelector('select-wrap')
        menu.toggleAttribute('visible')
    }
    itemChose(data){
        this.initChange(data)
        this.initTrue(data.obj)
    }
    initChange(data){
        const select = data.obj.querySelector('option')
        const place = data.obj.querySelector('.place')
        const data_variant = data.item.textContent
        select.setAttribute('value', data_variant)
        select.textContent = data_variant
        place.textContent = data_variant
    }
}
