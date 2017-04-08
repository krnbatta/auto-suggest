import Ember from 'ember';
import DS from 'ember-data';

var autoSuggestInput = Ember.TextField.extend({
  placeholder: 'Type for Suggestions',
  keysToReact: [],
  classNames: ['auto-suggest-input'],
  keys: {
    UP: 38,
    DOWN: 40,
    TAB: 9,
    ENTER: 13,
    ESC: 27
  },
  init: function() {
    this._super.apply(this, arguments);
    this.set("keysToReact", [this.keys.UP, this.keys.DOWN, this.keys.TAB, this.keys.ENTER, this.keys.ESC]);
  },
  keyDown: function(e) {
    var keyCode;
    keyCode = e.keyCode;
    if (!this.get("keysToReact").contains(keyCode)) {
      return;
    }
    switch (keyCode) {
      case this.keys.UP:
        this.sendAction("moveSelection", "up");
        break;
      case this.keys.DOWN:
        this.sendAction("moveSelection", "down");
        break;
      case this.keys.ENTER:
        this.sendAction("selectActive");
        break;
      case this.keys.ESC:
        this.sendAction("hideMenu");
        break;
      case this.keys.TAB:
        return true;
      default:
        console.log(keyCode);
    }
    return false;
  },
  focusOut: function(e) {
    var self;
    self = this;
    Ember.run.later((function() {
      self.sendAction("hideMenu");
    }), 200);
  }
});
