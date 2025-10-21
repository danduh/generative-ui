import React, { useState } from 'react';

export const CoPilotInfoTransactions: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="p-6 max-w-xlg border border-[#9468E3] bg-[#F3EEFF] rounded-lg shadow-md mt-6">
      <h2 className="text-lg font-semibold text-gray-800 flex items-center">
        High FX Fees? Reduce Unnecessary Conversion Costs
      </h2>

      <button
        className="text-blue-600 underline mt-2 text-left text-sm"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? "Hide Info" : "Click for more info"}
      </button>

      {isExpanded && (
        <>
          <div className="text-gray-600 mt-3 text-left text-sm">
            <p>🔍 <strong>Insight:</strong> Some of your transactions involve currency conversion, which can add hidden costs. If you're regularly paying in different currencies, you might be losing money on conversion fees.</p>

            <p className="mt-3">💡 <strong>Optimize Your Costs:</strong></p>
            <ul className="list-disc list-inside">
              <li>✔ Pay in the same currency whenever possible to minimize fees</li>
              <li>✔ Consider holding multiple currency balances to avoid repeated conversions</li>
              <li>✔ Review exchange rate trends before making large payments</li>
            </ul>

            <p className="mt-3">🔎 Check if your expenses align with your currency holdings!</p>
          </div>
        </>
      )}
    </div>
  );
};

export default CoPilotInfoTransactions;
