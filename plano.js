Events = new Mongo.Collection('events');

if (Meteor.isClient) {

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
		}
	});
}

if (Meteor.isServer) {

	Meteor.publish('events', function(s, e) {
		return Events.find();
	});

	Meteor.methods({
		addEvent: function(subject, start, end, recurrance) {
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