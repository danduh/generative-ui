import React from 'react';
import { AIComponentProps } from '@frontai/types';

const UsersTable = React.lazy(() => import('fems/UsersTable'));
const UserDetails = React.lazy(() => import('fems/UserDetails'));
const EditUserForm = React.lazy(() => import('fems/EditUserForm'));
const ContextDisplay = React.lazy(() => import('fems/ContextDisplay'));
const BalancesView = React.lazy(() => import('fems/BalancesView'));
const TransactionsList = React.lazy(() => import('fems/TransactionsList'));
const TransactionDetails = React.lazy(() => import('fems/TransactionDetails'));


const IModulesMap = new Map();
IModulesMap.set('UsersTable', (props: AIComponentProps) => (
  <UsersTable {...props} />
));
IModulesMap.set('UserDetails', (props: AIComponentProps) => (
  <UserDetails {...props} />
));
IModulesMap.set('EditUserForm', (props: AIComponentProps) => (
  <EditUserForm {...props} />
));
IModulesMap.set('ContextDisplay', (props: AIComponentProps) => (
  <ContextDisplay {...props} />
));
IModulesMap.set('BalancesView', (props: AIComponentProps) => (
  <BalancesView {...props} />
));
IModulesMap.set('TransactionsList', (props: AIComponentProps) => (
  <TransactionsList {...props} />
));
IModulesMap.set('TransactionDetails', (props: AIComponentProps) => (
  <TransactionDetails {...props} />
));

export default IModulesMap;
