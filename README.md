# Hackmud - Documentation

## Index

- [Architect Commands](#architect-commands)
- [Scripting](#scripting)
- [Database](#database)
- [Script library](#library)

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
