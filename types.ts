export interface Problem { 
    name: string;
    description: string[];
    difficulty: string;
}

export interface Problems {
    [key: string]: Problem;
}
