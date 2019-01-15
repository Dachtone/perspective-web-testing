import {JSinputImplementation} from './js_modules/inputimpl.js'
import {rippleEffect} from './js_modules/rippleEffect.js'

const JSinput = new JSinputImplementation('.bj', {placeholder: '.Rjx2D'})
const ripple = new rippleEffect('.loginbtn')


function errorAlert(wrap, alertblock){
    const alert = document.querySelector(alertblock)
    const parent = document.querySelectorAll(wrap)

    Array.prototype.forEach.call(parent, element =>{
        const value = element.querySelector('input').value
        
            if(value.trim() == ''){
                element.classList.add('_empty')
                alert.classList.add('AjmAWC')
            }
            else{
                element.classList.remove('_empty')
                alert.classList.remove('AjmAWC')
            }
    })
}


//  Слушатель заглушка
document.querySelector('.loginbtn').addEventListener('click', function(){
    errorAlert('.bj', '.RWacdkJs')
})