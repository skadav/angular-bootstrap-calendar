angular
  .module('mwl.calendar.docs')
  .controller('OtoleapCtrl', function (moment, alert, calendarConfig) {

    var vm = this;
    vm.reversed = true;
    vm.startTime = "07:00";
    vm.endTime = "09:00";
    //Event Items
    vm.events = [
      {
        title: 'Service 1',
        color: calendarConfig.colorTypes.warning,
        startsAt: moment(moment().startOf('month').toDate()).add(7, 'hour'),
        endsAt: moment(moment().startOf('month').toDate()).add(11, 'hour'),
        draggable: true,
        column: 1,
        actions: [{
          label: '<i class=\'glyphicon glyphicon-pencil\'></i>',
          onClick: function (args) {
            alert.show('Edited', args.calendarEvent);
          }
        }, {
          label: '<i class=\'glyphicon glyphicon-remove\'></i>',
          onClick: function (args) {
            alert.show('Deleted', args.calendarEvent);
          }
        }]
      },
      {
        title: 'Service 2',
        code: 'Service Code',
        color: calendarConfig.colorTypes.info,
        startsAt: moment(moment().startOf('month').toDate()).add(8, 'hour'),
        endsAt: moment(moment().startOf('month').toDate()).add(10, 'hour'),
        draggable: true,
        column: 0,
      }
    ];

    vm.columns = [1, 2, 3, 4, 5];
    vm.calendarView = 'day';
    vm.viewDate = moment().startOf('month').toDate();
    vm.cellIsOpen = true;

    vm.eventTimesChanged = function (vm, event) {
      vm.column = event;
    };

    vm.timespanClicked = function (date, cell) {

      if (vm.calendarView === 'month') {
        if ((vm.cellIsOpen && moment(date).startOf('day').isSame(moment(vm.viewDate).startOf('day'))) || cell.events.length === 0 || !cell.inMonth) {
          vm.cellIsOpen = false;
        } else {
          vm.cellIsOpen = true;
          vm.viewDate = date;
        }
      } else if (vm.calendarView === 'year') {
        if ((vm.cellIsOpen && moment(date).startOf('month').isSame(moment(vm.viewDate).startOf('month'))) || cell.events.length === 0) {
          vm.cellIsOpen = false;
        } else {
          vm.cellIsOpen = true;
          vm.viewDate = date;
        }
      }

    };

  });
