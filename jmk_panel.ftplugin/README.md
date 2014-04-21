# Panel Module for FoldingText 2.0 Plugins

By [Jamie Kowalski](github.com/jamiekowalski/foldingtext-extra)

## Constructor

The event callback functions are passed the event object and the panel object;
but there is no need to capture these in your functions if they are not needed.

None of the options are required; define as many as you need.

Return false from a function to prevent the default behavior (e.g. closing panel
on return).

```javascript
var Panel = require('./jmk_panel.js').Panel; // Note .Panel at end

var panel = new Panel({
  className: 'MyPanel',
  placeholder: 'type some text...',
  onTextChange: function (event, panel) {},
  onBlur: function (event, panel) {},
  onReturn: function (event, panel) {},
  onEscape: function (event, panel) {},
  onCommand: function (event, panel) {},
  ignoreWhiteSpace: true,
  addToDOM: true
});
```

`onTextChange` — called when the contents of the panel is changed.

`onBlur` — called when the panel’s text input is unfocused (e.g. by clicking outside the panel).

`onReturn` — called when the return or enter key is pressed. By default simply calls `onBlur`.

`onEscape` — called when escape key is pressed.

`onCommand` — called when a Command + key combination is pressed. Use `event.which` to determine which key is pressed.

`ignoreWhiteSpace` — don’t call `onTextChange` when leading or trailing whitespace changes; also trims return value for `panel.value()`.

`addToDOM` — add the panel to the DOM upon creation. Otherwise use the method `panel.addToDOM()`.

## Properties

panel.element — the panel’s containing element.

panel.input — the text `<input>` element of the panel.

## Methods

`panel.addToDOM()` — add panel to DOM (if you did not have it added upon creation)

`panel.show([string] text, [text or num] selection, [num] selectionEnd)` — show the panel, with optional text. Use `false` to retain previous contents (default); an empty string clears the panel. Optionally specify how the text should be selected:

- 'start'
- 'end'
- 'around' (default)
- 'preserve' (leave selection as it was before panel was closed)
- one number: specify cursor index
- two numbers (second and third arguments) specify selection range

`panel.hide([bool] keepContents)` — hide the panel, optionally specifying whether to keep the contents (defaults to false).

`panel.toggle([bool] keepContents, [string] text)` — toggle the panel; boolean to determine keeping of contents when hiding; text to display in panel when showing.

`panel.clear()` — clear the contents of the panel.

`panel.value()` — get the contents of the text input. Unless `ignoreWhiteSpace` in the constructor is set to `false`, leading/trailing white space of the value will be trimmed.
