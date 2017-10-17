'use strict';

var angular = require('angular');

angular
  .module('mwl.calendar')
  .controller('MwlCalendarDayReversedCtrl', function($scope, moment, calendarHelper, calendarEventTitle, $window) {

    var vm = this;
    vm.calendarEventTitle = calendarEventTitle;
    vm.leftInterval = setInterval(function() { }, 1000);

    vm.rightInterval = setInterval(function() { }, 1000);

    function refreshView() {
      vm.dayViewSplit = vm.dayViewSplit || 30;
      vm.dayViewHeight = calendarHelper.getDayViewHeight(
        vm.dayViewStart,
        vm.dayViewEnd,
        vm.dayViewSplit
      );

      var view = calendarHelper.getDayView(
        vm.events,
        vm.viewDate,
        vm.dayViewStart,
        vm.dayViewEnd,
        vm.dayViewSplit,
        vm.dayViewEventWidth
      );

      vm.allDayEvents = view.allDayEvents;
      vm.nonAllDayEvents = view.events;
      vm.viewWidth = view.width + 62;

      vm.events.forEach(function(event) {
        event.left = (moment(event.startsAt).hours() * 60 + moment(event.startsAt).minutes()) / 60;
      });
    }

    $scope.$on('calendar.refreshView', refreshView);

    $scope.$watchGroup([
      'vm.dayViewStart',
      'vm.dayViewEnd',
      'vm.dayViewSplit'
    ], refreshView);

    vm.eventDragComplete = function(event, columnChunksMoved, minuteChunksMoved) {
      var minutesDiff = Math.floor(minuteChunksMoved / vm.dayViewSplit / 3) * vm.dayViewSplit;
      if (typeof vm.columns !== 'undefined') {
        if (typeof event.column === 'undefined') {
          event.column = 0;
        }
        var newColumn = event.column + Math.round(columnChunksMoved / 2);
        if (newColumn < 0) {
          newColumn = 0;
        } else if (newColumn > vm.columns.length) {
          newColumn = vm.columns.length - 1;
        }
      }

      var newStart = moment(event.startsAt).add(minutesDiff, 'minutes');
      var newEnd = moment(event.endsAt).add(minutesDiff, 'minutes');
      delete event.tempStartsAt;
      vm.onEventTimesChanged({
        calendarEvent: event,
        calendarNewEventStart: newStart.toDate(),
        calendarNewEventEnd: event.endsAt ? newEnd.toDate() : null,
        calendarNewColumn: newColumn
      });

      clearInterval(vm.leftInterval);
      clearInterval(vm.rightInterval);
      event.left = (newStart.hours() * 60 + newStart.minutes()) * 3;
    };

    vm.eventDragged = function(event, columnChunksMoved, minuteChunksMoved) {
      var minutesDiff = Math.floor(minuteChunksMoved / vm.dayViewSplit / 3) * vm.dayViewSplit;
      event.tempStartsAt = moment(event.startsAt).add(minutesDiff, 'minutes').toDate();
      var document = typeof $window.document === 'undefined' ? '' : $window.document;
      var posx = 0;
      var e = $window.event;

      if (e.pageX || e.pageY) {
        posx = e.pageX;
      } else if (e.clientX || e.clientY) {
        posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      }

      clearInterval(vm.leftInterval);
      clearInterval(vm.rightInterval);

      var docWidth = parseInt($window.getComputedStyle(document.getElementById('calendar')).width) - 100;
      if (posx >= docWidth) {
        vm.leftInterval = setInterval(
          function() {
            document.getElementById('calendar').scrollLeft = document.getElementById('calendar').scrollLeft + 5;
          }, 20);
      } else if (posx <= 100) {
        vm.rightInterval = setInterval(
          function() {
            document.getElementById('calendar').scrollLeft = document.getElementById('calendar').scrollLeft - 5;
          }, 20);
      }
    };

    vm.eventResizeComplete = function(event, edge, minuteChunksMoved) {
      var minutesDiff = minuteChunksMoved * vm.dayViewSplit;
      var start = moment(event.startsAt);
      var end = moment(event.endsAt);
      if (edge === 'start') {
        start.add(minutesDiff, 'minutes');
      } else {
        end.add(minutesDiff, 'minutes');
      }
      delete event.tempStartsAt;

      vm.onEventTimesChanged({
        calendarEvent: event,
        calendarNewEventStart: start.toDate(),
        calendarNewEventEnd: end.toDate()
      });
    };

    vm.eventResized = function(event, edge, minuteChunksMoved) {
      var minutesDiff = minuteChunksMoved * vm.dayViewSplit;
      if (edge === 'start') {
        event.tempStartsAt = moment(event.startsAt).add(minutesDiff, 'minutes').toDate();
      }
    };

  })
  .directive('mwlCalendarDayReversed', function() {

    return {
      template: '<div mwl-dynamic-directive-template name="calendarDayViewReversed" overrides="vm.customTemplateUrls"></div>',
      restrict: 'E',
      require: '^mwlCalendar',
      scope: {
        events: '=',
        columns: '=',
        viewDate: '=',
        onEventClick: '=',
        onEventTimesChanged: '=',
        onTimespanClick: '=',
        onDateRangeSelect: '=',
        dayViewStart: '=',
        dayViewEnd: '=',
        dayViewSplit: '=',
        dayViewEventChunkSize: '=',
        dayViewEventWidth: '=',
        customTemplateUrls: '=?',
        cellModifier: '=',
        templateScope: '='
      },
      controller: 'MwlCalendarDayReversedCtrl as vm',
      bindToController: true
    };

  });
