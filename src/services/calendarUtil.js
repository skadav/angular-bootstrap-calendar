'use strict';
/*jshint loopfunc: true */
var differenceInMinutes = require('date-fns/difference_in_minutes');
var setMinutes = require('date-fns/set_minutes');
var startOfMinute = require('date-fns/start_of_minute');
var setHours = require('date-fns/set_hours');
var startOfDay = require('date-fns/start_of_day');
var endOfDay = require('date-fns/end_of_day');
var isSameSecond = require('date-fns/is_same_second');
var angular = require('angular');
var MINUTES_IN_HOUR = 60;
angular
    .module('mwl.calendar')
    .factory('calendarUtil', function() {

        function isEventIsPeriod(_a) {
            var event = _a.event, periodStart = _a.periodStart, periodEnd = _a.periodEnd;
            var eventStart = event.start;
            var eventEnd = event.end || event.start;
            if (eventStart > periodStart && eventStart < periodEnd) {
                return true;
            }
            if (eventEnd > periodStart && eventEnd < periodEnd) {
                return true;
            }
            if (eventStart < periodStart && eventEnd > periodEnd) {
                return true;
            }
            if (isSameSecond(eventStart, periodStart) || isSameSecond(eventStart, periodEnd)) {
                return true;
            }
            if (isSameSecond(eventEnd, periodStart) || isSameSecond(eventEnd, periodEnd)) {
                return true;
            }
            return false;
        }
        function getEventsInPeriod(_a) {
            var events = _a.events, periodStart = _a.periodStart, periodEnd = _a.periodEnd;
            return events.filter(function(event) {
                return isEventIsPeriod({
                    event: event, periodStart: periodStart, periodEnd: periodEnd
                });
            });
        }
        function getDayViewFork(_a) {
            var b = _a.events, events = b === void 0 ? []
            : b, viewDate = _a.viewDate,
            hourSegments = _a.hourSegments,
            dayStart = _a.dayStart,
            dayEnd = _a.dayEnd,
            segmentHeight = _a.segmentHeight;
            var left = 60;
            var startOfView = setMinutes(setHours(startOfDay(viewDate), dayStart.hour), dayStart.minute);
            var endOfView = setMinutes(setHours(startOfMinute(endOfDay(viewDate)), dayEnd.hour), dayEnd.minute);
            var previousDayEvents = [];
            var dayViewEvents = getEventsInPeriod({
                events: events.filter(function(event) {
                    return !event.allDay;
                }),
                periodStart: startOfView,
                periodEnd: endOfView
            }).sort(function(eventA, eventB) {
                return eventA.start.valueOf() - eventB.start.valueOf();
            }).map(function(event) {
                var eventStart = event.start;
                var eventEnd = event.end || eventStart;
                var startsBeforeDay = eventStart < startOfView;
                var endsAfterDay = eventEnd > endOfView;
                var hourHeightModifier = (hourSegments * segmentHeight) / MINUTES_IN_HOUR;
                var top = 0;
                var column = event.column;
                if (eventStart > startOfView) {
                    top += differenceInMinutes(eventStart, startOfView);
                }
                top *= hourHeightModifier;
                var startDate = startsBeforeDay ? startOfView : eventStart;
                var endDate = endsAfterDay ? endOfView : eventEnd;
                var height = differenceInMinutes(endDate, startDate);
                if (!event.end) {
                    height = segmentHeight;
                } else {
                    height *= hourHeightModifier;
                }
                 var bottom = top + height;
                var overlappingPreviousEvents = previousDayEvents.filter(function(previousEvent) {
                    var previousEventTop = previousEvent.top;
                    var previousColumn = previousEvent.event.column;
                    var previousEventBottom = previousEvent.top + previousEvent.height;
                    if (top < previousEventBottom && previousEventBottom < bottom && column === previousColumn) {
                        return true;
                    } else if (previousEventTop <= top && bottom <= previousEventBottom && column === previousColumn) {
                        return true;
                    } else if (top === previousEventTop && bottom === previousEventBottom && column === previousColumn) {
                        return true;
                    }
                    return false;
                });
                var value = overlappingPreviousEvents.some(function(x) {
                    return x.left === left;
                });
                if (value === true) {
                    left = left + event.width;
                } else {
                    left = 60;
                }
                var dayEvent = {
                    event: event,
                    height: height,
                    width: event.width,
                    top: top,
                    left: left,
                    startsBeforeDay: startsBeforeDay,
                    endsAfterDay: endsAfterDay
                };
                if (height > 0) {
                    previousDayEvents.push(dayEvent);
                }
                return dayEvent;
            }).filter(function(dayEvent) {
                return dayEvent.height > 0;
            });
            var width = Math.max.apply(Math, dayViewEvents.map(function(event) {
                return event.left + event.width;
            }));
            var allDayEvents = getEventsInPeriod({
                events: events.filter(function(event) {
                    return event.allDay;
                }),
                periodStart: startOfDay(startOfView),
                periodEnd: endOfDay(endOfView)
            });
            return {
                events: dayViewEvents,
                width: width,
                allDayEvents: allDayEvents
            };
        }

        return {
            getDayViewFork: getDayViewFork
        };

    });
