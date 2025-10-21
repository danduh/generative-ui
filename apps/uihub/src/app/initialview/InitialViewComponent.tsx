import React, { useEffect, useState } from 'react';
import ButtonGroup from './LinksGroup';
import { TextField, IconButton } from '@mui/material';
import { Search, Add, Send } from '@mui/icons-material';

interface InitialViewComponentProps {
  initMessage: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  initChat: (e: React.FormEvent<HTMLFormElement>) => void;
  setInitMessage: (value: string) => void;
}

const AutoCompletions = {
  pay: [
    'Pay to a recipient`s bank account',
    'Pay to multiple recipient bank accounts',
    'Pay an Amazon Advertising invoice',
    'Pay VAT',
  ],
  show: ['Show my balances', 'Show my transactions', 'Show my users'],
};

const highlightMatch = (text: string, query: string) => {
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<strong>$1</strong>');
};

const InitialViewComponent: React.FC<InitialViewComponentProps> = ({
  setInitMessage,
  initMessage,
  onChange,
  initChat,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [selectedPrefix, setSelectedPrefix] = useState<string>('');

  // let filteredSuggestions: string[] = [];

  const filteredSuggestions =
    initMessage.length >= 3
      ? AutoCompletions['show'].filter((s) =>
        s.toLowerCase().includes(inputValue.toLowerCase())
      )
      : [];


  // useEffect(() => {
  //   console.log(inputValue);
  //   if (
  //     inputValue.length >= 3 &&
  //     AutoCompletions.hasOwnProperty(inputValue.toLowerCase())
  //   ) {
  //     filteredSuggestions = (AutoCompletions as any)[inputValue.toLowerCase()].filter((s: string) =>
  //       s.toLowerCase().includes(inputValue.toLowerCase())
  //     );
  //   }
  //   console.log('filteredSuggestions', filteredSuggestions)
  // }, [inputValue]);



  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (filteredSuggestions.length > 0) {
      if (event.key === 'ArrowDown') {
        setFocusedIndex((prevIndex) => {
          const newIndex = Math.min(
            prevIndex + 1,
            filteredSuggestions.length - 1
          );
          const selectedValue = filteredSuggestions[newIndex];
          setInitMessage(selectedValue);
          return newIndex;
        });
      } else if (event.key === 'ArrowUp') {
        setFocusedIndex((prevIndex) => {
          const newIndex = Math.max(prevIndex - 1, 0);
          const selectedValue = filteredSuggestions[newIndex];
          setInitMessage(selectedValue);
          return newIndex;
        });
      } else if (event.key === 'Enter' && focusedIndex >= 0) {
        event.preventDefault();
        const selectedValue = filteredSuggestions[focusedIndex];
        setInputValue(selectedValue);
        initChat(new Event('submit') as any); // Trigger form submit
      }
    }
  };

  useEffect(() => {
    if (!selectedPrefix) return;
    setInitMessage(selectedPrefix);
  }, [selectedPrefix]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    setFocusedIndex(-1); // Reset focus when input changes
    onChange(event);
  };

  return (
    <div className="flex justify-center items-center h-screen w-screen">
      <div className="relative flex-grow max-w-2xl">
        <h2 className="text-center text-2xl font-semibold mb-4">
          What can I help with?
        </h2>
        <form className="relative">
          <div className="relative flex items-center bg-white p-2 border border-gray-300 rounded-full shadow-md focus-within:ring-2 focus-within:ring-purple-500">
            <TextField
              variant="standard"
              placeholder="Start typing ..."
              value={initMessage}
              autoComplete="off"
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              InputProps={{
                disableUnderline: true,
                className: 'w-full px-4 py-2',
              }}
              className="w-full"
            />
            <IconButton className="text-gray-600">
              <Add />
            </IconButton>
            <IconButton className="text-gray-600">
              <Search />
            </IconButton>
            <IconButton className="bg-black text-white rounded-full p-2">
              <Send />
            </IconButton>
          </div>
        </form>
        {filteredSuggestions.length > 0 && (
          <div className="absolute left-0 z-[1] box-border w-full bg-white">
            {filteredSuggestions.map((suggestion, index) => (
              <p
                key={index}
                className={`text-lg hover:bg-gray-100 p-2 cursor-pointer ${
                  focusedIndex === index ? 'bg-gray-200' : ''
                }`}
                dangerouslySetInnerHTML={{
                  __html: highlightMatch(suggestion, inputValue),
                }}
                onMouseEnter={() => setFocusedIndex(index)}
                onClick={(event) => {
                  console.log('MOUSE CLI')
                  event.preventDefault();
                  setInitMessage(suggestion);
                  // setInputValue(suggestion);
                  initChat(new Event('submit') as any); // Manually trigger submit
                }}
              />
            ))}
          </div>
        )}
        <ButtonGroup setSelectedPrefix={setSelectedPrefix} />
      </div>
    </div>
  );
};

export default InitialViewComponent;
