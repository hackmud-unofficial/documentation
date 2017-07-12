# Hackmud - Documentation

## Index

- [Architect Commands](#architect-commands)
- - [Creating a script](#creating-a-script)
- - [Opening the script dir](#opening-the-script-directory)
- - [Uploading a script](#uploading-a-script)
- - [Deleting a local script](#deleting-a-script-localy)
- - [Listing all scripts](#listing-all-local-and-uploaded-scripts)
- - [The help command](#the-help-command)
- [Scripting](#scripting)
- [Scripts.lib](#scriptslib)
- [Macros](#macros)
- [Database](#database)
- - [Inserting](#inserting)
- - [Removing](#removing)
- - [Finding](#finding)
- - [Updating](#updating)


## Architect Commands

### Creating a script
**Command:** `#edit <filename>`\
This command will create or edit a script, *opening it up with your default text editor*.\
If you are on Windows this may crash, as the default .js command on Windows is the system built-in compiler.\
To fix this issue, associate your text editor with the .js file extension. If you don’t have a text editor, get one like Notepad++.\
Scripts will be created with a default template.

----

### Opening the script directory
**Command:** `#dir`\
This command simply opens up your script directory.\
You can create new scripts here and them upload them ingame.

----

### Uploading a script
**Command:** `#up <filename>`\
This command will upload your created script to the server, so you can execute it.\
Possible arguments ***AFTER*** the filename:
- delete - will delete your script from the server, but leave it locally.
- public - will make your script public - assuming you have the public slot upgrade installed and loaded within your system.
- private - will explicitly mark a script as private (useful to un-public a script while debugging, for example)

----

### Deleting a script localy
**Command:** `#delete <filename>`\
This command will remove your script from your computer’s file system, which means you won’t be able to access it from your editor anymore.\
Be careful around this command, though - it runs without any confirmation.\
*Note: if the script was previously uploaded, the server copy will still exist, but there is no way to download it again.*

----

### Listing all local and uploaded scripts
**Command:** `#scripts` **or simply** `#`\
This command will list all your local and uploaded scripts.\
To see your currently uploaded scripts, run **scripts.user**

----

### The help command
**Command:** `#help`\
This command will print the in-game architect commands help.

## Scripting

Scripts in hackmud are JavaScript (ES6) files consisting of a single function which passes two parameters:\
- context - This is a context the script is run from, i.e. if a user called noob ran your script, then any command executed from **context** will be treated as executed by the user who executed it, just like he/she would write them in their command line. **Context** has the following subkeys:
- - `context.caller` - The name of the user who is calling the script (i.e. n00b)
- - `context.this_script` - The name of this script
- - `context.calling_script` - The name of the script that directly called this script, or null if called on the command line
- `args` -  This is a dictionary containing all the arguments a user passed to your script.\
    If the script was called without any arguments (i.e. `foo.bar`), args will be null. If called with empty arguments (i.e. `foo.bar {}`), args will be an empty JS object.

Example ez_21 cracker: [here](https://github.com/hackmud-unofficial/example-scripts/ez_21.js)

### Scriptors

**Scriptors** are one of the hackmud specific features.\
They allow you to call an in-game script from your script. That allows you to parametrize your script’s behavior.\
The scriptor syntax is as follows:\
```#s.user.script```

The above can be then passed to your script as an argument, like the following (remember to upload the script!):\
`crk_ez21 { target:#s.user.command }`

To call a command the scriptor points to, there’s a scriptor-specific method which optionally accepts your arguments that will be passed to the called command:\
```js
args.target.call({/* optional arguments for the called scriptor */})
```

If you want to call a hard-coded script (ed note: this isn’t technically a scriptor, it is just a script call), you can do so without using a scriptor, as follows.\
Be aware, you cannot store a script to a variable like this:\
```js
var x = #s.user.name
```

As #s is really a preprocessing directive.  #s.user.name must be used immediately, in the form 
```js
#s.user.name({key:value})
```

If you want to hard-code a script call that you can reuse, define a wrapper function, like:
```js
function foo(args) {
    return #s.user.name(args);
}
```

### Converting a string (like "foo.bar") into a callable. **(NOT POSSIBLE!)**
Many people want to take a string, like a loc from an NPC corp, and call it directly inside another script.\
This is, deliberately, impossible in hackmud.\
If you could convert a string into a callable in any way, the entire security level system would fall apart (because any string in any dependency could possibly be a nullsec script. And those strings could come from the database).\
If you want to do something with those locs (or similar cases), you will have to pass them in as a scriptor or hard-code them in the file.
You cannot call the string directly.

### Returning a result
A called script can return basically anything - an array, a string, an object, or even null.\
Most scripts in the game however simply return a string.
- Your script itself generally returns both {ok:true, msg:"string"}
- The contents of string will automatically be printed to your terminal
- Both of these arguments are optional, and while you may get an error message if you return nothing from a script, it will still work fine.

### Autocomplete
To add autocomplete args to your script, on the first line, after the function boilerplate, add a comment with a list of args and values, like this:
```js
function(context, args) { // arg1:val1, arg2:val2, arg3:#s.an.example, arg4:”example”
    var myArg = args.arg1;
    …
}
```

After uploading the script, you might need to run **scripts.user** to update your autocomplete, and then it should work.

## Macros

Macros are fairly simple, and very useful in hackmud. This is not strictly coding related, but they are not that widely known. Example:

/macroname = test{target:"canhavefixedarguments"}

/hl = kernel.hardline
/dc = kernel.hardline{dc:true}

Running /macroname or /hl or /dc will run exactly that command. Macros unfortunately cannot themselves have arguments, which limits what you can do with them somewhat.

## Database
Each users’ database in hackmud is a MongoDB collection, in which data is stored as JSON documents.

Query Objects:\
Query Objects are a regular JSON object containing keys and values you want to search against.\
Projections:\
Projections allow you to fetch specific subfields in a #db object. These speed things up quite a bit if your document is large. \
Check https://docs.mongodb.com/v3.0/tutorial/project-fields-from-query-results/ for more information.

### Inserting
`#db.i()`\
[Mongodb documentation on inserting](https://docs.mongodb.com/manual/reference/method/db.collection.insert/)\
This command creates new #db documents.\
Called like `#db.i(<JSON object or array of JSON objects>);`\
Ex: `#db.i({ SID:”scriptname” })` Inserts a document with key “SID” and value “scriptname”

### Removing
`#db.r()`\
[Mongodb documentation on removing](https://docs.mongodb.com/manual/reference/method/db.collection.remove/)\
This command deletes #db documents matching your query.\
Called like `#db.r({query})`;\
Ex: `#db.r({ SID:”scriptname” })` removes all documents where key “SID” contains the value “scriptname”.

### Finding
`#db.f()`\
[Mongodb documentation on finding](https://docs.mongodb.com/manual/reference/method/db.collection.find/)\
This command returns any documents matching your query.\
Called like `#db.f({query}, {projection}).command()` where “command” is either “first” or “array”/\
Ex: `#db.f({ SID:”scriptname” }).array()` returns an array of documents where key “SID” contains the value “scriptname”.\
Ex: `#db.f({ SID:”scriptname” }, { field:1, _id:0 }).first()` returns the value for the key “field” inside the first document it finds where key “SID” contains the value “scriptname”.

### Updating
`#db.u()`\
[Mongodb documentation on updating](https://docs.mongodb.com/manual/reference/method/db.collection.update/)\
This command updates any pre-existing documents matching the query.\
Called like `#db.u({query}, { updateOper:{updatedfields} })` applies “update” to any documents matching the query.\
Ex: `#db.u({ SID:”scriptname” }, { $set:{field:”new value”} })` sets key field to “new value” in any documents where key “SID” contains the value “scriptname”.\
This can be a very complex operation. It is HIGHLY recommended you follow the aforementioned hyperlink.\


## Scripts.lib
This is a code library containing useful helper functions you can use in your scripts.

Function name | Arguments | Returns | Description | Example (`var l = #s.scripts.lib();`)
--- | --- | --- | --- | ---
ok | none | `{ok:true}` | Helper method to save chars. | `return l.ok();`
not_impl | none | `{ok:false, msg:"not implemented"}` | Helper method to save chars. | `return l.not_impl();`
log | (message) | nothing | Pushes a string representation of a value onto an array of log messages. You have to use the method below to print it. | `l.log("hackmud is the best hacking game!")`
get_log | none | Array containing the stored logs | Gets the stored logs, Does not clone or clear the array afterwards; it's a direct reference to the same array. | `var log_arr = l.get_log();`
rand_int | (min, max) | integer | Returns a random integer between min/max | `var r = l.rand_int(0, 10);`
are_ids_eq | (id1, id2) | boolean | Tests whether id1 and id2 values are equal. Apparently buggy at the moment. | 
is_obj | (what) | boolean | Returns true if the what is a object. (Arrays are objs too) | `var is_obj = l.is_str({name:"ryo", gc:"1TGC"});`
is_num | (what) | boolean | Returns true if the what is a Number. (This treats NaN (not a number) as not a number, even though in JS, typeof NaN == "number".) | `var b = l.is_num(2);`
is_int | (what) | boolean | Returns true if what is is both a Number (via is_num), and also an integer. | `var b = l.is_int(3);`
is_neg | (what) | boolean | Returns true if what is is both a Number (via is_num), and also negative (i.e. <0) | `var b = l.is_neg(-3);`
is_arr | (what) | boolean | Returns true if what is an array | `var b = l.is_arr([2,3,4]);`
is_arr | (what) | boolean | Returns true if what is a function | `var b = l.is_func(my_func);`
is_def | (what) | boolean | Returns true if what is defined so, **NOT** undefined. Note: null != undefined | `var b = l.is_def(my_var);`
is_valid_name | (what) | boolean | Returns true if what is a valid user/script name. | `var b = l.is_func(my_func);`
dump | (obj) | string | Returns a string representation of the obj argument. | `return l.dump(my_obj);`
clone | (obj) | object | Returns a clone of the obj argument (meaning references are broken). | `var cln_obj = l.clone(org_obj);`
merge | (obj1, obj2) | nothing | Merges the contents of obj2 into obj1. This can be useful for combining defaults with user-specified values, but it is not quite secure on its own (i.e. don’t trust it to secure DB filters). |
get_values | (obj) | array | Returns an array containing the values of the object properties. | `var value_arr = l.get_values(my_obj);`
hash_code | (string) | number | Returns a number calculated based on the string argument. | `var hash = l.hash_code("test");`
to_gc_str | (num) | string | Converts raw num number to a GC currency representation. | `var gc_string = l.to_gc_str(100);`
to_gc_num | (str) | number | Converts raw num number to a GC currency representation. | `var gc_num = l.to_gc_num("10MGC");`
to_game_timestr | (date) | string | Converts a Date object specified via date parameter to a game-styled time string. | `var date_str = l.to_game_timestr(new Date())`
cap_str_len | (string, length) | strring | Truncates the given string to the given length if it's longer than that. |
each | (array, fn) | array | Runs fn on each array element. | `var new_arr = l.each(old_arr, (key, val) => {...});`
select | (array, fn) | array | Returns a collection of values from array that matches the fn predicate. If the predicate returns true, the select function adds the key:value pair currently processed to the returned collection of values. | `var new_arr = l.select(old_arr, (key, val) => val % 2 == 0 ? true : false);`
count | (array, fn) | number | Returns a number of items from array that matches the fn predicate. If the predicate returns true, the count function increments the returned number by one. |
select_one | (array, fn) | array | Same as the select function, but returns the first value that matches the predicate. | 
map | (array, fn) | array | Creates a new array with the results of calling a provided function on every element in the calling array. | `var new_arr = l.map(old_arr, x => x*2);`
shuffle | (array) | array | Shuffles an array and returns it. |
sort_asc | (one, two) | array | If one > two, returns 1. If two is greater than one, return -1. Else return 0. Looks like a sorting function |
sort_desc | (one, two) | array | Returns the opposite of the above, ie -1 on one > two, and 1 on two > one |
num_sort_asc | (...?) |  |  |
num_sort_desc | (...?) |  |  |
add_time | (date, add_ms) | date | Gets the date of date + add_ms (milliseconds) | `return l.add_time(new Date(), 4000);`
security_level_names | | | It's not a function, array containing the security levels (NULLSEC, LOWSEC, MIDSEC, HIGHSEC, FULLSEC) | `var nullsec = l.security_level_names[0];`
get_security_level_name | (level) | string | Takes a parameter between 0 and 4 (inclusive), returns the corresponding security from NULLSEC (0) to FULLSEC (4) |
create_rand_string | (len) | string | Returns a random string consisting of lowercase alphanumeric characters. |
get_user_from_script | (script_name) | string | Returns the user from a script name. Ie me.target returns me |
u_sort_num_arr_desc | | | |
can_continue_execution | (ms) | boolean | Returns true whether the script can still be on execution in the provided time. |`l.can_continue_execution(1000);`
can_continue_execution_error | | | |
can_continue_execution_error | | | |
date | | | |
get_date | | date | Gets the current date |
get_date_utcsecs | | number | Gets the current time from the date (ie Date.getTime()) |