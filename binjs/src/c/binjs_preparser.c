/**
 * Command line version of libpreparser, to be able to dump and view the output
 * of the preparsing.
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


static int do_preparse(int in, int out, struct binjs_parsed_doc doc) {

	//printf("File open %d\n", in);
	binjs_preparse(in, out, &doc);

	if (doc.err == 1) {
		fprintf(stderr, "Error preparsing %s", doc.error);
		return 1;
	}

	if (doc.err == 2) {
		fprintf(stderr, "Warning preparsing %s", doc.warning);
		return 2;
	}

	return 0;

}
/**
 * Takes a /bin/js script file and outputs a JavaScript file.
 *
 * Read a file, or stdin if no file is specified, and write to stdout.
 */
int main(int argc, char* argv[]) {

	struct binjs_parsed_doc doc;
	
	if (argc == 1) {

		memset(&doc, 0 , sizeof(struct binjs_parsed_doc ));

		return do_preparse(STDIN_FILENO, STDOUT_FILENO, doc);

	}

	else if (argc > 1) {
		int i = 1;
		for (; i < argc ; i++) {
		
			//fprintf(stderr, "preparsing %s\n", argv[i]);
		
			struct stat stat_s;
		
			int stat_ret = stat(argv[1], &stat_s);
		
			if (stat_ret != 0) {
				fprintf(stderr, "Unable to stat file %s\n", argv[i]);
				return 1;
			}
		
			off_t file_size = stat_s.st_size;
		
			if ( file_size == 0) {
				fprintf(stderr, "No data in the script %s\n", argv[i]);
				return 1;
			}
			
			int in = open(argv[1], O_RDONLY);
			if (in == -1) {
				fprintf(stderr, "Unable to open %s\n", argv[i]);
				return 3;
			}
			
			int in_filename_len = strlen(argv[i]);
			char* out_filename;
			out_filename = malloc(in_filename_len + 5);
			memset(out_filename, 0, in_filename_len);
			strcpy(out_filename, (const char *)(argv[i]));
			strcpy(out_filename + in_filename_len, ".out");
			printf("Writing %s\n", out_filename);
			
			mode_t mode = S_IRUSR | S_IWUSR | S_IRGRP | S_IROTH;
			int out = open(out_filename, O_WRONLY | O_CREAT, mode);
			if (out == -1) {
				fprintf(stderr, "Unable to open %s\n", out_filename);
				return 3;
			}

			memset(&doc, 0 , sizeof(struct binjs_parsed_doc ));
			
			do_preparse(in, out, doc);
			
			free(out_filename);
		}

	}


	return 0;
}
