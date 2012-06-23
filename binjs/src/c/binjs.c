/**
 * binjs.c preparses a /bin/js file and passes the resulting JavaSciript to librunjs.
 *
 * @author teknopaul
 */


#include <ctype.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>

#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <signal.h>

#include "../v8/librunjs.h"
#include "libpreparser.h"

/**
 * Exec launcher, if there is just two args it is assumed it has been run with  #!/bin/js and the frist arg is the name of the sript
 * 
 * All arguments must be prefixed 
 *   "-b-" for bash arguments e.g. -b-x for debug output
 *   "-v8-" for parameters to v8 
 *   "-bj-" for arguments to binjs
 *   any other args are sent to both bash and JavaScript s as program arguments.
 *
 * an argument "--" stops all argument processing and from then on all vars are sent to the script even if the stert with -b, -v8 or -bj
 *
 */
int main(int argc, char* argv[]) {
	
	signal(SIGINT, runjs_exit);
	
	// parse command line args

	int verbose_flag = 0;
	
	char *script_file = NULL;

	// last argument is the script name
	if (argc < 2) {
		fprintf(stderr, "Script to run required\n");
		return 1;
	}


	// process the command line arguments

	int bash_argc = 0;
	int v8_argc = 0;
	//int bj_argc = 0;
	int prog_argc = 0;
	char *bash_optsv[argc]; // bash options
	char *v8_optsv[argc];   // v8 options
	char *prog_argv[argc];  // program arguments
	char *bash_argv[argc];  // bash opts + program args
	char *v8_argv[argc];    // v8 opt + program args
	//char *bj_argv[argc];    // TODO arguments for /bin/js commented to shut gcc up
	
	int a = 1;
	for (a = 1 ; a < argc ; a++) {
	
		if ( strncmp(argv[a],   "-", 1) != 0 ) {
			break;
		}
	
		// -v8 switches are in the form --foo=bar
		if ( strncmp(argv[a], "-v8-" , 4) == 0 ) {
			v8_optsv[v8_argc++] = argv[a] + 3;
		}
		
		// bash switches are -x  or -o option
		if ( strncmp(argv[a], "-b-" , 3) == 0 ) {
			bash_optsv[bash_argc++] = argv[a] + 2;
			
			if ( strncmp(argv[a], "-b-o" , 4) == 0 ) { // bash option arg
				if (argc < a) {
					fprintf(stderr, "missign option to bash -b-o");
					return 2;
				}
				else {
					bash_optsv[bash_argc++] = argv[++a];
				}
			}
			
		}
		
		// /bin/js switches are in the form -v
		if ( strncmp(argv[a], "-bj-" , 4) == 0 ) {
			//bj_argv[bj_argc++] = argv[a] + 3;
			
			if ( strncmp(argv[a], "-bj-v" , 5) == 0 ) {
				verbose_flag = 1;
			}
		}
	}
	
	// script is the first non-option argument
	script_file = argv[a++];
	//printf ("script = %s\n", script_file);
	
	// everything else is program arguments
	for (a = a ; a < argc ; a++) {
		prog_argv[prog_argc++] = argv[a];
	}

	
	// copy program arguments for bash and v8 which have different opts
	v8_argv[0] = script_file;
	for (a = 0 ; a < v8_argc; a++) {
		v8_argv[a+1] = v8_optsv[a];
	}
	v8_argc++;
	for (a = 0 ; a < prog_argc; a++) {
		v8_argv[v8_argc] = prog_argv[a];
		v8_argc++;
	}
	
	bash_argv[0] = script_file;
	for (a = 0 ; a < bash_argc; a++) {
		bash_argv[a+1] = bash_optsv[a];
	}
	bash_argc++;
	if ( verbose_flag ) {
		bash_argv[bash_argc++] = "-x";
	}
	for (a = 0 ; a < prog_argc; a++) {
		bash_argv[bash_argc] = prog_argv[a];
		bash_argc++;
	}

	// die if we dont have correct opts

	if ( script_file == NULL ) {
		fprintf(stderr, "Script to run required\n");
		return 1;
	}
	
	if (verbose_flag) printf("Running %s\n", script_file);

	// read the script to memory

	struct stat stat_s;

	int stat_ret = stat(script_file, &stat_s);

	if (stat_ret != 0) {
		fprintf(stderr, "Unable to stat file %s\n", script_file);
		return 1;
	}

	off_t file_size = stat_s.st_size;

	if ( file_size == 0) {
		fprintf(stderr, "No data in the script\n");
		return 1;
	}
	//printf("Script size %d\n", file_size);

	int in = open(script_file, O_RDONLY);
	if (in == -1) {
		fprintf(stderr, "Unable to open %s\n", script_file);
		return 3;
	}


	int pipefd[2];
	pipe(pipefd);
	int out = pipefd[1];
	
	struct binjs_parsed_doc doc;
	memset(&doc, 0 , sizeof(struct binjs_parsed_doc));
	// TODO should we not have the read pipe already setu ina different thread?
	
	int prep_err = binjs_preparse(in, out, &doc);
	//fprintf(stderr, "parsed\n");
	if (prep_err) {
		if (doc.err == 1) {
			fprintf(stderr, "Error preparsing %s\n", doc.error);
			return 2;
		}
		
		if (doc.err == 2) {
			fprintf(stderr, "Warning preparsing %s\n", doc.warning);
			return 1;
		}
	}

	close(out);

	runjs_init_bash(bash_argc, bash_argv);
	//fprintf(stderr, "libbash initialised\n");


	int retval = runjs_pipejs(pipefd[0], v8_argc, v8_argv);

	return retval;

}
