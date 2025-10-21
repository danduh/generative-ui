import React from 'react';
import { AIComponentProps } from '@frontai/types';
import ReactMarkdown from 'react-markdown';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from '@mui/material';
import { convertToPlain } from '@frontai/api-library';

const ContextDisplay: React.FC<AIComponentProps> = ({
  intent,
  setFurtherInstructions,
}) => {
  const { context } = intent;
  if (!context) return null;

  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <h2 className="text-2xl font-bold text-primary mb-4">Context</h2>
      <div>
        <h3 className="text-lg font-semibold text-secondary mb-2">Citations</h3>
        {context.citations.map((citation: any, index: number) => (
          <div key={index}>
            <Accordion>
              <AccordionSummary
                aria-controls="panel1-content"
                id={`panels_${index}`}
              >
                <Typography component="span">
                  {citation.title || 'Untitled'}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <ReactMarkdown
                  components={{
                    a: ({ node, ...props }) => (
                      <a {...props} className="text-blue-500 hover:underline" />
                    ),
                  }}
                >
                  {convertToPlain(citation.content)}
                </ReactMarkdown>
              </AccordionDetails>
            </Accordion>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContextDisplay;
