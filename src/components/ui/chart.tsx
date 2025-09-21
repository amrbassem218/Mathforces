import React, { PureComponent } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  {
    name: 'Page A',
    current: 41,
    goal: 55,
  },
  {
    name: 'Page B',
    current: 49,
    goal: 60,
  },
  {
    name: 'Page C',
    current: 58,
    goal: 64,
  },
  {
    name: 'Page D',
    current: 46,
    goal: 59,
  },
  {
    name: 'Page E',
    current: 62, // one of the rare times user exceeds
    goal: 60,
  },
  {
    name: 'Page F',
    current: 52,
    goal: 67,
  },
  {
    name: 'Page G',
    current: 38,
    goal: 50,
  },
  
];

export function Chart() {
    return (
      <div className='w-full h-40 flex justify-center'>
        <ResponsiveContainer width="120%" height="100%" className={'flex justify-center'}>
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            {/* <XAxis dataKey="name" /> */}
            <YAxis domain={[30, 70]} hide/>
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="goal" stroke="#8884d8" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="current" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
}
