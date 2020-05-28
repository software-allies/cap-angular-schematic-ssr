import { strings } from '@angular-devkit/core';
import { 
  apply,
  template,
  branchAndMerge,
  chain,
  forEach,
  FileEntry,
  mergeWith,
  move,
  Rule,
  SchematicsException,
  Tree,
  url
} from '@angular-devkit/schematics';
import { FileSystemSchematicContext } from '@angular-devkit/schematics/tools';
import { InsertChange } from '@schematics/angular/utility/change';
import { getWorkspace } from '@schematics/angular/utility/config';
import {
  buildRelativePath, 
  findModule, 
  MODULE_EXT, 
  ROUTING_MODULE_EXT
} from '@schematics/angular/utility/find-module';
import { parseName } from '@schematics/angular/utility/parse-name';
import { buildDefaultPath } from '@schematics/angular/utility/project';
import { getProjectFromWorkspace } from '@angular/cdk/schematics/utils/get-project';
import { 
  addImportToModule
} from './vendored-ast-utils';
import { Schema as ComponentOptions } from './schema';
import { getAppName } from './cap-utils/package';
import { readIntoSourceFile } from './cap-utils';


function addDeclarationToNgModule(options: ComponentOptions): Rule {
  return (host: Tree) => {
    
    const modulePath = options.module;

    // Need to refresh the AST because we overwrote the file in the host.
    const source = readIntoSourceFile(host, modulePath);
    const componentPath = `${options.path}/app/modules/cap-ssr/cap-ssr.module`;
    const relativePath = buildRelativePath(modulePath, componentPath);
    const classifiedName = strings.classify(`CapSSRModule`);
    const providerRecorder = host.beginUpdate(modulePath);
    const providerChanges: any = addImportToModule(
        source,
        modulePath,
        classifiedName,
        relativePath);

    for (const change of providerChanges) {
        if (change instanceof InsertChange) {
            providerRecorder.insertLeft(change.pos, change.toAdd);
        }
    }
    host.commitUpdate(providerRecorder);

    return host;
  };
}


export function schematicSSR(options: ComponentOptions): Rule {
  return (host: Tree, context: FileSystemSchematicContext) => {

    // Get project
    options.project = (options.project) ? options.project : getAppName(host);
    if (!options.project) {
      throw new SchematicsException('Option "project" is required.');
    }

    const workspace = getWorkspace(host);
    const project = getProjectFromWorkspace(workspace, options.project);
    if (!project) {
      throw new SchematicsException(`Project is not defined in this workspace.`);
    }

    if (options.path === undefined) {
      options.path = buildDefaultPath(project);
    }
    
    options.module = findModule(host, options.path, 'app.server' + MODULE_EXT, ROUTING_MODULE_EXT);
    options.name = '';
    const parsedPath = parseName(options.path!, options.name);
    options.name = parsedPath.name;
    options.path = parsedPath.path;
    
    // Object that will be used as context for the EJS templates.
    const baseTemplateContext = {
      ...strings,
      ...options,
    };

    const templateSource = apply(url('./files'), [
      template(baseTemplateContext),
      move(null as any, parsedPath.path),
      forEach((fileEntry: FileEntry) => {
        if (host.exists(fileEntry.path)) {
          host.overwrite(fileEntry.path, fileEntry.content);
        }
        return fileEntry;
      })
    ]);

    return chain([
      branchAndMerge(chain([
        addDeclarationToNgModule(options),
        mergeWith(templateSource)
      ])),
    ])(host, context);
  };
}
