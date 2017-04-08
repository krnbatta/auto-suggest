import Ember from 'ember';
import layout from '../templates/components/auto-suggest';
import DS from 'ember-data';

export default Ember.Component.extend({
  layout: layout,
  input_value: Ember.computed.reads('selection.name'),
  query: '',
  selection: null,
  prompt: Ember.Object.create({
    name: 'Select None',
    isPrompt: true
  }),
  maxResults: 10,
  showSuggestions: false,
  minChars: 2,
  idleTypeTime: 500,
  classNames: ["auto-suggest"],
  selectionIndex: -1,
  suggestionPartial: null,
  dataProvider: null,
  init: function() {
    this._super.apply(this, arguments);
    Ember.assert('dataProvider must be provided', this.get('dataProvider'));
    return Ember.assert('dataProvider must have searchForQuery method', 'function' === typeof this.get('dataProvider.searchForQuery'));
  },
  showLoading: Ember.computed('suggestions.isSettled', function() {
    var lengthShortage;
    lengthShortage = this.get('input_value.length') < this.get('minChars');
    return this.get('suggestions') && !this.get('suggestions.isSettled') && !lengthShortage;
  }),
  suggestions: Ember.computed('query', function() {
    var promise, self;
    self = this;
    if (this.get('query.length') >= this.get('minChars')) {
      promise = new Ember.RSVP.Promise(function(resolve, reject) {
        return self.queryResponse(self.get('query')).then(function(arr) {
          var new_arr = Ember.A(arr.slice(0, self.get('maxResults')));
          new_arr.pushObject(self.get('prompt'));
          return resolve(new_arr);
        }, function() {
          return reject.apply(this, arguments);
        });
      });
      return DS.PromiseArray.create({
        'promise': promise
      });
    } else {
      return [];
    }
  }),
  noResultMessage: Ember.computed('query.length', function() {
    if (this.get('query.length') >= this.get('minChars')) {
      return 'No Results';
    } else {
      return "Minimum " + (this.get('minChars')) + " Characters required";
    }
  }),
  queryObs: Ember.observer('query', function() {
    return this.set('showSuggestions', this.get('query.length') >= this.get('minChars'));
  }),
  inputValueDidChange: Ember.observer('input_value', function() {
    if (this.get('input_value') === this.get('selection.name')) {
      return;
    }
    return Ember.run.debounce(this, this.querySetter, this.get('idleTypeTime'));
  }),
  querySetter: function() {
    return this.set('query', this.get('input_value'));
  },
  queryResponse: function(query) {
    if ('function' === typeof this.get('dataProvider.searchForQuery')) {
      return this.get('dataProvider').searchForQuery(query);
    } else {
      return [];
    }
  },
  positionResults: function() {
    var el, input, position, suggestions, width;
    input = this.$("input.auto-suggest-input");
    suggestions = this.$("ul.suggestions");
    el = this.$();
    position = el.position();
    suggestions.css("position", "fixed");
    suggestions.css("left", position.left);
    suggestions.css("top", position.top + this.$().height());
    width = el.outerWidth();
    suggestions.css("width", width);
  },
  actions: {
    moveSelection: function(direction) {
      var active, index, isDown, isUp, length, suggestions;
      this.set('showSuggestions', true);
      index = this.get("selectionIndex");
      isUp = direction === "up";
      isDown = !isUp;
      suggestions = this.get("suggestions");
      length = suggestions.get("length");
      suggestions.setEach("active", false);
      if (!length) {
        this.set("selectionIndex", -1);
        return;
      }
      if (isUp && index <= 0) {
        index = 0;
      } else if (isDown && index === length - 1) {
        index = length - 1;
      } else if (isDown) {
        index++;
      } else {
        index--;
      }
      active = this.get("suggestions").objectAt(index);
      this.set("selectionIndex", index);
      Ember.set(active, "active", true);
    },
    hideMenu: function() {
      this.set('showSuggestions', false);
      this.set("selectionIndex", -1);
    },
    selectActive: function(active) {
      var self, si;
      if (!this.get("suggestions.length")) {
        return false;
      }
      si = this.get('selectionIndex');
      if (si > -1 && !active) {
        active = this.get("suggestions").objectAt(si);
      }
      if (active === this.get('prompt')) {
        this.set('selection', null);
      } else {
        this.set('selection', active);
      }
      if (active) {
        this.set('input_value', this.get('selection.name'));
      }
      self = this;
      Ember.run.next(function() {
        return self.send("hideMenu");
      });
      return false;
    }
  }
});
