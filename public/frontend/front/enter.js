function enter(){
    const button_enter = document.querySelector('[enter]')
    document.addEventListener('keydown', (e) => {
            if(e.keyCode == 13){
                if(button_enter.getAttribute('data-focused') == "false" || button_enter.getAttribute('data-focused') == null){
                    button_enter.click()                    
                }
            }else{
                return
            }
    })
}
enter()