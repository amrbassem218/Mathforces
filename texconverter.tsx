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
    let tryLine = <KaTeXRenderer expression={line}/>;
    if(tryLine == <span>Couldn't render Problem</span>){
        console.log(tryLine);
        return false;
    }
    return true;
}
function texFormatter(lines: string[]): string[] {
  const result: string[] = [];
  let buffer: string[] = [];
  let inDisplayMath = false;
  let inMatrix = false;
  let matrixBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) {
      if (buffer.length > 0) {
        result.push(buffer.join('\n'));
        buffer = [];
      }
      continue;
    }

    // Handle display math mode
    if (line.includes('\\[')) {
      inDisplayMath = true;
      if (buffer.length > 0) {
        result.push(buffer.join('\n'));
        buffer = [];
      }
      buffer.push(line);
      continue;
    }
    if (line.includes('\\]')) {
      inDisplayMath = false;
      buffer.push(line);
      result.push(buffer.join(' ')); // Join display math with spaces
      buffer = [];
      continue;
    }

    // Handle matrix environment
    if (line.includes('\\begin{bmatrix}')) {
      inMatrix = true;
      if (buffer.length > 0) {
        result.push(buffer.join('\n'));
        buffer = [];
      }
      matrixBuffer = [line];
      continue;
    }
    if (line.includes('\\end{bmatrix}')) {
      inMatrix = false;
      matrixBuffer.push(line);
      result.push(matrixBuffer.join(' ')); // Join matrix with spaces
      matrixBuffer = [];
      continue;
    }

    // If we're in a matrix, collect all lines
    if (inMatrix) {
      matrixBuffer.push(line);
      continue;
    }

    // Handle enumerate environment
    if (line.includes('\\begin{enumerate}') || line.includes('\\end{enumerate}')) {
      if (buffer.length > 0) {
        result.push(buffer.join('\n'));
        buffer = [];
      }
      result.push(line);
      continue;
    }

    // Handle item commands
    if (line.includes('\\item')) {
      if (buffer.length > 0) {
        result.push(buffer.join('\n'));
        buffer = [];
      }
      result.push(line);
      continue;
    }

    // Handle inline math mode
    if (line.includes('$')) {
      if (buffer.length > 0) {
        result.push(buffer.join('\n'));
        buffer = [];
      }
      result.push(line);
      continue;
    }

    // If we're in display math, keep buffering
    if (inDisplayMath) {
      buffer.push(line);
      continue;
    }

    // Regular text
    buffer.push(line);
  }

  // Add any remaining buffered content
  if (buffer.length > 0) {
    result.push(buffer.join('\n'));
  }
  if (matrixBuffer.length > 0) {
    result.push(matrixBuffer.join(' '));
  }

  return result;
}

const processLatex = (content: string): React.ReactElement[] => {
    let problemDescription: React.ReactElement[] = [];
    const lines = content.split('\n');
    for(let i = 0; i < lines.length; i++){
        let processed: React.ReactElement = <></>;

        if(lines[i].includes("begin{enumerate}")){
            i++;
            let processedChild: React.ReactElement[]= [];
            while(!lines[i].includes("end{enumerate}")){
                if(lines[i].includes("\\item")){
                    let itemName = lines[i].slice(lines[i].indexOf('[')+1, lines[i].indexOf(']'))
                    let itemTxt = lines[i].slice(lines[i].indexOf(']')+1);
                    processedChild.push(<li><KaTeXRenderer expression={String.raw`${itemName} ${itemTxt}`}/></li>)
                    i++;
                }
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
    console.log("hey me here");
    console.log(isValidKaTeX(String.raw`\[`))
    useEffect(() => {
        const loadProblems = async () => {
            try {
                const response = await fetch("/2023.tex");
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                let text = await response.text();
                let lines = text.split('\n');
                lines = texFormatter(lines);
                const parsedProblems: Problems = {};
                let flag = false;
                let curProblem = "";
                let currentProblemName = "";
                for (let ln of lines) {
                    if(ln.includes("end{itemize}")) break;
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