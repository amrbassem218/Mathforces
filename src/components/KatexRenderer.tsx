import renderMathInElement from 'katex/contrib/auto-render';
import 'katex/dist/katex.min.css';
import React, { useEffect, useRef } from 'react';
import { IrenderComponent } from 'types';
interface KaTeXRendererProps {
  expression: string;
  displayMode?: boolean;
}

export const KaTeXRenderer: React.FC<KaTeXRendererProps> = ({expression}) => {
  const element = useRef<HTMLDivElement>(null);
  expression = expression
    .replace(/\\mbox/g, '\\text')
    .replace(/\\rm/g, '\\mathrm')
    .replace(/\\bf/g, '\\mathbf')
    .replace(/\\it/g, '\\mathit')
    .replace(/\\choose/g, '\\binom');
    try {
      useEffect(()=>{
          
        if(element.current){
          renderMathInElement(element.current, {
            delimiters: [
              {left: "$$", right: "$$", display: true},
              {left: "$", right: "$", display: false},
              {left: "``", right: "''", display: false},
              {left: "\\[", right: "\\]", display: true},
              {left: "\\(", right: "\\)", display: false}
            ]
          })
        }
      },[expression])
      return <div ref={element}>{expression}</div>
  } catch (error) {
    return <span>Couldn't render Problem</span>;
  }
};

export const renderComponent = ({lineDescription, key}: IrenderComponent):React.ReactElement => {
  switch (lineDescription.blockType) {
    case "katex":
      return <><KaTeXRenderer expression={lineDescription.expression || ""}/>{lineDescription.hasBreak ? <br/> : ""}</>;
      break;
    case "ul":
      return (
        <ul key={key} >
          {lineDescription.children?.map((e, i) => {
            return renderComponent({lineDescription: e, key: i.toString()});
          })}
        </ul>
      );
      break;
    case "li":
      return (
        <li key={key}>
          {lineDescription.children?.map((e,i) => {
            return renderComponent({lineDescription: e, key: i.toString()});
          })}
        </li>
      )
    default:
      return <></>
  }
}
export default KaTeXRenderer;
