function sendRegisterForm(){
    document.querySelector('#registerForm').submit()
}

function subRegisterForm(obj, alertblock){
    const alert = document.querySelector(alertblock)
    const select = document.querySelector(obj.select)
    const parent = document.querySelectorAll(obj.input)
   let error = 0;
    Array.prototype.forEach.call(parent, element =>{
        const value = element.querySelector('input').value
            if(select.getAttribute('confirmed') == 'false'){
                select.classList.add('_empty')
                error++
            }
            else{
                select.classList.remove('_empty')
            }

            if(value.trim() == ''){
                element.classList.add('_empty')
                error++
            }
            else{
                element.classList.remove('_empty')
            }
    })
    if(error > 0){
        alert.classList.add('AjmAWC')
    }else{
        sendRegisterForm()

        alert.classList.remove('AjmAWC')
    }
}


// //  Слушатель заглушка

document.querySelector('.loginbtn').addEventListener('click', function(){
    subRegisterForm({input: '.bj', select: 'select-tamplate'}, '.RWacdkJs')
})
