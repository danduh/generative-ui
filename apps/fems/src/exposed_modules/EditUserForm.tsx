import React, { useState, useEffect } from 'react';
import { AIComponentProps } from '@frontai/types';

interface User {
  id?: number;
  name: string;
  email: string;
  company: {
    name: string;
  };
}

interface EditUserFormProps {
  user?: User;
  onSave: (user: User) => void;
  onCancel: () => void;
}

const EditUserForm: React.FC<AIComponentProps> = ({
  intent,
  setFurtherInstructions,
  mainAction,
}) => {
  const user = intent.parameters as unknown as User;
  console.log(user)
  const [formData, setFormData] = useState<User>({
    name: user.name,
    email: user.email,
    company: user.company || { name: '' },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData: User) => {
      if (name.includes('.')) {
        const [section, field] = name.split('.');

        return {
          ...prevData,
          [section]: {
            ...(prevData[section as keyof User] as object),
            [field]: value,
          },
        };
      }
      return { ...prevData, [name]: value };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // onSave(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
    >
      <h2 className="text-2xl font-bold text-primary mb-6">
        {user ? 'Edit User' : 'Add New User'}
      </h2>

      <div className="mb-4">
        <label
          htmlFor="name"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="email"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <fieldset className="mb-4">
        <legend className="block text-gray-700 text-sm font-bold mb-2">
          Company
        </legend>
        <div className="ml-4">
          <div className="mb-2">
            <label
              htmlFor="company.name"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Name
            </label>
            <input
              type="text"
              id="company.name"
              name="company.name"
              value={formData.company.name}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
        </div>
      </fieldset>

      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
        >
          Save
        </button>
        <button
          type="button"
          // onClick={onCancel}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default EditUserForm;
