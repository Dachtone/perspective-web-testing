
export class rippleCircle{
    constructor(obj){
        this.getRipple(obj);
    }
    getRipple(obj){
        if(obj instanceof HTMLElement){
            this.setListener(obj)
        }else{
            if(Array.isArray(obj)){
                Array.prototype.forEach.call(obj, element => {
                    this.setListener(element)
                })
            }
            if(typeof obj == 'string'){
                const node = document.querySelectorAll(obj)
                Array.prototype.forEach.call(node, element => {
                    this.setListener(element)
                })
            }
        }
    }
    setListener(target){
        target.addEventListener('mousedown', this.showRipple.bind(this))
    }
    showRipple(target){
        const parent = target.currentTarget;
        const ripple = document.createElement('div')
        ripple.className = 'aria-ripple'

        parent.appendChild(ripple)
        setTimeout(()=>{
            ripple.classList.add('animate')
        },0)
            
        this.hideRipple(ripple)
    }
    hideRipple(ripple){
        document.addEventListener('mouseup', () => {
            ripple.classList.add('rejected')
            setTimeout(()=>{
                ripple.remove()
            },300)
        })
    }
}