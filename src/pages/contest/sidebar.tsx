import { Card } from '@/components/ui/card';
import LimitBlur from '@/components/ui/limitBlur';
import * as React from 'react';
import { formattedRule } from '../../../utilities';

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
    <ul className='list-disc'>
      <li className='rule text-left'>
          {guidelines.map((rule) => (
            <p>{formattedRule(rule)}</p>
          ))}
       </li>
    </ul>
  )
  return (
    <div>
        <Card className='border-border'>
            <LimitBlur 
            content={guidelinesElement}
            height='h-15'
            key={'rules'}/>
        </Card>
    </div>
  );
};

export default SideBar;
