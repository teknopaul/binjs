#!/bin/js
#
# Logging ins scripts hsould be easy to read for humans computers
#

$.error(1234, "oops on channel 23");
$.error(0, null, "Just a message please");

$.warn(4444, "you ought not to do that kingd of thing");

$.info(12, "some good news for once!");

$.info(12, null, "Use the third parameter for no underscored tags");

$.warn(4444, null, "If you dont have the underscores version you wont get i18n benefits");


