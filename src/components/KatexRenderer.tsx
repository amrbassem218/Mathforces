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
    .replace(/\\choose/g, '\\binom')
    .replace(/\\CC/g, '\\mathbb{C}')
    .replace(/\\RR/g, '\\mathbb{R}')
    .replace(/\\QQ/g, '\\mathbb{Q}')
    .replace(/\\ZZ/g, '\\mathbb{Z}')
    .replace(/\\NN/g, '\\mathbb{N}')
    .replace(/\\PP/g, '\\mathbb{P}')
    .replace(/\\FF/g, '\\mathbb{F}')
    .replace(/\\HH/g, '\\mathbb{H}')
    .replace(/\\OO/g, '\\mathbb{O}')
    .replace(/\\AA/g, '\\mathbb{A}')
    .replace(/\\BB/g, '\\mathbb{B}')
    .replace(/\\DD/g, '\\mathbb{D}')
    .replace(/\\EE/g, '\\mathbb{E}')
    .replace(/\\GG/g, '\\mathbb{G}')
    .replace(/\\II/g, '\\mathbb{I}')
    .replace(/\\JJ/g, '\\mathbb{J}')
    .replace(/\\KK/g, '\\mathbb{K}')
    .replace(/\\LL/g, '\\mathbb{L}')
    .replace(/\\MM/g, '\\mathbb{M}')
    .replace(/\\SS/g, '\\mathbb{S}')
    .replace(/\\TT/g, '\\mathbb{T}')
    .replace(/\\UU/g, '\\mathbb{U}')
    .replace(/\\VV/g, '\\mathbb{V}')
    .replace(/\\WW/g, '\\mathbb{W}')
    .replace(/\\XX/g, '\\mathbb{X}')
    .replace(/\\YY/g, '\\mathbb{Y}')
    .replace(/\\ZZ/g, '\\mathbb{Z}')
    .replace(/\{\{([^}]+)\}\\binom\s*\{([^}]+)\}\}/g, '\\binom{$1}{$2}')
    .replace(/\{\{([^}]+)\}\\binom\s*([^{}\s]+)\}/g, '\\binom{$1}{$2}')
    .replace(/\{([^{}]+)\\binom\{([^}]+)\}\}/g, '$1\\binom{$1}{$2}')
    .replace(/\{([^{}]+)\\binom([^{}\s]+)\}/g, '$1\\binom{$1}{$2}')
    .replace(/\{([^{}]+)\\binom\{-1\}\}/g, '$1\\binom{$1}{-1}')
    .replace(/\\noindent/g, '')
    .replace(/\\emph\{([^}]+)\}/g, '<em>$1</em>')
    .replace(/\\textit\{([^}]+)\}/g, '<em>$1</em>')
    .replace(/\\url\{([^}]+)\}/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
    try {
      useEffect(()=>{
          
        if(element.current){
          try {
            renderMathInElement(element.current, {
              delimiters: [
                {left: "$$", right: "$$", display: true},
                {left: "$", right: "$", display: false},
                {left: "``", right: "''", display: false},
                {left: "\\[", right: "\\]", display: true},
                {left: "\\(", right: "\\)", display: false}
              ],
              throwOnError: false,
              errorColor: '#cc0000'
            })
          } catch (error) {
            console.warn('KaTeX rendering error:', error);
          }
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
