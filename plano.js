Events = new Mongo.Collection('events');

var highlight_subject = '';

if (Meteor.isClient) {
	Meteor.subscribe('events');

	Template.body.helpers({
		options: function() {
			return {
				defaultView: 'agendaWeek',
				minTime : "06:00:00",
				maxTime : "22:00:00",
				selectable: true,
				editable: true,
				select: function(s, e) {
					Meteor.call('addEvent', "FOO", s.toISOString(), e.toISOString(), 2);
					console.log(s.toDate());
					console.log(e.toDate());
				},
				events: function(start, end, tz, callback) {
					var events = Events.find().map(function(it) {
						return {
							id: it._id,
							title: it.subject,
							start: it.start,
							end: it.end,
							dow: it.dow
						}
					});
					console.log(events);
					callback(events);
				},
				eventClick: function(event, jsEvent, view) {
					if(jsEvent.ctrlKey) {
						console.log("remove: ", event);
						Meteor.call('removeEvent', event.id);
					} else {
							var input = $('<input>', {
								value: event.title,
								style: 'position: absolute; left: ' + jsEvent.pageX + 'px; top: ' +jsEvent.pageY + 'px; z-index: 10;'
							}).keyup(function() {
								console.log($(this).val());
								event.title = $(this).val();
								$('.fc').fullCalendar('updateEvent', event);
							}).blur(function() {
								Meteor.call('renameEvent', event.id, event.title);
								$(this).remove();
							}).appendTo($('body'));

							var val = input.val();
							input.val(val);
					}
				},
				eventMouseover: function(event, jsEvent, view) {
					highlight_subject = event.title;
					console.log(event);
				},
				eventDrop: function(event, _, revertFunc) {
					Meteor.call('updateEvent', event.id, event.start.toISOString(), event.end.toISOString());
				},
				eventResize: function(event, _, revertFunc) {
					Meteor.call('updateEvent', event.id, event.start.toISOString(), event.end.toISOString());
				}
			};
		},
			/*
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
		*/
	});

	Template.body.rendered = function () {
		var fc = this.$('.fc');
		this.autorun(function () {
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
			console.log('add', subject, start, end);
			Events.insert({
				subject: subject,
				start: start,
				end: end,
				recurrance: recurrance
			});
		},
		removeEvent: function(eid) {
			console.log('remove ', eid);
			Events.remove(eid);
		},
		updateEvent: function(eid, start, end) {
			console.log(eid);
			Events.update(eid, {
				$set: { 
					start : start, 
					end : end 
				}
			});
		},
		renameEvent: function(eid, name) {
			Events.update(eid, {
				$set: { 
					subject : name 
				}
			});
		}
	});
}
