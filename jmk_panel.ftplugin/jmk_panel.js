/* ------------------------------------------------------------- *
 * Panel Module for FoldingText 2.0 Plugins
 * by Jamie Kowalski, github.com/jamiekowalski/foldingtext-extra
 * Reuse permitted without restriction, provided this attribution is included
 * 
 * Usage:
 * 
 * The event callback functions are passed the event object and the panel object;
 * but there is no need to capture these in your functions if they are not needed.
 * 
 * None of the options are required; define as many functions as you need.
 * 
 * Return false from a function to prevent the default behavior (e.g. closing panel
 * on return).
 * 
 * var Panel = require('./panel.js').Panel;
 * 
 * var panel = new Panel({
 *   className: 'MyPanel',
 *   placeholder: 'type some text...',
 *   onTextChange: function (event, panel) {},
 *   onBlur: function (event, panel) {},
 *   onReturn: function (event, panel) {},
 *   onEscape: function (event, panel) {},
 *   onCommand: function (event, panel) {}, // use event.which to determine which
 *                                          // key other than Command is pressed
 *   onMenuSelect: function (even, panel, value) {},
 *   spaceSelectsMenuItem: false,
 *   ignoreWhiteSpace: true,     // don't get changes in leading/trailing whitespace
 *   addToDOM: true
 * });
 *
 * ------------------------------------------------------------- */

define(function(require, exports, module) {
  'use strict';
  
  var Extensions = require('ft/core/extensions'),
    debug = false,
    getCaretCoordinates = require('./textarea-caret-position/index.js').Coordinates,
    selectionBug = {
      exists: false,
      determined: false,
      firstChar: undefined
    },
    editor;          // this variable is assigned in the 'init' function below
    
  // Panel constructor; assigned to exports.Panel below
  var p = function (opts) {
    
    var COMMAND_LEFT = 91,
      COMMAND_RIGHT = 93,
      RETURN = 13,
      ESC = 27,
      KEY_A = 65,
      KEY_Z = 90,
      KEY_SPACE = 32,
      ARROW_UP = 38,
      ARROW_DOWN = 40,
      no_op = function () {};    // no-op function to use as default
    
    // define default options
    this.options = {
      className: 'JKPanel',
      placeholder: 'enter text...',
      onTextChange: no_op,
      onBlur: no_op,
      onReturn: no_op,
      onEscape: no_op,
      onCommand: no_op,
      onMenuSelect: no_op,
      spaceSelectsMenuItem: false,
      ignoreWhiteSpace: true,
      addToDOM: true
    }
    
    // copy options from argument
    for (var op in opts) {

      if ( this.options[op] === undefined ) {
        console.log('JKPanel: \'' + op + '\' is not a valid option. Ignoring.');
      } else if ( typeof this.options[op] !== typeof opts[op] ) {
        console.log( 'JKPanel: Option \'' + op + '\' must be of type ' + 
          typeof this.options[op] + '. Reverting to default.' );
      } else {
        this.options[op] = opts[op]
      }
    }
    
    // TODO hide following properties
    this._isShown = false;    
    this._isMenuShown = false;
    this.currentValue = '';
    this.currentMenuItems = [];
    
    // add unsettable properties
    Object.defineProperty(
      this,
      'element',
      { value: document.createElement('div') }
    );
    Object.defineProperty(
      this,
      'input',
      { value: document.createElement('input') }
    );
    
    // set panel attributes
    this.element.style.display = 'none';       // don't show panel at first
    
    this.input.setAttribute('type', 'text');
    this.input.setAttribute('value', '');
    this.input.setAttribute('placeholder', this.options.placeholder);
    if (this.options.className) {
      this.element.classList.add(this.options.className);
    }
    
    this.element.insertBefore(this.input); // add the input to the panel
    
    
    // EVENTS
    
    // when editor is clicked
    this.bodyClickListener = (function (event) {
      if (debug) console.log('click triggered on body');
      
      var performDefault;
      if (this.options.onBlur && this.options.onBlur !== no_op) {
        performDefault = this.options.onBlur(event, this);
      }
      if (performDefault !== false) {     // panel's default behavior
        this.hide(true);    // close the panel, keep contents
      }

    }).bind(this);
    
    // prevent a click on the panel from closing it
    this.element.addEventListener('mousedown', (function (event) {
      event.stopPropagation();
    }).bind(this));
    
    // capture changes to input
    this.input.addEventListener('input', (function(event) {
      if (debug) console.log( 'input change event: \'' + this.input.value + '\'' );
      
	  if (! selectionBug.determined) {
		  if (this.input.value.length === 1) {
			selectionBug.firstChar = this.input.value;
		  } else if (this.input.value.length === 2) {
			if (this.input.value.charAt(0) === selectionBug.firstChar 
			  && this.input.selectionStart === 1) {
				// could give false positive in this case:
				// enter char 'a', move cursor back and enter same letter
				selectionBug.exists = true;
			}
			selectionBug.determined = true;
		  }
		}
      
      
      if (this.options.ignoreWhiteSpace) {
        if ( this.input.value.trim() === this.currentValue ) {
          if (debug) console.log( 'No change' );
          
        } else {
          if (debug) console.log( 'Text changed' );
          this.currentValue = this.input.value.trim();
    
          if (this.options.onTextChange && this.options.onTextChange !== no_op) {
            this.options.onTextChange(event, this);
          }
        }
      } else {
        if (this.options.onTextChange && this.options.onTextChange !== no_op) {
          this.options.onTextChange(event, this);
        }
      }
        
    }).bind(this));
        
    // capture keydowns (for command keys, etc.)
    this.element.addEventListener('keydown', (function(event) {
      if (debug) console.log('keydown: ' + event.which);
      
      if (event.which === RETURN) {                  // return key pressed
        
        var performDefault;
        if (this.options.onReturn && this.options.onReturn !== no_op ) {
          performDefault = this.options.onReturn(event, this);
        }
        if (performDefault !== false) {      // panel's default behavior
          this.hide(true);
          event.preventDefault();
        }
        
      } else if ( event.which === COMMAND_LEFT ) {     // command keys pressed
        this.keysDown[COMMAND_LEFT] = true;
        
      } else if ( event.which === COMMAND_RIGHT ) {
        this.keysDown[COMMAND_RIGHT] = true;
        
      } else if ( event.which === ESC ) {            // escape key pressed
        
        var performDefault;
        if ( this.options.onEscape && this.options.onEscape !== no_op ) {
          this.options.onEscape( event, this );
        }
        if ( performDefault !== false ) {        // panel's default behavior
          this.hide(false);
          event.preventDefault();
        }
        
      } else if ( this.keysDown[COMMAND_LEFT] || this.keysDown[COMMAND_RIGHT] ) {
        // Modify behavior of some command combinations
        
        var performDefault;
        if ( this.options.onCommand && this.options.onCommand !== no_op ) {
          performDefault = this.options.onCommand( event, this );
        }
        if (performDefault !== false ) {
          if ( event.which === KEY_A ) {           // Command + A
            this.input.select();
            event.preventDefault();            
          } else if ( event.which === KEY_Z ) {    // Command + Z
            event.preventDefault();
          }
        }
        
      }
    }).bind(this));
    
    // capture keyups (for command keys, etc.)
    this.input.addEventListener('keyup', (function(event) {
      if (debug) console.log('keyup: ' + event.which)
      if (debug) console.log(this.keysDown)
            
      if (event.which === COMMAND_LEFT) {          // left command key
        this.keysDown[COMMAND_LEFT] = false;
      } else if (event.which === COMMAND_RIGHT) {  // right command key
        this.keysDown[COMMAND_RIGHT] = false;
      }
      
    }).bind(this))
    
    // menu keydown events; added to element in showMenu() method
    // TODO also select item when space key is pressed?
    this.menuOpenKeyDownListener = (function(event) {
      
      if ( event.which === ARROW_UP ) {
        var active = this.menu.querySelector('li.' + this.data.menuActiveClass);
        var item = active.previousSibling;
        while (item && item.classList.contains(this.data.itemHiddenClass)) {
          item = item.previousSibling;
        }
        if (item) {
          active.classList.remove(this.data.menuActiveClass);
          item.classList.add(this.data.menuActiveClass);
        }
        event.preventDefault();
        event.stopPropagation();
        
      } else if ( event.which === ARROW_DOWN ) {
        var active = this.menu.querySelector('li.' + this.data.menuActiveClass);
        var item = active.nextSibling;
        while (item && item.classList.contains(this.data.itemHiddenClass)) {
          item = item.nextSibling;
        }
        if (item) {
          active.classList.remove(this.data.menuActiveClass);
          item.classList.add(this.data.menuActiveClass);          
        }
        event.preventDefault();
        event.stopPropagation();
        
      } else if ( event.which === RETURN || 
        (this.options.spaceSelectsMenuItem && event.which === KEY_SPACE) ) {
        var active = this.menu.querySelector('li.' + this.data.menuActiveClass);
        var value = '';
        if (active) {
          value = active.textContent;
        }

        var performDefault;
        if ( this.options.onMenuSelect && this.options.onMenuSelect !== no_op ) {
          performDefault = this.options.onMenuSelect( event, this, value );
        }
        
        if (performDefault !== false) {
          this.hideMenu();
          event.preventDefault();
          event.stopPropagation();
        }
        
      } else if ( event.which === ESC ) {
        this.hideMenu();
        event.preventDefault();
        event.stopPropagation();
      }
      
    }).bind(this);
    
    // add panel to DOM    
    if ( this.options.addToDOM ) {
      document.body.insertBefore( this.element );
    }
  }
  
  Object.defineProperty( p.prototype, 'keysDown', { value: {} } );
  
  Object.defineProperty( p.prototype, 'data', {
    value: {
      menuActiveClass: 'active',
      itemHiddenClass: 'hidden'
    }
  });
  
  p.prototype.addToDOM = function () {
    document.body.insertBefore( this.element );
  };
  p.prototype.show = function ( text, selection, selectionEnd ) {
    if ( (text && typeof text === 'string') || text === '' ) {
      this.input.value = text;
    }
    this.element.style.display = 'block';
    this.input.focus();
    
    if (! selection || selection === 'around' ) {
      this.input.select();          // select contents
    } else if ( selection === 'start' ) {
      this.input.setSelectionRange(0, 0);
    } else if ( selection === 'end' ) {
      var length = this.input.value.length
      this.input.setSelectionRange(length, length);
    } else if (typeof selection === 'number' ) {
      var end = selectionEnd || selection;
      this.input.setSelectionRange(selection, end);
    } else if ( selection === 'preserve' ) {
      // do nothing; yes, this is probably sloppy
    } else {
      this.input.select();          // select for other values
    }

    if ( this.options.ignoreWhiteSpace ) {
      this.currentValue = this.input.value.trim();
    }
    
    if (! this._isShown) { // make sure only adding listener once
      window.document.body.addEventListener('mousedown', this.bodyClickListener);
    }
    
    this._isShown = true;
  };
  p.prototype.hide = function ( keepContents ) {
    if ( ! keepContents === true ) {
      this.input.value = '';
    }
    if ( this.options.ignoreWhiteSpace ) {
      this.currentValue = this.input.value.trim();
    }
    
    window.document.body.removeEventListener('mousedown', this.bodyClickListener);
    
    this.element.style.display = 'none';
    editor.focus();
    this._isShown = false;
  };
  p.prototype.toggle = function ( keepContents, text ) {
    if ( this._isShown ) {
      this.hide( keepContents );
    } else {
      this.show( text );
    }
  };
  p.prototype.clear = function () {
    this.input.value = '';
  };
  p.prototype.value = function () {
    if ( this.options.ignoreWhiteSpace ) {
      return this.input.value.trim();
    } else {
      return this.input.value;
    }
  };
  
  p.prototype.isShown = function () {
    return this._isShown;
  }
  
  p.prototype.showMenu = function (query, items) {
    
    if (items && ! (items instanceof Array && (items[0] instanceof String || 
      typeof items[0] === 'string') )) {
      
      console.log("Items argument must be array of strings.")
      return;
    }

    // create menu if doesn't exist
    if (! this.menu) {
      Object.defineProperty(
        this,
        'menu',
        { value: document.createElement('ul') }
      );
      this.menu.style.display = 'none';
      this.menu.style.position = 'absolute';
      this.element.appendChild(this.menu);
            
      this.menu.addEventListener('mousedown', (function (event) {
        if (debug) console.log('mousedown triggered on menu');
        
        var value = event.target.textContent;

        var performDefault;
        if ( this.options.onMenuSelect /* && this.options.onMenuSelect !== no_op */ ) {
          performDefault = this.options.onMenuSelect( event, this, value );
        }
      
        if (performDefault !== false) {
          this.input.focus();
          this.hideMenu();
          event.preventDefault();
        }

      }).bind(this));
      
      this.menu.addEventListener('mouseover', (function (event) {
        if (debug) console.log(event.target);
        
        var active = this.menu.querySelector('li.' + this.data.menuActiveClass);
        
        if (event.target.parentNode && event.target.parentNode === this.menu && 
          ! event.target.classList.contains(this.data.itemHiddenClass) ) {
          // TODO assumes that parentNode of the item is the menu!
          
          if (active) {
            active.classList.remove(this.data.menuActiveClass);
          }
          event.target.classList.add(this.data.menuActiveClass);
        }
        
      }).bind(this));
      
    }
    
    // check whether items are different
    var different = false;
    if (! items) {
    	// do nothing
    } else if (items.length !== this.currentMenuItems.length) {
    	different = true;
	} else {
		for (var i = 0; i < items.length; i++) {
			if (items[i] !== this.currentMenuItems[i]) {
				different = true;
				break;
			}
		}
    }
    
    // clear and re-populate menu
    if (different) { // only if items array different
      if (debug) console.log('New set of menu items: ' + items);
      
      while (this.menu.hasChildNodes()) {
          this.menu.removeChild(this.menu.lastChild);
      }
      for (var i = 0; i < items.length; i++) {
        var li = document.createElement('li');
        li.textContent = items[i];
        this.menu.appendChild(li);
      }
      
      this.currentMenuItems = items;
    }

    var refreshMenu = (function (query) {
      var active = this.menu.querySelector('li.' + this.data.menuActiveClass);
      if (active) {
        active.classList.remove(this.data.menuActiveClass);
      }
    
      // remove and add 'hidden' class
      var li = this.menu.firstChild;
      var count = 0;
      while (li) {
        li.classList.remove(this.data.itemHiddenClass);
        if (! li.textContent.match(query) ) {
          li.classList.add(this.data.itemHiddenClass);
        } else {
          count++;
        }
        li = li.nextSibling;
      }
      
      // highlight first menu item
      li = this.menu.firstChild;
      while (li && li.classList.contains(this.data.itemHiddenClass)) {
        li = li.nextSibling;
      }
      if (li) {
        li.classList.add(this.data.menuActiveClass);
      }
      
      return count;
      
    }).bind(this);
  
    var count = refreshMenu(query);
    if (count === 0) {
      this.hideMenu();
      return;
    }
    
    // add event listeners
    if (! this._isMenuShown) { // ensure that listener is added only once
      this.input.addEventListener('keydown', this.menuOpenKeyDownListener);
    }
    
    // TODO changing menu position should be optional
    var coordinates = getCaretCoordinates(this.input, this.input.selectionEnd);
    if (! this._isMenuShown) { // don't move menu if it's already shown
      this.menu.style.left = coordinates.left + 'px';
    }
    
    this.menu.style.display = 'block';
    this._isMenuShown = true;
    
  };
  
  p.prototype.hideMenu = function () {
    if (this._isMenuShown === false) {
      return;
    }
    
    if (this.menu) {
      this.menu.style.display = 'none';
    }
    if (this.menuOpenKeyDownListener) {
      this.input.removeEventListener('keydown', this.menuOpenKeyDownListener);
    }
    
    this._isMenuShown = false;
  };
  
  p.prototype.isMenuShown = function () {
    return this._isMenuShown;
  };
  
  p.prototype.selection = function (event) {
  
    var selectionStart = this.input.selectionStart; // WARNING: doesn't support IE
    var selectionEnd = this.input.selectionEnd;

	if (event && event.type === 'input') {
	    // the bug only occurs during the 'input' event. During 'keydown' input has not 
	    // changed; during 'keyup' input has changed and selection has been updated; but
	    // during 'input', input has changed and (in Mountain Lion), selection in many
	    // cases has *not* been updated.
	  
		if (selectionBug.exists) {
		  // prior to 10.9, selectionEnd is 1 less than it should be, but only after
		  // the first character has been entered in the input. I.e. it's 1, 1, 2...
		  // if there 
		  if (! this.input.value.match(/^.?$/)) { // TODO heuristic; will not always work
			if (selectionStart !== 0) {
				selectionStart = selectionStart + 1;
			}
			if (selectionEnd !== 0) {
			  selectionEnd = selectionEnd + 1;
			}
		  }
		}
    }
    
    return [selectionStart, selectionEnd];
  }

  Extensions.add('com.foldingtext.editor.init', function( ed ) {
    editor = ed;
  });

  exports.Panel = p;
      
});
