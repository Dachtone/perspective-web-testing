
export class rippleEffect{
    constructor(obj){
        this.button = document.querySelectorAll(obj)

        this.button_listener()
    }
    button_listener(){
        Array.prototype.forEach.call(this.button, element =>{
            element.addEventListener('mousedown', this.createRipple.bind(this) )
        })
    }
    createRipple(event){
        const target = event.currentTarget
        
        const ripple = document.createElement('span')
              ripple.className = 'rippleon'
        target.appendChild(ripple)

        this.ripplePosition(event, target, ripple)
        this.removeRippleListener(ripple)
    }
    ripplePosition(e, curTarget, element){
        const max = Math.max(curTarget.offsetWidth, curTarget.offsetHeight);
        element.style.width = element.style.height = max + 'px';

 	    const rect = curTarget.getBoundingClientRect();
 	    element.style.left = e.clientX - rect.left - (max/2) + 'px';
 	    element.style.top = e.clientY - rect.top - (max/2) + 'px';
 	    element.classList.add('on')
    }
    removeRippleListener(ripple){
        document.addEventListener('mouseup', function(){
            ripple.classList.add('clean')
            setTimeout(function(){
              ripple.remove()
            },310)
        })
    }

}
