import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LimitBlur from '@/components/ui/limitBlur';
import * as React from 'react';
import { formattedRule } from '../../../utilities';
import { BookText } from 'lucide-react';

interface ISideBarProps {
}

const SideBar: React.FunctionComponent<ISideBarProps> = (props) => {
  const guidelines = 
  [
    "Round up to the nearest **1/100th**",
    "If there are multiple answers write **all** of them seperated by a **space**",
    "Use period as the decimal point. **DO NOT** use commas",
    "**DO NOT** use commas to seperate between any count of numbers",
    "If the solution contains a greek letter, a symbol other than period **DO NOT** add them"
  ]
  
  const guidelinesElement = (
    <ul className='list-disc mx-6'>
      {guidelines.map((rule, i) => (
        <li className='rule text-left' key={i}>
          {formattedRule(rule)}
       </li>
      ))}
      
    </ul>
  )
  return (
    <div>
        <Card className='border-border bg-primary/60 gap-0 flex flex-col p-0'>
          <CardHeader className='flex gap-2 items-center p-0 ml-2 mb-2 mt-4'>
            <BookText size={27}/>
            <CardTitle className='text-xl text-left '>Submission Manual</CardTitle>
          </CardHeader>
          <div className='flex-grow mb-1'>
            <LimitBlur 
            content={guidelinesElement}
            height='h-25'
            fromColor="from-primary/70"
            toColor="to-transparent"
            buttonStyle="text-red-500 font-bold "
            buttonPlacement='bottom-[-0.75rem] w-full'  
            key={'rules'}/>
          </div>
        </Card>
    </div>
  );
};

export default SideBar;
