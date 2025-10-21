import React, { useState, useEffect } from 'react';
import { AIComponentProps } from '@frontai/types';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button, TablePagination
} from '@mui/material';

interface User {
  id: number;
  name: string;
  email: string;
  company: {
    name: string;
  };
}

const UsersTable: React.FC<AIComponentProps> = ({
                                                 setFurtherInstructions,
                                               }: AIComponentProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [usersPerPage, setUsersPerPage] = useState(5);

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/users`
      );
      const data = await response.json();
      setUsers(data);
      setTotalPages(Math.ceil(data.length / usersPerPage));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const getCurrentPageUsers = () => {
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    return users.slice(startIndex, endIndex);
  };

  const onUserSelect = (userId: number) => {
    if (setFurtherInstructions)
      setFurtherInstructions(
        `Please show me details for user with Id ${userId}`
      );
  };
  const handleChangePage = (event: unknown, newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setUsersPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0); // Reset to first page
    setTotalPages(Math.ceil(users.length / parseInt(event.target.value, 10)));
  };

  return (
    <div className="w-full">
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell className="font-semibold">Name</TableCell>
              <TableCell className="font-semibold">Email</TableCell>
              <TableCell className="font-semibold">Company</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getCurrentPageUsers().map((user) => (
              <TableRow
                key={user.id}
                hover
                onClick={() => onUserSelect(user.id)}
                className="cursor-pointer"
              >
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.company.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={users.length}
        page={currentPage}
        onPageChange={handleChangePage}
        rowsPerPage={usersPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 15]}
      />
      <div className="flex justify-between items-center mt-4">
        <Button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          variant="contained"
          color="primary"
        >
          Previous
        </Button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <Button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          variant="contained"
          color="primary"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default UsersTable;
