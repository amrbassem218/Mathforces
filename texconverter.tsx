import KaTeXRenderer from "@/components/KatexRenderer";
import { string } from "prop-types";
import { useEffect, useState } from "react";
import katex from "katex";
import { lstat } from "fs";
interface Problem { 
    title: string;
    description: React.ReactElement[];
    difficulty: string;
}

export interface Problems {
    [key: string]: Problem;
}

const processLatex = (content: string): React.ReactElement[] => {
    let problemDescription: React.ReactElement[] = [];
    const lines = content.split('\n');
    for(let i = 0; i < lines.length; i++){
        let processed: React.ReactElement = <></>;

        if(lines[i].includes("begin{enumerate}")){
            i++;
            let processedChild: React.ReactElement[]= [];
            while(i < lines.length && !lines[i].includes("end{enumerate}")){
              // console.log("waiting");
                if(lines[i].includes("\\item")){
                    let itemName = lines[i].slice(lines[i].indexOf('[')+1, lines[i].indexOf(']'))
                    let itemTxt = lines[i].slice(lines[i].indexOf(']')+1);
                    processedChild.push(<li><KaTeXRenderer expression={String.raw`${itemName} ${itemTxt}`}/></li>)
                  }
                  i++;
            }
            processed = (
            <ul>
                {processedChild.map((e) => {
                    return e;
                })}
            </ul>
            )
        }
        else if(lines[i].includes("begin{align")){
          let lineWords = lines[i].split(" ");
          lineWords = lineWords.map((e) => {
            if(e.includes("\\begin{align")){
              return "$$" + e;
            }
            if(e.includes("\\end{align")){
              return e + "$$";
              // e = e.slice(0, e.indexOf("\\end{align")) + "$$" + e.slice(e.indexOf("")) ;
            }
            return e;
          })
          lines[i] = lineWords.join(" ");
          console.log("its me luigi")
          console.log(lines[i]);
          // lines[i] = lines[i].slice(0, lines[i].indexOf("begin{align")) + "$$" + lines.slice(lines[i].indexOf("begin{align"), lines[i].indexOf("end{align")+1) + "$$" + (lines.slice(Math.max(lines[i].indexOf("end{align*}$$")+1, lines.indexOf(""))));
          processed = (<><KaTeXRenderer expression={String.raw`${lines[i]}`}/><br/></>);
        }
        else if(lines[i].includes("\\end")){
          processed = (<><KaTeXRenderer expression={String.raw`${lines[i].slice(0,)}`}/></>);
        }
        else{
            processed = (<><KaTeXRenderer expression={String.raw`${lines[i]}`}/></>);
        }
        problemDescription.push(processed);
    }
    return problemDescription;
};

export const useProblems = () => {
    const [problems, setProblems] = useState<Problems>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        const loadProblems = async () => {
            try {
                const response = await fetch("/2018.tex");
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                let text = await response.text();
                let lines = text.split('\n');
                const parsedProblems: Problems = {};
                let flag = false;
                let curProblem = "";
                let currentProblemName = "";
                for (let ln of lines) {
                    if(ln.includes("end{itemize")) break;
                    // console.log(curProblem);
                    if (ln.slice(0, 6) === "\\item[" && ln[8] === "]") {
                        if (currentProblemName && curProblem) {
                          console.log(curProblem);
                            parsedProblems[currentProblemName] = {
                                title: currentProblemName,
                                description: processLatex(curProblem.trim()),
                                difficulty: "easy"
                            };
                        }

                        currentProblemName = ln.slice(6, 8);
                        curProblem = ln.slice(ln.indexOf(']')+1) + "\n"
                        flag = true;
                      }
                      else if(true){
                        curProblem += ln + "\n";
                      }
                }

                // Handle the last problem
                if (currentProblemName && curProblem) {
                    parsedProblems[currentProblemName] = {
                        title: currentProblemName,
                        description: processLatex(curProblem.trim()),
                        difficulty: "easy"
                    };
                }

                setProblems(parsedProblems);
                setLoading(false);
            } catch (err) {
                console.error('Error loading problems:', err);
                setError(err instanceof Error ? err.message : 'Unknown error occurred');
                setLoading(false);
            }
        };

        loadProblems();
    }, []);

    return { problems, loading, error };
};