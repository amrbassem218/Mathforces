export interface Problem { 
    name: string;
    description: lineDescription[];
    difficulty: string;
}
export interface lineDescription{
    blockType: string;
    expression?: string;
    hasBreak?: boolean;
    children?: lineDescription[];
}
export interface Problems {
    [key: string]: Problem;
}
export interface IrenderComponent{
    lineDescription: lineDescription;
    key: string;
}