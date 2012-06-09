/**
 * libpreparser.c takes a /bin/js file on the input stream and writes a JavaScript file to the output
 * stream.
 *
 * @author teknopaul
 */ 
#include <ctype.h>
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>

#include <sys/types.h>
#include <sys/stat.h>
#include <unistd.h>
#include <fcntl.h>

#include <glib.h>


#include "libpreparser.h"

int BINJS_MAX_LINE_LENGTH = 2048;

static const char * HEADER = "binjs_import(\"~lib/binjs.js\");\n";
static const int HEADER_LEN = 31;

static const int ERROR = 1;
static const int WARN = 2;


static int process_line(int out, char * current_line, struct binjs_parsed_doc* doc, int line_num, int line_pos);
static int get_var_name(char * current_line, int * start, int * end);
static int starts_with_var(char * current_line, struct binjs_parsed_doc* doc);
static int store_var(char * current_line, struct binjs_parsed_doc* doc);
static int is_java_script_reserved_word(char * current_line);

/**
 * Stream parser, reads in and writres to out, sets the status to the parsed_doc
 * struct as it parses the file.
 */
int binjs_preparse(int in, int out, struct binjs_parsed_doc* doc) {
	
	// state machine for reading the file
	int is_reading_first_line = 1;
	int line_num = 0;
	int line_pos = 0;
	char current_line[BINJS_MAX_LINE_LENGTH + 1];
	memset(current_line, 0, BINJS_MAX_LINE_LENGTH + 1);
	doc->vars = g_hash_table_new(g_str_hash, g_str_equal);

	// char reading
	char c;
	int line_read = 0;
	int total_read = 0;
	int bytes_read = 0;
	
	
	while (1) {
		//printf("total_read=%d, bytes_read=%d\n", total_read, bytes_read);
		bytes_read = read(in, &c, 1);
		if ( bytes_read < 0 ) {
				fprintf(stderr, "Error reading script\n");
				return 1;
		}
		
		if ( bytes_read == 0 ) {
			doc->line_count = line_num;
			return 0;
		}
		
		total_read++; 
		line_read++;
		if (line_read > BINJS_MAX_LINE_LENGTH) {
			// TODO grow the array
			doc->err = ERROR;
			doc->err_line_no = line_num;
			doc->error = "Input line too long";
			return ERROR;
		}
		
		// skip first line  #!/bin/bash replace with JS imports
		// TODO error if line not start with #!/bin/js
		if (is_reading_first_line) {
			if (c == '\n') {
				is_reading_first_line = 0;
				line_num++;
				write(out, HEADER, HEADER_LEN);
			}
			continue;
		}

		// skip windows new line chars
		if (c == '\r') {
			continue;
		}
		
		// skip whispace during doc->is_bash_continue
		if (doc->is_bash_continue) {
			if (c == ' ' || c == '\t' ) {
				continue;
			}
			else {
				doc->is_bash_continue = 0;
			}
		}
		
		// Reached the end of a line
		if (c == '\n') {
			line_num++;

			int err = process_line(out, current_line, doc, line_num, line_pos);
			if (err) {
				doc->err = err;
				doc->err_line_no = line_num;
				return ERROR;
			}

			if ( doc->is_bash_continue ) continue;
			
			// reset
			line_pos = 0;
			line_read = 0;
			memset(current_line, 0, BINJS_MAX_LINE_LENGTH + 1);
			continue;
		}
		else {
			current_line[line_pos++] = c;
		}

	}


	return 0;
}

/**
 * wrap a line of bash script in binjs_exec("[script]") escaping the string.
 */
static void wrap_binjs_exec(int out, char * current_line) {

	// count and reproduce whitespace
	int pos = 0;
	while (current_line[pos] == ' ' || current_line[pos] == '\t') {
		pos++;
	}

	write(out, current_line, (size_t)pos);
	
	// write prefix
	write(out, "binjs_exec(\"", 12);
	
	// escape JavaScript String
	int len = strlen(current_line);
	int i;
	for ( i = pos; i < len ; i++) {
		char c = current_line[i];
		if (
				c == '\"' ||
				c == '\'' ||
				c == '\\'
		   ) {
			write(out, "\\", 1);
			write(out, current_line + i , 1);
		}
		else if (c == '\t') {
			write(out, "\\t", 2);
		}
		// TODO do we need to support other stuff like "bell"
		else {
			write(out, current_line + i , 1);
		}
	}
	
	// write suffix
	write(out, "\");\n" , 4);
}

/**
 * write binjs_exit() statement.
 */
static void wrap_binjs_exit(int out, char * current_line) {
	
	

	while (*current_line == ' ' || *current_line == '\t') {
		current_line++;
	}
	current_line += 4; // "exit";
	int end = 0;
	
	while (*current_line++ != 0 ) {
		end++;
	}

	write(out, "binjs_exit( ", 12);
	write(out, current_line - end, end - 1);
	write(out, " );\n" , 4);
}
/**
 * return true if bash line continuation is detected i.e. a \ at the end of the line
 */
static int is_bash_continue(char * current_line ) {
	return current_line[strlen(current_line) -1] == '\\';
}

/**
 * return 1 if the line is determined to be a syntax error according to the preparser.
 *
 */
static int is_exit(char * current_line) {

	// skip whitespace
	int pos = 0;
	while(current_line[pos] == ' ' || current_line[pos] == '\t') pos++;
	
	if ( strncmp(current_line + pos, "exit ", 5 ) == 0 ) return 1;
	
	return 0;
}
/**
 * return 1 if the line is determined to be a syntax error according to the preparser.
 *
 */
static int is_error(char * current_line, struct binjs_parsed_doc* doc) {

	// skip whitespace
	int pos = 0;
	while(current_line[pos] == ' ' || current_line[pos] == '\t') pos++;
	
	// Lines starting with [, ], " or ' are errors (despite being valid JavaScript)
	if ( 
		current_line[pos] == '[' ||
		current_line[pos] == ']' ||
		current_line[pos] == '\"' ||
		current_line[pos] == '\''
		) {
			doc->error = "Lines cannot start with [ ] \" or \', N.B use + at the start of the line for multi-line JS strings";
			return ERROR;
	}
	
	// Lines starting with whitespace then # are errors
	if ( pos > 0 && current_line[pos] == '#' ) {
		doc->error = "Lines cannot start with whitespace then a #, # comments must be the first character in the line";
		return ERROR;
	}
	
	return 0;
}

/**
 * return 1 if the line is just whitespace
 */
static int is_whitespace(char * current_line) {

	// skip whitespace
	int pos = 0;
	while (current_line[pos] == ' ' || current_line[pos] == '\t') pos++;
	
	if (current_line[pos] == 0) return 1;
	
	return 0;
}
/**
 * return 1 if the line is to be interpreted as bash.
 *
 * lines startint "echo " are unequivocally bash
 */
static int is_bash(char * current_line) {

	// skip whitespace
	int pos = 0;
	while (current_line[pos] == ' ' || current_line[pos] == '\t') pos++;
	
	if ( strncmp(current_line + pos, "echo ", 5 ) == 0 ) return 1;
	
	return 0;
}

/**
 * return > 0 if the line is to be interpreted as JavaScript.
 * return 2 if the line declares a variable that should be remembered.
 * return 3 if we are in a multi-line JavaScript comment
 */
static int is_java_script(char * current_line, int in_js_comment) {

	// skip whitespace
	int pos = 0;
	while (current_line[pos] == ' ' || current_line[pos] == '\t') pos++;
	
	// multi-line comments starting is happening  /* */
	if ( strncmp(current_line + pos,		"/*",		2 ) == 0 ) {
		in_js_comment = 1;
	}
	// if in a comment everything that does not include */ is still a comment
	if ( in_js_comment ) {
	
		while (current_line[pos] != 0 ) {
			if (
				pos > 1 &&
				current_line[pos - 1] == '*' &&
				current_line[pos]   == '/') {
				return 1;
			}
			pos++;
		}
		return 3;
		
	}
	
	if ( strncmp(current_line + pos,		"//",		2 ) == 0 ) return 1;
	if ( current_line[pos] == '{' ) return 1;
	if ( current_line[pos] == '}' ) return 1;
	if ( current_line[pos] == '+' ) return 1;

	// WARN that var analysis is needed
	if ( strncmp(current_line + pos,		"var ",		4 ) == 0 ) return 2;
	if ( strncmp(current_line + pos,		"function ",	9 ) == 0 ) return 2;
	if ( strncmp(current_line + pos,		"$.",	2 ) == 0 ) return 1;
	if ( strncmp(current_line + pos,		"binjs_",	6 ) == 0 ) return 1;
	
	if ( is_java_script_reserved_word(current_line + pos) ) return 1;
	
	/*
	// TODO repalce with use of is_java_script_reserved_word (created below not tested)
	//fprintf(stderr, "JS? %s \n", current_line + pos);
	if ( strncmp(current_line + pos,		"//",		2 ) == 0 ) return 1;
	if ( strncmp(current_line + pos,		"if ",		3 ) == 0 ) return 1;
	if ( strncmp(current_line + pos,		"else ",	5 ) == 0 ) return 1;
	if ( strncmp(current_line + pos,		"for ",		4 ) == 0 ) return 1;
	if ( strncmp(current_line + pos,		"while ",	6 ) == 0 ) return 1;
	if ( strncmp(current_line + pos,		"do ",		3 ) == 0 ) return 1;
	if ( strncmp(current_line + pos,		"switch ",	7 ) == 0 ) return 1;
	if ( strncmp(current_line + pos,		"case ",	5 ) == 0 ) return 1;
	if ( strncmp(current_line + pos,		"break ",	6 ) == 0 ) return 1;
	if ( strncmp(current_line + pos,		"continue ",	9 ) == 0 ) return 1;
	
	if ( strncmp(current_line + pos,		"catch ",	6 ) == 0 ) return 1;
	if ( strncmp(current_line + pos,		"throw ",	6 ) == 0 ) return 1;
	if ( strncmp(current_line + pos,		"try ",		4 ) == 0 ) return 1;
	if ( strncmp(current_line + pos,		"debugger ",9 ) == 0 ) return 1;
	if ( strncmp(current_line + pos,		"default ",	8 ) == 0 ) return 1;
	if ( strncmp(current_line + pos,		"delete ",	7 ) == 0 ) return 1;
	if ( strncmp(current_line + pos,		"finally ",	8 ) == 0 ) return 1;
	if ( strncmp(current_line + pos,		"in ",		3 ) == 0 ) return 1;
	if ( strncmp(current_line + pos,		"instanceof ",	11 ) == 0 ) return 1;
	if ( strncmp(current_line + pos,		"new ",		4 ) == 0 ) return 1;
	if ( strncmp(current_line + pos,		"return ",	7 ) == 0 ) return 1;
	if ( strncmp(current_line + pos,		"this.",	5 ) == 0 ) return 1;
	if ( strncmp(current_line + pos,		"typeof ",	7 ) == 0 ) return 1;
	if ( strncmp(current_line + pos,		"void ",	5 ) == 0 ) return 1;
	if ( strncmp(current_line + pos,		"with ",	5 ) == 0 ) return 1;
	
	if ( strncmp(current_line + pos,		"return ",	7 ) == 0 ) return 1;
	if ( strncmp(current_line + pos,		"goto ",	5 ) == 0 ) return 1;
	if ( strncmp(current_line + pos,		"binjs_",	6 ) == 0 ) return 1;
	if ( strncmp(current_line + pos,		"$.",		2 ) == 0 ) return 1;
	
	// lets be polite  TODO better way to detect tokens that supports ({; and EOL
	if ( strncmp(current_line + pos,		"if(",		3 ) == 0 ) return 1;
	if ( strncmp(current_line + pos,		"else{",	5 ) == 0 ) return 1;
	if ( strncmp(current_line + pos,		"for(",		4 ) == 0 ) return 1;
	if ( strncmp(current_line + pos,		"while(",	6 ) == 0 ) return 1;
	if ( strncmp(current_line + pos,		"do{",		3 ) == 0 ) return 1;
	if ( strncmp(current_line + pos,		"case{",	5 ) == 0 ) return 1;
	if ( strncmp(current_line + pos,		"switch(",	7 ) == 0 ) return 1;
	if ( strncmp(current_line + pos,		"break;",	6 ) == 0 ) return 1;
	if ( strncmp(current_line + pos,		"continue;",	9 ) == 0 ) return 1;
	if ( strncmp(current_line + pos,		"catch(",	6 ) == 0 ) return 1;
	if ( strncmp(current_line + pos,		"try{",		4 ) == 0 ) return 1;
	*/
	return 0;
}



static int process_line(int out, char * current_line, struct binjs_parsed_doc* doc, int line_num, int line_pos) {

	//fprintf(stdout, "%d:%d:%s\n", line_num, line_pos, current_line);
	
	doc->is_bash_continue = 0;
	
	int js_ret = 0;
	// empty lines
	if (line_pos == 0) {
		write(out, "\n", 1);
		return 0;
	}

	// Just whitespace
	if ( is_whitespace(current_line) ) {
		write(out, "\n", 1);
		return 0;
	}
	
	// # comments
	else if (current_line[0] == '#') {
		write(out, "//" , 2);
		write(out, current_line , strlen(current_line));
		write(out, "\n" , 1);
		return 0;
	}
	
	// preparser syntax errors
	else if ( is_error(current_line, doc)) {
		doc->err = ERROR;
		return ERROR;
	}
	
	// forced bash
	else if ( is_bash(current_line) ) {
		if ( is_bash_continue(current_line) ) {
			doc->is_bash_continue = 1;
		} else {
			wrap_binjs_exec(out, current_line);
		}
		return 0;
	}
	
	// forced exit
	else if ( is_exit(current_line) ) {
		wrap_binjs_exit(out, current_line);
		return 0;
	}
	
	// check for JavaScript
	else if ( (js_ret = is_java_script(current_line, doc->in_js_comment)) > 0 ) {
		write(out, current_line, strlen(current_line));
		write(out, "\n" , 1);

		doc->in_js_comment = 0;
		if ( js_ret == 3 ) {
			doc->in_js_comment = 1;
		}
		else if ( js_ret == 2 ) {
			store_var(current_line, doc);
		}
		return 0;
	}

	// check for known variables
	else if ( starts_with_var( current_line, doc) ) {
		write(out, current_line , strlen(current_line));
		write(out, "\n" , 1);
		return 0;
	}

	// default to bash
	else {
		if ( is_bash_continue(current_line) ) {
			doc->is_bash_continue = 1;
		} else {
			wrap_binjs_exec(out, current_line);
		}
		return 0;
	}
}

// sets the start and end positions to the first token that could be a variable
static int get_var_name(char * current_line, int * start, int * end) {
	int pos = 0;
	
	// skip whitespace
	while (current_line[pos] == ' ' || current_line[pos] == '\t') pos++;
	
	*start = pos;

	// skip valid JS otken chars
	while (
		current_line[pos] == '_' ||
		current_line[pos] == '$' ||
		current_line[pos] == '-' ||
		(current_line[pos] >= 'a' && current_line[pos] <= 'z') ||
		(current_line[pos] >= 'A' && current_line[pos] <= 'Z') ||
		(current_line[pos] >= '0' && current_line[pos] <= '9')
		 ) pos++;
	
	*end = pos;
	
//printf("got var %d - %d \n", *start, *end);
	
	return 0;
	
}
static int store_var(char * current_line, struct binjs_parsed_doc* doc) {

	int pos = 0;

	// skip whitespace
	while (current_line[pos] == ' ' || current_line[pos] == '\t') pos++;
	
	if ( strncmp(current_line + pos,		"function",	8 ) == 0 ) pos += 9;
	if ( strncmp(current_line + pos,		"var",		3 ) == 0 ) pos += 3;

	// skip whitespace
	while (current_line[pos] == ' ' || current_line[pos] == '\t') pos++;
	
	int start = 0, end = 0;
	get_var_name(current_line + pos, &start , &end);

	char *var;
	var = malloc(sizeof(char) * (end - start + 1) );
	if ( var == NULL ) return 1;
	
	var[end - start] = 0;
	strncpy(var, current_line + pos + start, (size_t)(end - start));
	
//printf("Storing var %s \n", var);
	
	g_hash_table_insert(doc->vars, var, "");
	
	return 0;
}

static int starts_with_var(char * current_line, struct binjs_parsed_doc* doc) {
	int pos = 0;
	
	// skip whitespace
	while (current_line[pos] == ' ' || current_line[pos] == '\t') pos++;
	
	int start = 0, end = 0;
	get_var_name(current_line, &start , &end);

	char * var = malloc(sizeof(char) * (end - start + 1) );
	if ( var == NULL ) return 1;
	
	var[end - start] = 0;
	strncpy(var, current_line + start, (size_t)(end - start));
	
//printf("Looking for %s\n", var);
	
	gpointer* found = g_hash_table_lookup(doc->vars, var);
	
	free(var);
	
	return found != NULL ? 1 : 0;
}

static int is_java_script_reserved_word(char * current_line) {

	int reserved_words_len = 45;
	char* reserved_words[] = {
		"break","case","catch","continue",
		"debugger","default","delete","do",
		"else","finally","for","function",
		"if","in","instanceof","new",
		"return","switch","this","throw",
		"try","typeof","var","void",
		"while","with","class","const",
		"enum","export","extends","import",
		"super","implements","interface","let",
		"package","private","protected","public",
		"static","yield","null","true",
		"false"
		};
	int i = 0;
	int tokEnd = 0;
	
	//printf("line=%c\n", current_line[tokEnd]);
	// skip up to end of token
	while (current_line[tokEnd] >= 'a' &&  current_line[tokEnd] <= 'z' ) {
		tokEnd++;
	}
	
	if (tokEnd == 0) return 0;
		
	if (current_line[tokEnd] != 0 &&
		current_line[tokEnd] != ' ' &&
		current_line[tokEnd] != '\t' &&
		current_line[tokEnd] != '.' &&
		current_line[tokEnd] != ';' &&
		current_line[tokEnd] != '=' &&
		current_line[tokEnd] != '?' &&
		current_line[tokEnd] != ':' &&
		current_line[tokEnd] != '!' &&
		current_line[tokEnd] != '*' &&
		current_line[tokEnd] != '+' &&
		current_line[tokEnd] != '-' &&
		current_line[tokEnd] != '/' &&
		current_line[tokEnd] != '%' &&
		current_line[tokEnd] != '<' &&
		current_line[tokEnd] != '>' &&
		current_line[tokEnd] != '`' && // debatable
		current_line[tokEnd] != '[' &&
		current_line[tokEnd] != '{' &&
		current_line[tokEnd] != '(' &&
		current_line[tokEnd] != ']' &&
		current_line[tokEnd] != '}' &&
		current_line[tokEnd] != ')')
	{
		return 0;
	}

	
	char token[tokEnd + 1];
	token[tokEnd] = 0;
	strncpy(token, current_line, tokEnd);
	//printf("token found = %s\n", token);
	for(i = 0 ; i < reserved_words_len ; i++) {
		if ( strcmp(token, reserved_words[i]) == 0 ) {
			return 1;
		}
	}
	return 0;
}

