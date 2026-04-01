import { Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ExecutionLogEntry } from '../../../types/ipc';

interface StatusChipProps {
  status: ExecutionLogEntry['status'];
}

export function StatusChip({ status }: StatusChipProps) {
  const { t } = useTranslation();
  
  let color: 'success' | 'error' | 'warning' | 'default' = 'default';
  let label = status;

  switch (status) {
    case 'executed':
      color = 'success';
      label = t('history.status_executed');
      break;
    case 'blocked':
      color = 'error';
      label = t('history.status_blocked');
      break;
    case 'running':
      color = 'warning';
      label = t('history.status_running');
      break;
  }

  return <Chip label={label} color={color} size="small" />;
}
