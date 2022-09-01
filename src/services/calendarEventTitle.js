'use strict';

var angular = require('angular');

angular
  .module('mwl.calendar')
  .factory('calendarEventTitle', function(calendarDateFilter, calendarTruncateEventTitleFilter) {

    function yearView(event) {
      if (event.showTime !== undefined && !event.showTime) {
        return event.title + ' (' + calendarDateFilter(event.startsAt, 'date', true) + ' - ' + calendarDateFilter(event.endsAt, 'date', true) + ')';
      } else {
        return event.title + ' (' + calendarDateFilter(event.startsAt, 'datetime', true) + ' - ' + calendarDateFilter(event.endsAt, 'datetime', true) + ')';
      }
    }

    function monthView(event) {
      if (event.showTime !== undefined && !event.showTime) {
        return event.title;
      } else {
        return event.title + ' (' + calendarDateFilter(event.startsAt, 'time', true) + ' - ' + calendarDateFilter(event.endsAt, 'time', true) + ')';
      }
    }

    function monthViewTooltip(event) {
      return calendarDateFilter(event.startsAt, 'time', true) + ' - ' + event.title;
    }

    function weekView(event) {
      return event.title;
    }

    function weekViewTooltip(event) {
      return event.title;
    }

    function dayView(event) {
      return event.allDay ? event.title : calendarTruncateEventTitleFilter(event.title, 20, event.height);
    }

    function dayViewTooltip(event) {
      return event.tooltip;
    }

    return {
      yearView: yearView,
      monthView: monthView,
      monthViewTooltip: monthViewTooltip,
      weekView: weekView,
      weekViewTooltip: weekViewTooltip,
      dayView: dayView,
      dayViewTooltip: dayViewTooltip
    };

  });
