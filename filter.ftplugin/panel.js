define(function(require, exports, module) {
  'use strict';
  
	var Extensions = require('ft/core/extensions'),
    editor,          // this variable is assigned in the 'init' function below
    panelEle,
    input,
    panelShown = false,
    debug = false,
    keysDown = {},
    currentValue = '',
    COMMAND_LEFT = 91,
    COMMAND_RIGHT = 93,
    ESC = 27,
    KEY_A = 65,
    KEY_Z = 90
        
    
  window.JKPanel = {}     // TODO Should not create global variable;
                          // rather pass the variable back from the require function
  var p = window.JKPanel
  
  // TODO change this to the constructor of a JKPanel class
  p.addPanel = function(properties) {
    panelEle = document.createElement('form')
    panelEle.className = 'JKPanel'
    panelEle.style.display = 'none'
    input = document.createElement('input')
    input.setAttribute('type', 'text')
    input.setAttribute('value', '')
    if (properties.placeholder) {
      input.setAttribute('placeholder', properties.placeholder)
    }
    if (properties.className) {
      panelEle.classList.add(properties.className)
    }
    
    panelEle.insertBefore(input)
    
    input.addEventListener('blur', function(event) {
      p.hidePanel(true);
    })
    panelEle.addEventListener('submit', function(event) {
      properties.onreturn(panelEle, input);
      input.dispatchEvent(new CustomEvent('blur'))
      event.preventDefault() // don't submit form
    })
    input.addEventListener('keyup', function(event) {
      if (debug) console.log(event.which)
      if (debug) console.log(keysDown)
      
      if (event.which === COMMAND_LEFT) {          // left command key
        keysDown[COMMAND_LEFT] = false;
      } else if (event.which === COMMAND_RIGHT) {  // right command key
        keysDown[COMMAND_RIGHT] = false;
      } else if (event.which === ESC) {            // escape key
        properties.onescape(panelEle, input);
        return;
      }
      if (input.value.trim() === currentValue) {
        if (debug) console.log('No change');
        return;
      }
      currentValue = input.value.trim()
      
      properties.onchange(panelEle, input)
    })
    
    // capture paste from menu bar, etc.
    input.addEventListener('input', function(event) {
      input.dispatchEvent(new CustomEvent('keyup'))
    });
    
    input.addEventListener('keydown', function(event) {
      if (event.which === COMMAND_LEFT) {
        keysDown[COMMAND_LEFT] = true;
      } else if ( event.which === COMMAND_RIGHT ) {
        keysDown[COMMAND_RIGHT] = true;
      } else if ( event.which === ESC ) {
        event.preventDefault()
      }
      
      // Modify behavior of some command combinations
      if (keysDown[COMMAND_LEFT] || keysDown[COMMAND_RIGHT]) {
        if ( event.which === KEY_A ) {
          input.select()
          event.preventDefault()
        } else if ( event.which === KEY_Z ) {
          event.preventDefault()
        }
      }
    });
    
    document.body.insertBefore(panelEle)
  }

  p.showPanel = function () {
    panelEle.style.display = 'block'
    input.select()  // select contents, and focus
    currentValue = input.value
    panelShown = true;
  };
  p.hidePanel = function (keepContents) {
    if (! keepContents) {
      input.value = ''
    }
    currentValue = input.value
    panelEle.style.display = 'none'
    editor.focus()
    panelShown = false;
  };
  p.togglePanel = function () {
    if (panelShown) {
      p.hidePanel()                
    } else {
      p.showPanel()
    }
  };
  p.clearPanel = function () {
    input.value = '';
  }

  Extensions.add('com.foldingtext.editor.init', function(ed) {
    editor = ed;    // TODO This is a hack
                    // code should be restructured to avoid global objects
  });
    
});