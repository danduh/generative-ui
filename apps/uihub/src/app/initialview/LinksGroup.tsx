import { Button } from '@mui/material';
import { MoreHoriz } from '@mui/icons-material';
import PaymentsIcon from '@mui/icons-material/Payments';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SavingsIcon from '@mui/icons-material/Savings';
import DashboardIcon from '@mui/icons-material/Dashboard';

const actions = [
  { icon: <PaymentsIcon style={{ color: '#22c55e' }} />, label: 'Pay' },
  {
    icon: <DashboardIcon style={{ color: '#8a243e' }} />,
    label: 'Show',
  },
  {
    icon: <CreditCardIcon style={{ color: '#3b82f6' }} />,
    label: 'Cards',
  },
  { icon: <SavingsIcon style={{ color: '#facc15' }} />, label: 'Budget' }, // {
  { icon: <MoreHoriz />, label: 'More' },
];

export default function ButtonGroup({
  setSelectedPrefix,
}: {
  setSelectedPrefix: any;
}) {
  return (
    <div className="relative flex items-stretch gap-x-2 gap-y-4 overflow-hidden py-2 sm:gap-y-2 xl:gap-x-2.5 xl:gap-y-2.5 flex-wrap justify-center">
      <div style={{ display: 'flex', gap: '8px' }}>
        {actions.map(({ icon, label }, index) => (
          <Button
            key={index}
            variant="outlined"
            startIcon={icon}
            onClick={(e: any) => {
              setSelectedPrefix(label.toLowerCase());
            }}
            style={{
              borderRadius: '9999px',
              padding: '8px 16px',
              textTransform: 'none',
              color: '#4b5563',
              borderColor: '#d1d5db',
              backgroundColor: '#fff',
            }}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}
