#!/bin/bash
#
#  Clean build artifacts v8 make about a Gig of obejcts!
#

cd `dirname $0`

v8/clean.sh
bash-4.2/clean.sh
binjs/clean.sh

