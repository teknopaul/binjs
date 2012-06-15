#!/bin/js

//~ is expanded to users home dir ala Bash
$.println(new File("~").getAbsolutePath());

// which is handy
$.println(new File("~/.bashrc").getAbsolutePath());

// N.B. we dont check you are bing sensible and we dont add a trailing / if you forget to!
$.println("invalid:" + new File("~.bashrc").getAbsolutePath());

// Also suppoort Bash's wierd ~+ and ~-
cd `dirname $0`
$.println("PWD=" + new File("~+").getAbsolutePath());
$.println("OLDPWD=" + new File("~-").getAbsolutePath());


