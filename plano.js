Events = new Mongo.Collection('events');

if (Meteor.isClient) {
	Meteor.subscribe('events');

	Template.callendar.helpers({
		options: function() {
			return {
				defaultView: 'agendaWeek',
				minTime : "06:00:00",
				maxTime : "22:00:00",
				selectable: true,
				select: function(s, e) {
					Meteor.call('addEvent', "FOO", s.toDate(), e.toDate(), 2);
					console.log(s.toDate());
					console.log(e.toDate());
				}
			};
		},
		events: function() {
			var fc = $('.fc');
			return function(start, end, tz, callback) {
				Meteor.subscribe('events', start, end, function() {
					fc.fullCalendar('refetchEvents');
				});
				cosole.log('it\' something: ', Events.find());
				var events = Events.find().map(function(it) {
					return {
						title: it.subject,
						start: it.start,
						end: it.end
					}
				});
				console.log(events);
				callback(events);
			}
		}

	});
	Template.body.rendered = function () {
		var fc = this.$('.fc');
		this.autorun(function () {
			//1) trigger event re-rendering when the collection is changed in any way
			//2) find all, because we've already subscribed to a specific range
			Events.find();
			fc.fullCalendar('refetchEvents');
		});
	};
}

if (Meteor.isServer) {

	Meteor.publish('events', function(s, e) {
		return Events.find();
	});

	Meteor.methods({
		addEvent: function(subject, start, end, recurrance) {
			console.log('add', subject);
			Events.insert({
				subject: subject,
				start: start,
				end: end,
				recurrance: recurrance
			});
		}
	});

	Meteor.startup(function () {
		// code to run on server at startup
	});
}
