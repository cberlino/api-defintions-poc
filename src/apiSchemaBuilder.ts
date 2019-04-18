import { Tree } from './tree';
import * as FastGlob from 'fast-glob';
import * as Prettier from 'prettier';

export class ApiSchemaBuilder {
  private readonly definitionFilePath: string;
  private readonly schemaBaseName: string;

  public constructor(definitionFilePath: string, schemaBaseName: string = 'Schema') {
    this.definitionFilePath = definitionFilePath;
    this.schemaBaseName = schemaBaseName;
  }

  public async execute(): Promise<string> {
    return this.format(await this.makeSchemaTree());
  }

  private async makeSchemaTree(): Promise<Tree> {
    const tree: Tree = new Tree(this.schemaBaseName);
    const definitionFiles = await FastGlob.async(this.definitionFilePath);

    if (!definitionFiles.length) {
      throw new Error(`There were no api definition files found.`);
    }

    definitionFiles.sort().forEach((definitionFile) => {
      const definitionFileSections = definitionFile
        .toString()
        .split('/')
        .slice(1);

      let currentTree = tree;

      definitionFileSections.forEach((definitionFileSection) => {
        currentTree.children[definitionFileSection] =
          currentTree.children[definitionFileSection] || new Tree(definitionFileSection);
        currentTree = currentTree.children[definitionFileSection];
      });

      currentTree.filepath = definitionFile.toString();
    });

    return tree;
  }

  private format(schemaTree: Tree): string {
    return Prettier.format(
      `
      import {HandlerResponse, validateSchema} from "./apiHandlerHelpers"
      import {Response as ExpressResponse, NextFunction} from "express"
      
      ` + schemaTree.render(),
      {
        parser: 'typescript',
        trailingComma: 'es5',
        tabWidth: 2,
        semi: true,
        singleQuote: true,
        printWidth: 130,
        bracketSpacing: true,
        arrowParens: 'always',
      }
    );
  }
}
