import KaTeXRenderer from "./src/components/KatexRenderer";
import { ReactElement, useEffect, useState } from "react";
import katex from "katex";
import { lstat } from "fs";
import { lineDescription, Problem, Problems } from "./types";
import {renderToString} from "react-dom/server";
const processLatex = (content: string): lineDescription[] => {
    let problemDescription: lineDescription[] = [];
    const lines = content.split('\n');
    for(let i = 0; i < lines.length; i++){
        let processed: lineDescription = {blockType: 'katex'};

        if(lines[i].includes("begin{enumerate}")){
            i++;
            let processedChild: lineDescription[]= [];
            while(i < lines.length && !lines[i].includes("end{enumerate}")){
                if(lines[i].includes("\\item")){
                    let itemName = lines[i].slice(lines[i].indexOf('[')+1, lines[i].indexOf(']'))
                    let itemTxt = lines[i].slice(lines[i].indexOf(']')+1);
                    processedChild.push(
                        {
                            blockType: "li",
                            children: [
                                {
                                    blockType: "katex",
                                    expression: String.raw`${itemName} ${itemTxt}`
                                }
                            ]
                        }
                    )
                  }
                  i++;
            }
            processed = {
                blockType: "ul",
                children: processedChild
            }
        }
        else if(lines[i].includes("begin{align")){
          let lineWords = lines[i].split(" ");
          lineWords = lineWords.map((e) => {
            if(e.includes("\\begin{align")){
              return "$$" + e;
            }
            if(e.includes("\\end{align")){
              return e + "$$";
            }
            return e;
          })
          lines[i] = lineWords.join(" ");
          processed = {
            blockType: "katex",
            expression: String.raw`${lines[i]}`
          };
        }
        else if(lines[i].includes("\\end")){
            processed = {
              blockType: "katex",
              expression: String.raw`${lines[i].slice(0)}`
            };
        }
        else{
            processed = {
              blockType: "katex",
              expression: String.raw`${lines[i]}`
            };
        }
        problemDescription.push(processed);
    }
    return problemDescription;
};
interface IuseProblemsProps {
    formattedTex: string;
}
export const useProblems = ({formattedTex}: IuseProblemsProps)=> {
    const [problems, setProblems] = useState<Problems>({});
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        const loadProblems = async () => {
            try {
                let lines = formattedTex.split('\n');
                const parsedProblems: Problems = {};
                let flag = false;
                let curProblem = "";
                let currentProblemName = "";
                for (let ln of lines) {
                    if(ln.includes("end{itemize")) break;
                    if (ln.slice(0, 6) === "\\item[" && ln[8] === "]") {
                        if (currentProblemName && curProblem) {
                            parsedProblems[currentProblemName] = {
                                name: currentProblemName,
                                description: processLatex(curProblem.trim()),
                                difficulty: "easy"
                            };
                        }

                        currentProblemName = ln.slice(6, 8);
                        curProblem = ln.slice(ln.indexOf(']')+1) + "\n"
                        flag = true;
                      }
                      else if(flag){
                        curProblem += ln + "\n";
                      }
                }
                if (currentProblemName && curProblem) {
                    parsedProblems[currentProblemName] = {
                        name: currentProblemName,
                        description: processLatex(curProblem.trim()),
                        difficulty: "easy"
                    };
                }

                setProblems(parsedProblems);
            } catch (err) {
                console.error('Error loading problems:', err);
                setError(err instanceof Error ? err.message : 'Unknown error occurred');
            }
        };

        loadProblems();
    }, [formattedTex]);

    return { problems, error };
};

