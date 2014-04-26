/* ------------------------------------------------------------- *
 | Filter Plugin for FoldingText 2.0+
 | by Jamie Kowalski, github.com/jamiekowalski/foldingtext-extra
 * ------------------------------------------------------------- */

define(function(require, exports, module) {
  'use strict';
  
  var Extensions = require('ft/core/extensions'),
      NodePath = require('ft/core/nodepath').NodePath,
			Panel = require('../jmk_panel.ftplugin/jmk_panel.js').Panel,
      editor,         // this variable is assigned in the 'init' function below
      panel,
      headingType,
      prevNodePath,
      prevSelectedRange,
      tags,
      // tag regexs adapted from Jesse Grosjean's ft/taxonomy/helpers/tagshelper.js
      tagStartChars = '[A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD]',
      tagWordChars =  '[\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]',
      tagRegexString = '@((?:' + tagStartChars + '(?:' + tagStartChars + '|' + tagWordChars + ')*)?)',
      debug = false
  
  // TODO check support for quote-wrapped terms
  // TODO automatically enclose terms that don't match \w+ with quotes
  
  // insert boolean operators between tokens
  function insertOps( string, custom_default ) {
    string = string.trim()
    if (! string.match(/ /)) return string  // if no spaces, return immediately

    var protector = '=_=',  // TODO Hack!
      ops = [
          'and',
          'or'
      ],
      default_op

    if (string.match('\\b' + ops[0] + '\\b')) {
      default_op = ops[0];
    } else if (string.match('\\b' + ops[1] + '\\b')) {
      default_op = ops[1];
    } else if (custom_default) {
      default_op = custom_default;
    } else {
      default_op = ops[1];
    }
    
    // TODO to deal with quotes and parentheses, use stack-based parsing. Create a
    // regex like (\s+|["']|[()]), then push quotes and parentheses on stack; ignore
    // everything between quotes, etc.

    // protect 'not'
    string = string.replace(/\b(not)\b\s*/g, '$1' + protector);
  
    var ops_find = new RegExp('\\s*\\b(' + ops.join('|') + ')\\b\\s*', 'g');
    var ops_replace = ' ';
    var space_delim_find = /\s+/g;

    // remove existing ops
    string = string.replace(ops_find, ops_replace);
    string = string.trim();

    // insert default
    string = string.replace(space_delim_find, ' ' + default_op + ' ');
  
    // un-protect 'not'
    string = string.replace(new RegExp(protector, 'g'), ' ');

    return string.trim();
  }

  function parseSegment( input, heading_marker ) {
    var s = input.trim(),
        defaultOp = 'and',
        heading_marker_regex = new RegExp( '^' + heading_marker + '\\s*' )
  
    if ( ! s ) {
        return '';
    }
  
    // insert # before properties
    s = s.replace(/#?\b([^\s~<>=]+)\s*([~=]|[<>]=?)\s*/g, '#$1$2');
    // s = s.replace(/\(#[^\s~<>=]+[~<>=]+[^(]+/g, '$&)')

    if ( s.match( heading_marker_regex ) ) {      // heading
      s = s.replace( heading_marker_regex, '' );

      s = insertOps( s, defaultOp );

      s = '(' + s + ')';
      s += ' and @type=' + headingType;
      
      if (debug) console.log(headingType);
    } else {                                      // non-heading
      s = insertOps( s, defaultOp );
    }

    // TODO pull out property queries first
    
    // allow paths to contain "union" "intersect" "except"; by wrapping in quotes
    // TODO maybe should allow these as functions instead?
    s = s.replace(/([^'"]|^)(union|intersect|except)([^'"]|$)/, '"$2"');

    // transform inline types and properties
    s = s.replace(/#cm\b/g, '@line:comment');
    s = s.replace(/#hl\b/g, '@line:highlight');
    s = s.replace(/#de?l\b/g, '@line:del');
    s = s.replace(/#ins?\b/g, '@line:ins');
    s = s.replace(/#str?o?n?g?\b/g, '@line:strong');
    s = s.replace(/#em(ph)?\b/g, '@line:em');
    s = s.replace(/#([^\s:]+)\b/g, '@property:$1');
    s = s.replace(/(@property:[^\s:]+)~(\S+)\b/g, '$1 contains $2');
  
    return s;
  }

  function parsePath( input ) {
    var input = input.trim(),
        delim = '/',
        heading_marker = ';',
        ancestors_off = '*', // can be at start or end
        ancestors,
        descendants
  
    if (! input) {
      return input
    } else if (input.charAt(0) === '/') {
      // assume full XPath; leave it alone
      return input
    }
    
    // set ancestors option
    ancestors = true;
    if (input.charAt(0) === ancestors_off) {
      ancestors = false
      input = input.slice(1)
    }
    // allow ancestor toggle at end of input
    if (input.charAt(input.length - 1) === ancestors_off) {
      ancestors = false;
      input = input.substring(0, input.length - 1); // or input.slice(0, -1);
    }

    // set descendants option
    descendants = false;
    if (input.match(new RegExp('[' + delim + heading_marker + ']\\s*$'))) { // [:\/]\s*$
      descendants = true;
      input = input.slice(0, -1);
    }

    // place delimiter before heading marker if not there
    var heading_delim_regex = new RegExp('([^' + delim + '\\s])\\s*(' +
        heading_marker + ')', 'g')
    input = input.replace(heading_delim_regex, '$1' + delim + '$2');

    // split expression into segments
    var segments = input.split(new RegExp('\\s*' + delim + '\\s*'))
    var path = ''

    // process segments and build path
    segments.forEach(function(segment) {
      path += '//' + parseSegment(segment, heading_marker);
    });
    
    // modify path for options
    if (path.match(new RegExp(headingType + '$'))) { // last segment is a heading
                                                     // FIXME magic
      descendants = true
    }
    if (descendants) {
      path += '///*'
    }
    if (ancestors) {
      path += '/ancestor-or-self::*'
    }
  
    return path
  }
  
  function filterByPath(path) {
    if (path && ! path.match(/^ +$/)) {
        
      var parse_result = NodePath.parse(path)
      if (parse_result.errorColumn > -1) {
        console.log(path + '\n' + "Path failed at: " +
          parse_result.errorColumn)
      } else {
        if (debug) console.log(path)
        editor.setNodePath(path);
        editor.performCommand('scrollToBeginningOfDocument');
      }
    } else {
      editor.performCommand('focusOut') // TODO should only focus out if not already focused out
    }
  }
  
  function showFilterPanel( text, selection, selectionEnd ) {
    prevNodePath = editor.nodePath();
    prevSelectedRange = editor.selectedRange();
    
    tags = editor.tree().tags(true); // get tags without internal, i.e. 'name'
    
    panel.show( text, selection, selectionEnd );
  }
  
  function hideFilterPanel(panelEle, input) {
    if (prevNodePath) {
      editor.setNodePath(prevNodePath);
    }
    if (prevSelectedRange) {
      editor.setSelectedRange(prevSelectedRange)
    }
    panel.hide(false);
  }
    
	Extensions.add('com.foldingtext.editor.commands', {
		name: 'jk filter',
    performCommand: showFilterPanel
  });
  
	Extensions.add('com.foldingtext.editor.commands', {
		name: 'jk filter tag',
    performCommand: function() {
      showFilterPanel('@', 'end');
      panel.input.dispatchEvent(new CustomEvent('input')); // TODO hack
    }
  });
  
  Extensions.add('com.foldingtext.editor.init', function(ed) {
    editor = ed;             // TODO This is a hack
    if (editor.tree().taxonomy.name === 'markdown') {
      headingType = 'heading'
    } else {
      headingType = 'project'
    }
        
    panel = new Panel({
      placeholder: 'enter expression...',
      onReturn: function() {
        filterByPath(parsePath(panel.input.value));
      },
      onEscape: function() {
        hideFilterPanel();
      },
      onTextChange: function() {
        var cursorPos = panel.input.selectionEnd; // WARNING: doesn't support IE
        
        var tagMatch = panel.input.value.substring(0, cursorPos).match(new RegExp(tagRegexString + '$')); // TODO also match non-Latin
        if (tagMatch) {
          var query = new RegExp('(^|_)' + tagMatch[1]);
          panel.showMenu(query, tags); // panel automatically decides when to build
                                       // menu, and when to simply filter
          
        } else {
          panel.hideMenu(); // TODO this will almost always be pointless
          filterByPath(parsePath(panel.input.value)); 
        }
      },
      onMenuSelect: function (event, panel, value) {
        var cursorPos = panel.input.selectionEnd; // WARNING: doesn't support IE
        var start = '';

        if (value) {          
          start = panel.input.value.substring(0, cursorPos).
            replace(new RegExp(tagRegexString + '$'), '@' + value + ' ');
        } else {
          start = panel.input.value.substring(0, cursorPos) + ' ';
        }
        panel.input.value = start + panel.input.value.substring(cursorPos);
        panel.input.setSelectionRange(start.length, start.length);
        
        filterByPath(parsePath(panel.input.value));
      },
      spaceSelectsMenuItem: true,
      ignoreWhiteSpace: false
    })
    
    editor.addKeyMap({
      "Shift-Cmd-'" : showFilterPanel
      
      /* Info about keyboard shortcuts
       * from http://codemirror.net/doc/manual.html#keymaps
       * 
       * Examples of names defined here are Enter, F5, and Q. These can be 
       * prefixed with Shift-, Cmd-, Ctrl-, and Alt- (in that order!) to 
       * specify a modifier. So for example, Shift-Ctrl-Space would be a valid
       * key identifier.
       */

    })
  });
});
