import React, { useState } from 'react';

export const CoPilotInfo: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="p-6 max-w-xlg border border-[#9468E3] bg-[#F3EEFF] rounded-lg shadow-md">
      <h2 className="text-lg font-semibold text-gray-800 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="mr-2"
        >
          <g clipPath="url(#clip0_2867_346)">
            <path
              d="M7.07627 11.8641L7.66133 10.5239C8.18207 9.33139 9.11927 8.38206 10.2883 7.86313L11.8988 7.14826C12.4108 6.92099 12.4108 6.17611 11.8988 5.94884L10.3386 5.25629C9.13947 4.72401 8.18547 3.73953 7.67367 2.50629L7.081 1.07815C6.86107 0.548169 6.12879 0.548171 5.90887 1.07815L5.31618 2.50627C4.80438 3.73953 3.85035 4.72401 2.65123 5.25629L1.09105 5.94884C0.579024 6.17611 0.579024 6.92099 1.09105 7.14826L2.70153 7.86313C3.87059 8.38206 4.80781 9.33139 5.3285 10.5239L5.9136 11.8641C6.13851 12.3791 6.85133 12.3791 7.07627 11.8641ZM12.9343 15.1269L13.0988 14.7498C13.3921 14.0774 13.9205 13.542 14.5797 13.2491L15.0866 13.0239C15.3608 12.9021 15.3608 12.5036 15.0866 12.3818L14.6081 12.1691C13.9319 11.8687 13.3941 11.3135 13.1057 10.6183L12.9368 10.2107C12.819 9.92673 12.4263 9.92673 12.3085 10.2107L12.1396 10.6183C11.8513 11.3135 11.3135 11.8687 10.6373 12.1691L10.1587 12.3818C9.8846 12.5036 9.8846 12.9021 10.1587 13.0239L10.6657 13.2491C11.3249 13.542 11.8532 14.0774 12.1465 14.7498L12.3111 15.1269C12.4315 15.403 12.8138 15.403 12.9343 15.1269Z"
              fill="#9468E3"
            />
          </g>
          <defs>
            <clipPath id="clip0_2867_346">
              <rect width="16" height="16" fill="white"></rect>
            </clipPath>
          </defs>
        </svg>
        Optimize Your Currency Exchange Costs
      </h2>

      <button
        className="text-blue-600 underline mt-2 text-left text-sm"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? "Hide Info" : "Click for more info"}
      </button>

      {isExpanded && (
        <>
          <p className="text-gray-600 mt-3 text-left text-sm">
            We’ve noticed that some of your payments involve currency conversion.
            By using a <strong>Payoneer card</strong> in the currency of your
            expenses (USD, EUR, GBP, CAD), you can{' '}
            <strong>avoid unnecessary conversion fees</strong> and keep more of
            your earnings.
          </p>

          <div className="mt-5 bg-blue-100 p-4 rounded-lg text-left text-sm">
            <h3 className="text-base font-semibold text-blue-800">
              💡 Exclusive Offer:
            </h3>
            <p className="text-blue-700 mt-1">
              Use your Payoneer card to{' '}
              <strong>pay directly from your balance</strong> and save money on FX
              fees. Plus, enjoy <strong>global acceptance</strong> with
              Mastercard®.
            </p>
          </div>

          <button className="mt-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition">
            Get Your Payoneer Card
          </button>
        </>
      )}
    </div>
  );
};
