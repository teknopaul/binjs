/**
 * libpreparser.h
 * @author teknopaul
 */ 
#ifndef LIBPREPARSER_H
#define LIBPREPARSER_H

#include <glib.h>

/**
 * Contains info about the state of the currently parsing document
 */
struct binjs_parsed_doc {

	int err;
	char *warning;
	char *error;
	int err_line_no;
	int line_count;
	int is_bash_continue;
	int in_js_comment;
	GHashTable* vars;

};

/**
 * preparse a /bin/js script and convert it to pure JavaScript
 */
int binjs_preparse(int in, int out, struct binjs_parsed_doc *doc);


#endif // LIBPREPARSER_H
