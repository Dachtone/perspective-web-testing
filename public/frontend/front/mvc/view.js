
export class View{
    constructor(){
        this.menu_btn = document.querySelector('.slyxFdN')
        this.menu = document.querySelector('ui-menu-layout')
        this.overlay = document.querySelector('ui-overlay')
        this.Window = document.querySelector('modal-template')

        this.cancel = Array.from(document.querySelectorAll('[terminate]'))

        this._listeners()

    }
    _openWindow(){
        this.Window.removeAttribute('hidden')
    }
    _closeWindow(){
        this.Window.setAttribute('hidden', '')
    }
    _closeoverlay(){
        this.overlay.setAttribute('hidden', '')
    }
    _openoverlay(){
        this.overlay.removeAttribute('hidden')
    }
    _openmenu(){
        this.menu.removeAttribute('hidden')
    }
    _closemenu(){
        this.menu.setAttribute('hidden', '')
    }
    main_openWindow(){
        this._openWindow()
        this._openoverlay()
    }
    main_OpenMenu(){
        this._openmenu()
        this._openoverlay()
    }
    main_Close(){
        this._closeWindow()
        this._closemenu()
        this._closeoverlay()
    }

    _menu_switcher(){
        if(this.Window.getAttribute('hidden') !== null){
            if(this.menu.getAttribute('ctrl-state') == 'false'){
                this.menu.setAttribute('ctrl-state', 'true')
    
                this._openmenu()
                this._openoverlay()
            }else if(this.menu.getAttribute('ctrl-state') == 'true'){
                this.menu.setAttribute('ctrl-state', 'false')
    
                this.main_Close()
            }
        }
        else{
            this.main_Close()            
        }

    }
    windowContent(value, msg, bool, method){
        const form = this.Window.querySelector('.modal-ent form')
        const ttle = this.Window.querySelector('.modal-notific')
        const button = this.Window.querySelector('.modal-ent form button')
        if(bool === true){
            this._closemenu()
            button.textContent = 'Выйти'
        }else{
            button.textContent = 'Удалить'
        }
        
        ttle.innerHTML = msg
        form.setAttribute('action', value)
        form.setAttribute('method', method)
        this.main_openWindow()
    }
    _listeners(){
        const cancelButton = this.Window.querySelector('.modal-esc button')

       cancelButton.addEventListener('click',()=> { 
           this.main_Close()
           this.menu.setAttribute('ctrl-state', 'false')
        })
       this.cancel.forEach(item =>{
            item.addEventListener('click', (e)=>{
                const attr = item.getAttribute('context')
                const context_ttle = item.getAttribute('context-out')
                
                switch(context_ttle){
                    case '0':
                        this.windowContent(attr, `Вы уверены что хотите выйти?`, true, 'POST');
                        break;
                    case '1': 
                        this.windowContent(attr, `Вы действительно хотите удалить тест?`, false, 'POST');
                        break;
                    case '2':
                        this.windowContent(attr, `Вы действительно хотите удалить тему?`, false, 'POST');
                        break;
                    case '3':
                        this.windowContent(attr, `Вы действительно хотите удалить пользователя?`, false, 'POST');
                        break;
                }
            })
       })
       this.menu_btn.addEventListener('click', () =>{ this.main_OpenMenu()})
       this.overlay.addEventListener('mousedown', () =>{ this.main_Close()})
       document.addEventListener('keyup', (e)=>{
           e.keyCode == 27 ? this._menu_switcher() : 0
       })
    }
}
