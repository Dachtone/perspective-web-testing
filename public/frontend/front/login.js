function submitForm(){
    document.querySelector('#loginForm').submit()
}

function sendLoginForm(wrap, alertblock){
    const alert = document.querySelector(alertblock)
    const parent = document.querySelectorAll(wrap)
   let error = 0;
    Array.prototype.forEach.call(parent, element =>{
        const value = element.querySelector('input').value
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
        submitForm()

        alert.classList.remove('AjmAWC')
    }
}


// //  Слушатель заглушка

document.querySelector('.loginbtn').addEventListener('click', function(){
    sendLoginForm('.bj', '.RWacdkJs')
})
