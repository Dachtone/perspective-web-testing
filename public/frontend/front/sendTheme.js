window.onload = ()=>{
    const btn = document.querySelector('button')
    
    btn.addEventListener('click', (e)=>{
        e.preventDefault()
        collectData()
    })
}

function collectData(){
    const nameTheme = document.querySelector('input[name="theme_tittle"]')
    const level = document.querySelector('select')

    validate()
}