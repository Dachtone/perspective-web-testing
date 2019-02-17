function enter(){
    const button_enter = document.querySelector('[enter]')
    
    document.addEventListener('keydown', (e) => {
        if(e.keyCode == 13){
            button_enter.click()
        }else{
            return
        }
    })

}
enter()