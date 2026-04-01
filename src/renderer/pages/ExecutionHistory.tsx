import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { HistoryTable } from '../components/HistoryTable';
import { ExecutionLogEntry, ExecutionFilter } from '../../types/ipc';

export function ExecutionHistory() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<ExecutionLogEntry[]>([]);
  const [statusFilter, setStatusFilter] = useState<ExecutionFilter['status']>('all');
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const limit = 50;

  const fetchLogs = async (reset = false) => {
    try {
      setLoading(true);
      const currentOffset = reset ? 0 : offset;
      const newLogs = await window.api.executionHistory.getLogs({
        limit,
        offset: currentOffset,
        status: statusFilter
      });
      
      if (reset) {
        setLogs(newLogs);
      } else {
        setLogs(prev => [...prev, ...newLogs]);
      }
      
      setOffset(currentOffset + newLogs.length);
      setHasMore(newLogs.length === limit);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(true);
  }, [statusFilter]);

  const handleClear = async () => {
    try {
      const success = await window.api.executionHistory.clearLogs();
      if (success) {
        setLogs([]);
        setOffset(0);
        setHasMore(false);
      }
    } catch (error) {
      console.error('Failed to clear logs:', error);
    } finally {
      setClearDialogOpen(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {t('history.title')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="status-filter-label">{t('history.col_status')}</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              label={t('history.col_status')}
              onChange={(e) => setStatusFilter(e.target.value as ExecutionFilter['status'])}
            >
              <MenuItem value="all">{t('history.filter_all')}</MenuItem>
              <MenuItem value="executed">{t('history.filter_executed')}</MenuItem>
              <MenuItem value="blocked">{t('history.filter_blocked')}</MenuItem>
            </Select>
          </FormControl>
          <Button 
            variant="outlined" 
            color="error" 
            onClick={() => setClearDialogOpen(true)}
            disabled={logs.length === 0 && !loading}
          >
            {t('history.clear_history')}
          </Button>
        </Box>
      </Box>

      {logs.length === 0 && !loading ? (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
          {t('history.empty_state')}
        </Typography>
      ) : (
        <HistoryTable logs={logs} />
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {hasMore && !loading && logs.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button variant="text" onClick={() => fetchLogs()}>
            {t('history.load_more')}
          </Button>
        </Box>
      )}

      <Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)}>
        <DialogTitle>{t('history.clear_confirm_title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('history.clear_confirm_text')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)}>{t('history.clear_confirm_no')}</Button>
          <Button onClick={handleClear} color="error" autoFocus>
            {t('history.clear_confirm_yes')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
