window.onload = ()=>{
    const btn = document.querySelector('button')
    
    btn.addEventListener('click', (e)=>{
        e.preventDefault()
        getData()
    })
}
function showError(value){
    const error = document.querySelector('.error')
    const element = error.querySelector('.error-ttle')
    
    error.setAttribute('error-reject', '')
    element.textContent = value
}
function hideError(){
    const error = document.querySelector('.error')
    const element = error.querySelector('.error-ttle')
    
    error.removeAttribute('error-reject')
    element.textContent = ''
}
function getData(){
    const theme = document.querySelector('input[name="theme_tittle"]').value.trim()
    const lesson = document.querySelector('input[name="lesson_tittle"]').value.trim()
    const select = document.querySelector('.fz_tamplate')
    let error = false
    let data

    if(theme == '' || lesson == '' || select.getAttribute('confirmed') == 'false'){
        error = false

        showError('Заполните все поля')
    }else{
        error = true

        const data = `inputTitle=${theme}&inputSubject=${lesson}&inputSemester=${select.querySelector('select').value}`
        AjaxSend(data)
        hideError()
    }

    
}

function AjaxSend(value){
    const xhr = new XMLHttpRequest()
    xhr.open('POST','/create_topic')
    xhr.send(encodeURIComponent(value))

    xhr.onreadystatechange = ()=>{
        if(xhr.readyState === 4 && xhr.status === 200){
            console.log(xhr.responseText)
       }
    }
}