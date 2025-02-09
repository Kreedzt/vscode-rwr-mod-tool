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

-   xml property file / fileRef url check("file", "file_name", "ilename", "ileref")

Registered snippets:

- all snippets prefixed by `rwr-`

## Release Notes

## 0.4.0

- optimize format error output
- add command for "Show File Format output"

## 0.3.0

- optimize format performance
- add format error output

## 0.2.0

- add file scan loading percent tip
- add format command

## 0.1.0

- add file scan loading
- fixed file scan check cause vscode lag
- add tempalte code snippets(prefix: `rwr-`)

## 0.0.2

- add more file ref scan property("@_file", "@_file_name", "@_filename", "@_fileref")