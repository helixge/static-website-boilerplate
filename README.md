# static-website-boilerplate
Boilerplate template for new websites


## Initialization
After pulling the repository run the following command:
```
yarn install
```

## Primary Tasks

### Process once
```
gulp process
```
runs the default gulp tasks with all subtasks only once

### Process and run the watcher
```
gulp
```
runs the default gulp task with all subtasks and executes a watcher for css and js changes

### Run a webserver and watch
```
gulp webserver
```
runs the default gulp task with all subtasks, executes a watcher for CSS and JS changes and runs the webserver

## Additional parameters

### Run production build
```
--prod
```
By adding `--prod` argunebt to any task, additional minification processing will be applied to JS and CSS
