# Inventory component
Inventory component for screencrash, with support for items and achievements. Custom made specifically for the show Apornas ö.
Run component to handle backend calls and then add a web view with the `media`-component to visualize the result, or visit webpage at http://localhost:4218.
Manual changes can be done through screencrash commands or via the update subpage (http://localhost:4218/update).

Available items and achivements can be added/removed/edited in the file `res/static_data.json`.

## Requirements
NodeJS v10.0+ . Make is nice but not required.

## Running the server

### Running with make
The following commands start the different modules:

| Command                     | Outcome                                                             |
| --------------------------- | ------------------------------------------------------------------- |
| make dev                    | Run inventory server on port 4218                                   |
| make -C transparent_web dev | Run electron window displaying the webpage on http://localhost:4218 |

### Running with npm
```
npm ci
npm run dev
```