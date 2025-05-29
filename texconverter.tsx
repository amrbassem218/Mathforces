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
export function texFormatter(input: string): string[] {
  const lines = input.split(/\r?\n/);
  const result: string[] = [];

  let buffer: string[] = [];
  let inBlock = false;
  let blockStart = '';

  const blockDelimiters: [string, string][] = [
    ['\\[', '\\]'],
    ['\\begin{equation}', '\\end{equation}'],
    ['\\begin{equation*}', '\\end{equation*}'],
    ['\\begin{align}', '\\end{align}'],
    ['\\begin{align*}', '\\end{align*}'],
    ['\\begin{gather}', '\\end{gather}'],
    ['\\begin{gather*}', '\\end{gather*}']
  ];

  const isBlockStart = (line: string): string | null =>
    blockDelimiters.find(([start]) => line.includes(start))?.[0] || null;

  const getBlockEnd = (start: string): string =>
    blockDelimiters.find(([s]) => s === start)?.[1] || '';

  for (const line of lines) {
    const trimmed = line.trim();

    if (!inBlock) {
      const startDelim = isBlockStart(trimmed);
      if (startDelim) {
        inBlock = true;
        blockStart = startDelim;
        buffer.push(trimmed);
        continue;
      }

      if (/\\\[(.*)\\\]/.test(trimmed) || /^\$.*\$$/.test(trimmed)) {
        // Already complete inline/display math
        result.push(trimmed);
      } else if (/\\\[/.test(trimmed) || /^\$/.test(trimmed)) {
        // Start of display/inline math block
        inBlock = true;
        blockStart = trimmed.startsWith('\\[') ? '\\[' : '$';
        buffer.push(trimmed);
      } else {
        result.push(trimmed); // normal line
      }
    } else {
      buffer.push(trimmed);
      const blockEnd = getBlockEnd(blockStart);
      if (blockEnd && trimmed.includes(blockEnd)) {
        // Found closing
        result.push(buffer.join(' ').replace(/\s+/g, ' ').trim());
        buffer = [];
        inBlock = false;
        blockStart = '';
      } else if (blockStart === '\\[' && trimmed.includes('\\]')) {
        result.push(buffer.join(' ').replace(/\s+/g, ' ').trim());
        buffer = [];
        inBlock = false;
        blockStart = '';
      } else if (blockStart === '$' && trimmed.includes('$')) {
        result.push(buffer.join(' ').replace(/\s+/g, ' ').trim());
        buffer = [];
        inBlock = false;
        blockStart = '';
      }
    }
  }

  // Push any dangling buffer
  if (buffer.length > 0) {
    result.push(buffer.join(' ').replace(/\s+/g, ' ').trim());
  }

  return result.filter(line => line.length > 0);
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
                const response = await fetch("/2024.tex");
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                let text = await response.text();
                let lines = text.split('\n');
                lines = texFormatter(text);
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