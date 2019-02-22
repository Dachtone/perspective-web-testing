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
        sendAjax(collectInputDataRegister())

        alert.classList.remove('AjmAWC')
    }
}
function collectInputDataRegister(){
    const input = document.querySelectorAll('[_data]')
    let data = {}
    
    Array.prototype.forEach.call(input, item =>{
        const attr = item.getAttribute('name')
        data[attr] = item.tagName == 'INPUT' ? item.value : item.getAttribute('value')
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
            receivtData(JSON.parse(xhr.responseText))
        }
    }
}
function receivtData(data){
    const alert = document.querySelector('.msh')

    !data.success ? alert.textContent = data.error : window.location.replace('/?action=registered')
}
// //  Слушатель заглушка

document.querySelector('.loginbtn').addEventListener('click', function(){
 subRegisterForm({input: '.bj', select: 'select-tamplate'}, '.RWacdkJs')
})
