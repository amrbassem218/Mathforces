import React, { PureComponent } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  {
    name: 'Page A',
    current: 4000,
    goal: 2400,
    amt: 2400,
  },
  {
    name: 'Page B',
    current: 3000,
    goal: 1398,
    amt: 2210,
  },
  {
    name: 'Page C',
    current: 2000,
    goal: 9800,
    amt: 2290,
  },
  {
    name: 'Page D',
    current: 2780,
    goal: 3908,
    amt: 2000,
  },
  {
    name: 'Page E',
    current: 1890,
    goal: 4800,
    amt: 2181,
  },
  {
    name: 'Page F',
    current: 2390,
    goal: 3800,
    amt: 2500,
  },
  {
    name: 'Page G',
    current: 3490,
    goal: 4300,
    amt: 2100,
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
            {/* <YAxis/> */}
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="goal" stroke="#8884d8" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="current" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
}
