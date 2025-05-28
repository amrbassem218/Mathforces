import { string } from "prop-types";
import { useEffect, useState } from "react";

interface Problem { 
    title: string;
    description: string;
    enumerate: string[];
    difficulty: string;
}

export interface Problems {
    [key: string]: Problem;
}
let enumerate: string[] = [];

const processLatex = (content: string): string => {
    const lines = content.split('\n');
    let enumerateFlag = false;
    const processedLines = lines.map(line => {
        if (!line.trim()) return line;
        
        if(line == "\\end{enumerate}"){
            enumerateFlag = false;
        }
        else if(enumerateFlag){
            enumerate.push(line.slice(line.search(/]/)+1))
        }
        else if(line == "\\begin{enumerate}"){
            enumerateFlag = true;
            return "\\begin{enumerate}";
        }
            const parts = line.split('$');
            return parts.map((part, index) => {
                // Even indices are outside math mode, odd indices are inside
                return index % 2 === 0 ? part : `$${part}$`;
            }).join('');
    });

    return processedLines.join('\n');
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
                                enumerate: enumerate,
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
                        enumerate: enumerate,
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