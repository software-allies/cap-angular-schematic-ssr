import {Tree} from '@angular-devkit/schematics';

const CONFIG_PATH = 'angular.json';

export function readConfig(host: Tree) {
  const sourceText = host.read(CONFIG_PATH)!.toString('utf-8');
  return JSON.parse(sourceText);
}

export function writeConfig(host: Tree, config: JSON) {
  host.overwrite(CONFIG_PATH, JSON.stringify(config, null, 2));
}

function isAngularBrowserProject(projectConfig: any) {
  if (projectConfig.projectType === 'application') {
    const buildConfig = projectConfig.architect.build;
    return buildConfig.builder === '@angular-devkit/build-angular:browser';
  }
  return false;
}

export function getAngularAppName(config: any): string | null {
  const projects = config.projects;
  const projectNames = Object.keys(projects);
  for (let projectName of projectNames) {
    const projectConfig = projects[projectName];
    if (isAngularBrowserProject(projectConfig)) {
      return projectName;
    }
  }
  return null;
}

export function getAngularAppConfig(config: any): any | null {
  const projects = config.projects;
  const projectNames = Object.keys(projects);
  for (let projectName of projectNames) {
    const projectConfig = projects[projectName];
    if (isAngularBrowserProject(projectConfig)) {
      return projectConfig;
    }
  }
  return null;
}

export function addStyle(host: Tree, stylePath: string) {
  const config = readConfig(host);
  const appConfig = getAngularAppConfig(config);
  if (appConfig) {
    appConfig.architect.build.options.styles.push({
     input: stylePath
    });
    writeConfig(host, config);
  } else {
    console.log("Can't find an app.");
  }
}

export function hasBootstrap(host: Tree): boolean {
  const config = readConfig(host);
  const appConfig = getAngularAppConfig(config);
  let _hasBootstrap = false;
  if (appConfig) {
    const styles = appConfig.architect.build.options.styles;
		if (styles) {
			for (let style in styles) {
        if (styles[style].input && typeof(styles[style].input) === "string") {
          if (styles[style].input.includes('bootstrap')) {
            console.log("Bootstrap is already used.");
            _hasBootstrap = true;
          }
        } else if (styles[style] && typeof(styles[style]) === "string")  {
          if (styles[style].includes('bootstrap')) {
            console.log("Bootstrap is already used.");
            _hasBootstrap = true;
          }
        }
			}
		}
    return _hasBootstrap;
  } else {
    console.log("This is not a Angular application.");
    return false;
  }
}


