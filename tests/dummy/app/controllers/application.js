import Ember from 'ember';

export default Ember.Controller.extend({
  tags: Ember.A([
    Ember.Object.create({id: 1, name: "Bob Hoskins"}),
    Ember.Object.create({id: 2, name: "Michael Collins"}),
    Ember.Object.create({id: 3, name: "Paul Cowan"}),
    Ember.Object.create({id: 4, name: "Evil Knievel"}),
  ]),
  searchForQuery: function(query){
    var regExp = new RegExp("^" + query, "i");
    var that = this;
    return new Ember.RSVP.Promise(function(resolve, reject){
			resolve(that.get('tags'));
		}).then(function(tags){
			return tags.filter(function(tag){
				return regExp.test(tag.get('name'));
			});
		});
  }
});
