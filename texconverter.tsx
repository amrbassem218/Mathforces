import KaTeXRenderer from "@/components/KatexRenderer";
import { string } from "prop-types";
import { useEffect, useState } from "react";
import katex from "katex";
interface Problem { 
    title: string;
    description: React.ReactElement[];
    difficulty: string;
}

export interface Problems {
    [key: string]: Problem;
}
function isValidKaTeX(line: string): boolean {
  try {
    katex.renderToString(line, { throwOnError: true });
    return true;
  } catch (err) {
    return false;
  }
}
const processLatex = (content: string): React.ReactElement[] => {
    let problemDescription: React.ReactElement[] = [];
    const lines = content.split('\n');
    let excess: string = "";
    for(let i = 0; i < lines.length; i++){
        let processed: React.ReactElement = <></>;

        if(lines[i].includes("begin{enumerate}")){
            i++;
            let processedChild: React.ReactElement[]= [];
            while(!lines[i].includes("end{enumerate}")){
                let itemName = lines[i].slice(lines[i].indexOf('[')+1, lines[i].indexOf(']'))
                let itemTxt = lines[i].slice(lines[i].indexOf(']')+1) + excess;
                while(!isValidKaTeX(String.raw`${itemName} ${itemTxt}`)){
                    i++;
                    itemTxt += lines[i].slice(0, Math.max(0, lines[i].indexOf("\\item")))
                }
                processedChild.push(<li><KaTeXRenderer expression={String.raw`${itemName} ${itemTxt}`}/></li>)
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
        else{
            processed = <KaTeXRenderer expression={String.raw`${lines[i]}`}/>;
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
                const response = await fetch("/2023.tex");
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const text = await response.text();
                const lines = text.split('\n');
                const parsedProblems: Problems = {};
                let flag = false;
                let curProblem = "";
                let currentProblemName = "";
                let enumerateFlag = false;
                for (let ln of lines) {
                    if(ln == "\\end{enumerate}"){
                        enumerateFlag = false;
                    }
                    if(enumerateFlag || ln == "\\begin{enumerate}"){
                        enumerateFlag = true;

                    }
                    if (ln.slice(0, 6) === "\\item[" && ln[8] === "]") {
                        if (currentProblemName && curProblem) {
                            parsedProblems[currentProblemName] = {
                                title: currentProblemName,
                                description: processLatex(curProblem.trim()),
                                difficulty: "easy"
                            };
                        }

                        currentProblemName = ln.slice(6, 8);
                        curProblem = "";
                        flag = true;
                    } else if (flag) {
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