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
function collectInputDataRegister(){
    const input = document.querySelectorAll('[_data]')
    let data = {}
    Array.prototype.forEach.call(input, item =>{
        const attr = item.getAttribute('name')
        // data[attr] = encodeURIComponent(item.value)
        data[attr] = item.value
    })
    
    return JSON.stringify(data)
}
function sendAjax(value){
    const xhr = new XMLHttpRequest()

    xhr.open("POST", '/register')
    xhr.setRequestHeader("Content-Type", "application/json")
    xhr.send(value)

    xhr.onreadystatechange = ()=>{
        if(xhr.readyState === 4 && xhr.status === 200){
            console.log(xhr.responseText)
        }
    }
}

// кликни на ДОБРО ПОЖАЛОВАТЬ, КОГДА ДАННЫЕ БУДУТ ВВЕДЕНЫ
document.querySelector('.ttle_fr').addEventListener('click', function(){
    console.log( sendAjax(collectInputDataRegister()) )
})

// //  Слушатель заглушка

// ПОКА ТЕСТИМ. НИЖНЯЯ НЕ РАБОТАЕТ 
// document.querySelector('.loginbtn').addEventListener('click', function(){
//     subRegisterForm({input: '.bj', select: 'select-tamplate'}, '.RWacdkJs')
// })
