import {eventEmmiter} from './additions/emmiter.js'
import {createElement} from './additions/CreateElement.js'
import {rippleCircle} from './additions/ariaRipple.js'

export class view extends eventEmmiter{
    constructor(){
        super()
        
        this.delete_btn = document.querySelector('.AIt6QirCx ')
        this.create_button = document.querySelector('.sdAWjd2dl')
        this.container = document.querySelector('.EBQbR3g07L')
        this.success = document.querySelector('.phw1tr2Ml') 

        this.success.addEventListener('click', this.validate.bind(this))

        this.delete_btn.addEventListener('click', ()=> {
            this.init('event:remove-all', {})
        }) 
        this.create_button.addEventListener('click', ()=> {
            this.init('event:create', {})
        })
    }
    createItem(data){
        const item_wrapper = createElement('div', {class: 'JNpaRszs'})
        const iron_icon = createElement('iron-icon', {reject: data.id})

            item_wrapper.innerHTML = 
            `
                <div class="EoSh8tHys">Условие</div>
                <div class="B5QX5e8zoee">
                    <div class="XkgH40QICd">
                        <div class="id" contenteditable="true" aria-autocomplete="none"></div>
                    </div>
                    <div class="RVUsJwdjs">
                        <div class="EoSh8tHygh tlsa">
                            <span>Балл : </span>
                            <div class="fVX">
                                <input type="number" min="1" max='100'>
                            </div>
                        </div>
                        <div class="QqMJzpve tlsa">
                                <span>Правильный ответ : </span>
                                <div class="fVX">
                                    <input type="text">
                                </div>
                            </div>
                    </div>
                </div>
            `
            iron_icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill='#424242'width="24" height="24" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/><path d="M0 0h24v24H0z" fill="none"/></svg>`
        const main_wrapper = createElement('div', {class: 'uQgwAaVCKa_id item jsxJ', id: data.id}, iron_icon, item_wrapper)


        return this.addListener(main_wrapper)
    }
    addListener(object){
        const icon = object.querySelector('iron-icon')

        icon.addEventListener('click', ({currentTarget})=>{
            const id = currentTarget.getAttribute('reject')
            
            this.init('event:removetask', id)
        })

        new rippleCircle(icon)
        return object
    }
    addItem(data){
        const item = this.createItem(data)
        this.container.appendChild(item)
    }
    extractItem(data){
        data.forEach(element => {
            this.addItem(element)
        })
    }
    findElement(id){
        return  document.querySelector(`.item[id="${id}"]`)
    }
    hideElement(element){
        element.setAttribute('hide', '')
        setTimeout(()=>{
            element.remove()
        }, 210)
    }
    removeItem(id){
        const element = this.findElement(id)    
        this.hideElement(element)
    }
    removeAllItem(){
        const element = document.querySelectorAll('.item')
        Array.prototype.forEach.call(element, item => this.hideElement(item))
    }
    errorComplit(element, prop){
        const error = document.querySelector('.error')
        const ttle = error.querySelector('.error-ttle')

        error.setAttribute('error-reject', '')
        ttle.textContent = prop
    }
    errorReject(){
        const error =  document.querySelector('.error')
        error.removeAttribute('error-reject')
    }
    validate(){

        const item = document.querySelectorAll('.item');
        const theme = document.querySelector('.DJad2DAj');

            let error = false
            let _data = {}
            _data.data = []

        if(item){
            
            Array.prototype.forEach.call(item, element =>{
                const statement = element.querySelector('.id')
                const point = element.querySelector('input[type=number]')
                const answer = element.querySelector('input[type=text]')

                if(theme.value.trim() !== ''){
                    if(statement.textContent.trim() !== '' && point.value.trim() !== '' && answer.value.trim() !== ''){
                        error = true

                        _data.theme = theme.value
                        _data.data.push({'state': statement.textContent, 'point': point.value, 'answer': answer.value})
                        
                        this.init('event:send-data', _data)
                        this.errorReject()
                    }else{
                        this.errorComplit('','Заполните все условия задач')
                    }
                }
                else{
                    this.errorComplit('','Введите тему')
                }
            })
        }

    }
}
