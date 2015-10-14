Events = new Mongo.Collection('events');

var highlight_subject = '';
clicked_event = false;

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
					Meteor.call('addEvent', "FOO", s.format('HH:mm'), e.format('HH:mm'), s.day());
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
							dow: ''+ it.dow,
							className: it.type + ' ' + it.subject
						}
					});
					callback(events);
				},
				eventClick: function(event, jsEvent, view) {
					if(jsEvent.ctrlKey) {
						Meteor.call('removeEvent', event.id);
					} else {
						if($(jsEvent.target).is(':input'))
							return $(jsEvent.target).focus();

						console.log(jsEvent);
						if(clicked_event) {
							if(clicked_event === event) {
								var new_data_array = $('input.edit_event').serializeArray();
								var new_data = {};
								$.each(new_data_array, function(_, e) {
									new_data[e.name] = e.value;
								});

								Meteor.call('renameEvent', clicked_event.id, new_data.subject);
								Meteor.call('updateEvent', clicked_event.id, new_data.start, new_data.end, clicked_event.start.day());
								clicked_event = false;
							} else {
								clicked_event = event;
							}
						} else {
							clicked_event = event;
						}
							
						$('.fc').fullCalendar('updateEvent', event);
					}
				},
				eventMouseover: function(event, jsEvent, view) {
					$('.fc-event').not('.'+event.title).addClass('greyed_out');
					//$('.fc').fullCalendar('updateEvent', event);
					highlight_subject = event.title;
				},
				eventMouseout: function(event, jsEvent, view) {
					$('.fc-event.greyed_out').removeClass('greyed_out');

				},
				eventDrop: function(event, _, revertFunc) {
					Meteor.call('updateEvent', event.id, event.start.format('HH:mm'), event.end.format('HH:mm'), event.start.day());
				},
				eventResize: function(event, _, revertFunc) {
					Meteor.call('updateEvent', event.id, event.start.format('HH:mm'), event.end.format('HH:mm', event.start.day()));
					//Meteor.call('updateEvent', event.id, event.start.toISOString(), event.end.toISOString());
				},
				eventRender: function(event, element) {
					if(clicked_event === event) {
						//console.log(event);
						element.find('.fc-title').html(
								$('<input>', {
									value: event.title,
									name: 'subject',
									class: 'edit_event'
								})
							);
						element.find('.fc-time').html(
								$('<input>', {
									value: moment(event.start).format('HH:mm'),
									style: "width: 5em;",
									name: 'start',
									class: 'edit_event'
								}).add( $('<input>', {
									value: moment(event.end).format('HH:mm'),
									style: "width: 5em;",
									name: 'end',
									class: 'edit_event'
								}))
							);
						//$('.fc').fullCalendar('render');
					}
				}
			};
		},
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
		addEvent: function(subject, start, end, dow, recurrance) {
			console.log('add', subject, start, end);
			Events.insert({
				subject: subject,
				start: start,
				end: end,
				dow: dow,
				recurrance: recurrance
			});
		},
		removeEvent: function(eid) {
			console.log('remove ', eid);
			Events.remove(eid);
		},
		updateEvent: function(eid, start, end, dow) {
			console.log('update', eid);
			Events.update(eid, {
				$set: { 
					start: start, 
					end: end,
					dow: dow
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
