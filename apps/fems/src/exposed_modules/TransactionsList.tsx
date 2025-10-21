import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Input,
  Button,
} from '@mui/material';
import { AIComponentProps } from '@frontai/types';
import transactions from '../mockdata/transactions.json';
import CoPilotInfoTransactions from '../app/components/CoPilotInfoTransactions'; // Assuming the json is in the same directory

// ... existing code ...

const TransactionsList: React.FC<AIComponentProps> = ({
  setFurtherInstructions,
}) => {
  const inputRef = React.useRef();
  const [selectedText, setSelectedText] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseUp = (event: MouseEvent) => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        console.log(selection.toString().trim());
        // setSelectedText(selection.toString());
        setShowPopup(true);
        setPopupPosition({ x: event.pageX + 5, y: event.pageY + 5 });
        setTimeout(() => {
          if (inputRef?.current) {
            (inputRef.current as any).focus();
          }
        }, 100);
      } else {
        console.log('PROMPT', (inputRef?.current as any).value);
        if (setFurtherInstructions)
          setFurtherInstructions("Question about transaction ID 98..134: " + (inputRef?.current as any).value);
        setShowPopup(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (showPopup && !(event.target as HTMLElement).closest('.popup')) {
        setShowPopup(false);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPopup]);

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Payment To</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction, index) => (
              <TableRow key={index}>
                <TableCell>
                  {new Date(transaction.Date).toLocaleDateString()}
                </TableCell>
                <TableCell>{transaction.Amount.ResParams.Amount}</TableCell>
                <TableCell>{transaction.Status.ResKey}</TableCell>
                <TableCell>{transaction.PaymentTo}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <CoPilotInfoTransactions />
      {showPopup && (
        <div
          className="popup"
          style={{
            position: 'absolute',
            left: popupPosition.x,
            top: popupPosition.y,
            padding: '10px',
            backgroundColor: '#fff',
            boxShadow: '0px 0px 5px rgba(0,0,0,0.2)',
            zIndex: 1000,
          }}
        >
          <h2>Ask PayoPilot about transaction ID "98..134"</h2>
          <Input
            inputRef={inputRef}
            placeholder="Type here ..."
            fullWidth
            onClick={(e) => {
              e.preventDefault();
            }}
          />
          <Button
            variant="outlined"
            color="primary"
            size="small"
            className="mt-2"
          >
            Submit
          </Button>
        </div>
      )}
    </>
  );
};

export default TransactionsList;
