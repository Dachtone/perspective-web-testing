import {rippleEffect} from './js_modules/rippleEffect.js'
const ripple = new rippleEffect('[ripple]')

const send = document.querySelector('.sendTestResult button')
if (send !== null) {
    send.addEventListener('click', (e)=>{
        e.preventDefault()
        
        sendTest(collect(), window.location.pathname.match(/[0-9]+/g)[0])
    })
}

function collect(){
    let data = []

    const answer = Array.from(document.querySelectorAll('.task'))
    answer.forEach( item => {
        const input = item.querySelector('[name="inputResult"').value
        data.push({
            id: item.getAttribute('id').match(/[0-9]+/g)[0],
            answer: input,
            filled: input.trim() == '' ? false : true
        })
    })

    return data
}

function sendTest(data, location){
    const http = new XMLHttpRequest()

    http.open('POST', "/send_test/" + location, true)
    http.setRequestHeader("Content-Type", "application/json")
    http.send(JSON.stringify({'data': data}))

    http.onreadystatechange = ()=> {
        if (http.readyState == 4 && http.status == 200) {
            var json = JSON.parse(xhr.responseText);
            if (json.success)
                window.location.replace("?completed=true");
            /*
            else
                // Вывод ошибки json.error; 
            */
        }
    }
}