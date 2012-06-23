/**
 * libjs enables running JavaScript.
 */

#ifdef __cplusplus
extern "C" {
#endif

int runjs_init_bash(int argc, char** argv);

int runjs_runjs(char* script_text);

int runjs_pipejs(int pipe, int argc, char* argv[]);

void runjs_exit(int status);

#ifdef __cplusplus
} // extern "C"

void SetSignalHandler();

#endif
