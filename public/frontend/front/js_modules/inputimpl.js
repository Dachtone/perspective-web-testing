export class JSinputImplementation{
    constructor(wrap){
        this.wrap = Array.from(document.querySelectorAll(wrap))

        this.wrap.forEach(element => {
            this.input = element.querySelector('input')
            
           this.addListener(this.input, element)
        })
    }
    addListener(node, wrap){
        const wrapper = wrap

        node.addEventListener('focus', ()=>{
            this.isFocused(wrapper)
        })
        node.addEventListener('blur', ()=>{
            this.IsBlur(wrapper)
        })
    }

    isFocused(element){
        const placeholder = element.querySelector('.Rjx2D')

        placeholder.classList.add('uWuQQ9p')
        placeholder.classList.add('h5DzSLL')
        element.classList.add('dwajisY')
    }
    IsBlur(element){
        const value = element.querySelector('input').value
        const placeholder = element.querySelector('.Rjx2D')

        element.classList.remove('dwajisY')
        let error = 0 
         if(value.trim() == ''){
            placeholder.classList.remove('uWuQQ9p')
            placeholder.classList.remove('h5DzSLL')
         }else{
            placeholder.classList.remove('h5DzSLL')
         }
    }
}


