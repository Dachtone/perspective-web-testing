
export class JSinputImplementation{
    constructor(wrap, obj){
        this.placeholder = obj.placeholder

        this.wrap = document.querySelectorAll(wrap)
        this.loop()
    }
    loop(){
        Array.prototype.forEach.call(this.wrap, element => {
            this.listeners(element)
        })
        this.desnull()
    }
    animating(element){
        const form = element.querySelector('input')
        const placeholder = element.querySelector(this.placeholder)

        placeholder.classList.add('uWuQQ9p')
        placeholder.classList.add('h5DzSLL')
        this.onCheked(form)
    }
    disableAnimating(element){
        const value = element.querySelector('input').value
        const placeholder = element.querySelector(this.placeholder)

        if(value.trim() == ''){
            placeholder.classList.remove('uWuQQ9p')
            placeholder.classList.remove('h5DzSLL')
        }else{
            placeholder.classList.remove('h5DzSLL')
        }

    }
    onCheked(element){
        window.setTimeout(() =>{
            element.focus()
        }, 0)
    }
    listeners(element){
        const input = element.querySelector('input')
            this.check(element, input)

        input.addEventListener('mousedown', ({target}) =>{
            this.animating(element)
        })
        input.addEventListener('blur', () => {
            this.disableAnimating(element)
        })
    }
    check(element, input){
        if(input.getAttribute('autofocus') !== null){
            this.animating(element)
        }
    }
    desnull(){
        Array.prototype.forEach.call(this.wrap, element => {
            element.querySelector('input').value = ''
        })
    }
}

