#!/bin/js
binjs_import("~lib/tui/DateInput.js");
#
#  Not really the quintisenssial date component, does not really try to deal with i18n situations.
#


var di = new tui.DateInput();

$.println("Enter a date dd.mm.yyyy");
var dte = di.readline();


$.println("the date as entered " + dte, 'green');
$.println("the date as parsed " + di.getEuroDate(), 'green');
