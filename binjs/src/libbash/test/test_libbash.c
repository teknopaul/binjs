#include <stdio.h>

#include "../libbash.h"

int main(int argc , char ** argv) {
	
	libbash_init(argc, argv);

	libbash_run_one_command("echo Hello World");

	libbash_run_one_command("touch afile");

	libbash_run_one_command("if [ -f afile ] ; then echo afile exists ; fi");

	libbash_run_one_command("rm afile");
	
	printf("$? = %d\n", libbash_last_command_exit_value());

	char home[256];
	
	libbash_get_variable("HOME", home);
	printf("Read $HOME %s\n", home);

	libbash_set_variable("SETTED", "setted");
	char setted[256];
	libbash_get_variable("SETTED", setted);
	printf("Read $SETTED %s\n", setted);

	libbash_run_one_command("sleep 5 && echo done1 &");
    libbash_run_one_command("sleep 5 && echo done2 &");
	
	libbash_run_one_command("echo Echoing SETTED=${SETTED}");

	struct bash_job* jobs = libbash_get_jobs();

	int j = 1;
	while(jobs != NULL) {
		printf("[%d] pid:%d %s &\n", j++ , jobs->pid, jobs->command);
		jobs = jobs->next;
	}
	libbash_free_jobs(jobs);
	

	struct bash_var* vars = libbash_get_all_variables();

	while(vars != NULL) {
		printf("%s=%s\n", vars->name, vars->value);
		vars= vars->next;
	}
	libbash_free_vars(vars);
	

	libbash_exit(0);

	return 0;
} 
