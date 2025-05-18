import { readFileSync } from 'node:fs';
import { CursorPos } from 'node:readline';

const filePath: string = "2023.tex";
const readFile: string = readFileSync(filePath, 'utf-8');
let lines = readFile.split('\n');
let cnt = 1;
let problems: string[] = [];
// console.log(lines[10]);
// for(let n of lines){
//     console.log(n);
// }
let flag = false;
let curProblem: string = "";
function mathasize(curProblem: string, initalValue: string, end:string, i: number){
    const st = i;
    i++;
    let mathSec: string = initalValue;
    while(i < curProblem.length && curProblem[i] != end){
        mathSec += curProblem[i];
        i++;
    }
    if(i < curProblem.length){
        curProblem = curProblem.slice(0,st) +  `<Math math={${mathSec}} />` + curProblem.slice(i+1);
    }
    return curProblem;
}
for(let ln of lines){
    if(ln.slice(0,6) == "\\item[" && ln[8] == "]"){
        if(!flag){
            flag = true;
            continue;
        }
        cnt++;
        for(let i = 0; i < curProblem.length; i++){
            if(curProblem[i] == '$'){
                curProblem = mathasize(curProblem, "", '$', i);
            }
            else if(curProblem[i] == "\\"){
                if(curProblem.slice(i,6) == "\\begin"){
                    curProblem = mathasize(curProblem, "\\", "\\end", i);
                }
                else{
                    curProblem = mathasize(curProblem, "\\", "\\end", i);
                }
            }
        }
        for(let i = 0; i < curProblem.length; i++){
            if(curProblem[i] == '\\'){
                curProblem = curProblem.slice(0,i) + "\\" + curProblem.slice(i);
                i++;
            }
        }
        problems.push(curProblem);
        curProblem = "";
    }
    else if(flag) curProblem += ln;
}
for(let p of problems){
    console.log(p);
    console.log('**********************************');
}
// console.log(readFile);