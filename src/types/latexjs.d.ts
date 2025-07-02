declare module "latex.js" {
  export class LatexJS {
    parse(latex: string): { htmlDocument: () => Document };
  }
}
