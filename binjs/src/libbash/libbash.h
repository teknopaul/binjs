
#include <unistd.h>

#ifdef __cplusplus
extern "C" {
#endif

typedef enum { BJNONE = -1, BJRUNNING = 1, BJSTOPPED = 2, BJDEAD = 4, BJMIXED = 8 } BASH_JOB_STATE;

// linked list of Jobs
struct bash_job {
	char *command;
	pid_t pid;
	int running;
	int state; // JNONE = -1, JRUNNING = 1, JSTOPPED = 2, JDEAD = 4, JMIXED = 8
	struct bash_job *next; 
};

// linked list of varaibles
struct bash_var {
	char *name;			/* Symbol that the user types. */
	char *value;
	struct bash_var *next; 
};

int libbash_init(int argc, char** argv) ;

int libbash_run_one_command(char *command);

void libbash_exit (int s);

void libbash_set_variable(const char* name, char* value);

void libbash_get_variable(const char* name, char* value);

char* libbash_peak_variable(const char* name);

void libbash_unset_variable(const char* name);

struct bash_var * libbash_get_all_variables();
void libbash_free_vars(struct bash_var* vars);

int libbash_last_command_exit_value();

struct bash_job* libbash_get_jobs();
void libbash_free_jobs(struct bash_job* jobs);


#ifdef __cplusplus
}
#endif
