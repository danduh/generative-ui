import React from 'react';
import { AIComponentProps } from '@frontai/types';

const TransactionDetails: React.FC<AIComponentProps> = ({}) => {
  return (
    <div className="w-4/5 max-w-5xl bg-white border border-gray-300 rounded-lg shadow-lg flex">
      {/* Left Panel - Transaction Summary */}
      <div className="w-1/3 bg-blue-600 text-white p-6 flex flex-col items-center justify-center">
        <div className="bg-white p-4 rounded-full mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8c1.5 0 2.5 1 2.5 2.5s-1 2.5-2.5 2.5-2.5-1-2.5-2.5 1-2.5 2.5-2.5zm0 10c-3.5 0-6.5-2.5-7-6h2c.5 2.5 2.5 4 5 4s4.5-1.5 5-4h2c-.5 3.5-3.5 6-7 6z"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold">
          Payment to Amazon Advertising Services Inc
        </h2>
        <p className="text-xl font-bold mt-2">-1,000.00 USD</p>
        <p className="mt-1 text-sm">Completed • 16 Jan 2025</p>
      </div>

      {/* Right Panel - Timeline and Details */}
      <div className="w-2/3 p-6">
        <h3 className="text-lg font-semibold">Transaction Timeline</h3>
        <div className="mt-4 space-y-4">
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500">Estimated deposit date</span>
            <span className="font-semibold">01 Mar 2025</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500">Sent to bank</span>
            <span className="font-semibold">26 Feb 2025</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500">Approved</span>
            <span className="font-semibold">26 Feb 2025</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500">Under review</span>
            <span className="font-semibold">26 Feb 2025</span>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-gray-500 text-sm mt-6">
          <div className="p-6 max-w-xlg border border-[#9468E3] bg-[#F3EEFF] rounded-lg shadow-md">
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
            Reason for delay:
            <p className="text-gray-600 mt-3 text-left text-sm">
              *In certain cases, a transaction may take longer than described
              above, for example, a request outside business hours. If you
              experience a delay of more than <strong>5 days</strong>, contact
              us.
            </p>
          </div>
        </p>

        {/* Action Button */}
        <div className="mt-6">
          <button className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition">
            📄 Notify me when it completed
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetails;
