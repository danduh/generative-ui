import React from 'react';
import { getFlagUrlFromCurrency } from '@frontai/api-library';
import { AIComponentProps } from '@frontai/types';
import { Summary } from '../app/components/Summary';
import { CoPilotInfo } from '../app/components/CoPilotInfo';

// Example balance data
const balances = [
  { currency: 'USD', amount: 4000.0 },
  {
    currency: 'EUR',
    amount: 3500.5,
  }, // Add more balances as needed
];

export const BalancesView: React.FC<AIComponentProps> = (r) => {
  console.log('BalancesView', r)
  const totalFunds = balances.reduce((sum, balance) => sum + balance.amount, 0);

  return (
    <>
      <div className="p-5 font-sans">
        <h3 className="text-lg font-bold">Balances</h3>
        <p>Total funds in all balances: {totalFunds.toFixed(2)} USD</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {balances.map((balance, index) => (
            <div
              key={index}
              className="flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <img
                src={getFlagUrlFromCurrency(balance.currency)}
                alt={`${balance.currency} flag`}
                className="w-10 h-10 rounded-full mr-4"
              />
              <span className="text-xl">
                {balance.amount.toFixed(2)} {balance.currency}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="p-5 font-sans">
        <Summary></Summary>
        <CoPilotInfo></CoPilotInfo>
      </div>
    </>
  );
};

export default BalancesView;
