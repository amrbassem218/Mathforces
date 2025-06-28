import { DocumentData } from 'firebase/firestore';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { lineDescription } from 'types';
import { renderComponent } from '../KatexRenderer';
import { Button } from './button';

interface ILimitBlurProps {
    height: string;
    content: React.ReactElement;
    key: string;
}

const LimitBlur: React.FunctionComponent<ILimitBlurProps> = ({content, height}) => {
    const [readmore, setReadmore] = useState<boolean>(false);
    console.log(height)
  return (
    <div className='relative'>
        <div className={`${readmore == false ? `${height}` : ""} overflow-hidden relative w-full`}>
            {content}
            {readmore == false ?
            <>
            <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-background dark:from-black to-transparent pointer-events-none" />
            <div className='absolute top-3 flex justify-center w-full z-10'>
                <Button variant={'link'} className='underline m-0 p-0 top-0' onClick={() => setReadmore(!readmore)}>{readmore ? "Show less" : "Show more"}</Button>
            </div>
            </>
            : <Button variant={'link'} className='underline m-0 p-0 top-0' onClick={() => setReadmore(!readmore)}>{readmore ? "Show less" : "Show more"}</Button>
            }
        </div>
    </div>
  );
};

export default LimitBlur;
