# VSCode RWR Mod Tool

## Features

we use these rules to mark workspace as rwr mod folder:

-   "workspaceContains:\*\*/calls/all_calls.xml",
-   "workspaceContains:\*\*/factions/all_factions.xml",
-   "workspaceContains:\*\*/items/all_carry_items.xml",
-   "workspaceContains:\*\*/weapons/all_weapons.xml"

Registered commands:

-   create armor
-   create weapon
-   format active file
-   format workspace

Registered linters:

-   xml property file / fileRef url check("file", "file_name", "filename", "fileref")

Registered snippets:

-   all snippets prefixed by `rwr-`

### AngelScript Language Server

#### Go to Definition

-   support `#include "xxx.as"` file jump

### File resolver Language Server

### Go to Definition

-   support xml file attributes("file", "file_name", "filename", "fileref") jump

## Release Notes

## 0.5.0

-   optimize re-scan performance
-   add angelscript language server
    -   support `#include "xxx.as"` file jump

## 0.4.0

-   optimize format error output
-   add command for "Show File Format output"

## 0.3.0

-   optimize format performance
-   add format error output

## 0.2.0

-   add file scan loading percent tip
-   add format command

## 0.1.0

-   add file scan loading
-   fixed file scan check cause vscode lag
-   add tempalte code snippets(prefix: `rwr-`)

## 0.0.2

-   add more file ref scan property("@\_file", "@\_file_name", "@\_filename", "@\_fileref")
