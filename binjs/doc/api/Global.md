# Global 

Global variables and functions.

----------------------------

## Attributes

See [Magic Vars](../../html/MagicVars.html) for more details.

### argc

The count of arguments supplied to the script.

### argv

The arguments supplied to the script as a JavaScript Array of Strings.

### errno

The return cod eof the last command executed by bash.

### pid

The process id of the script.

### lastpid

The process id of the last process forked by bash using `&`.

## Objects

Constructors for the following Objects are always in the global scope.

Array, Boolean, Date, Math, Number, String, RegExp from core JavaScript.

N.B. String has the `trim()` method added.

A native JSON Object is available with `stringify()` and `parse()`.

The following /bin/js Objects are added to the global scope.

 * [File](./File.html)

 * [$](./Dollar.html)

 * [Color](./Color.html)


## Functions

Core JavaScript fucntions from v8 are available for example `parseInt()` and `parseFloat()`.

