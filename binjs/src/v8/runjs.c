/**
 * runjs.c is a command line tool to pass JavaScript to librunjs.
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

#include "librunjs.h"

static void exit_handler() {
	runjs_exit(130);
}

int main(int argc, char* argv[]) {
	
	// parse command line args

	int verbose_flag = 0;
	char *script_file = NULL;
	int c;

	// last argument is the script name
	if (argc < 2) {
		fprintf(stderr, "Script to run required\n");
		return 1;
	}
	script_file = argv[argc - 1];

	opterr = 0;

	while ((c = getopt(argc, argv, "v:")) != -1) {
		switch (c) {
			case 'v':
			  verbose_flag = 1;
			  break;
			case '?':
				if (optopt == 'f')
					fprintf(stderr, "Option -%c requires an argument, the script to run.\n", optopt);
				else if (isprint (optopt))
					fprintf(stderr, "Unknown option `-%c'.\n", optopt);
				else
					fprintf(stderr,"Unknown option character `\\x%x'.\n", optopt);
				return 1;
			default:
				return 1;
		}
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

	char* file_data = (char*)malloc(file_size + 1);

	if (file_data == NULL) {
		fprintf(stderr, "No memory\n");
		return 1;
	}

	int in = open(script_file, O_RDONLY);
	if (in == -1) {
		fprintf(stderr, "Unable to open %s\n", script_file);
		return 3;
	}
	
	//printf("File open %d\n", in);
	
	int total_read = 0;
	int bytes_read = 0;
	while(1) {
		//printf("total_read=%d, bytes_read=%d\n", total_read, bytes_read);
		bytes_read = read(in, file_data, file_size - total_read);
		if ( bytes_read < 0 ) {
				fprintf(stderr, "Error reading script\n");
				free(file_data);
				return 1;
		}
		
		if ( bytes_read == 0 ) {
			if (total_read == file_size) {
				break;
			}
			else {
				fprintf(stderr, "Error reading script\n");
				free(file_data);
				return 1;
			}
		}
		
		total_read += bytes_read; 
		if ( total_read == file_size ) {
			//printf("File read %s\n");
			break;
		}
		else {
			//printf("Continue\n");
		}
	}
	file_data[file_size] = 0;

	// execute the JavaScript
	signal(SIGPIPE, exit_handler);
	signal(SIGTERM, exit_handler);	

	runjs_init_bash(argc, argv);

	int retval = runjs_runjs(file_data);

	free(file_data);
	
	//printf("Finished: %d\n", retval);
	
	return retval;

}
