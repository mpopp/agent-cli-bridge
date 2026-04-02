import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Collapse,
  Box,
  Typography,
  IconButton
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { ExecutionLogEntry } from '../../types/ipc';
import { StatusChip } from './StatusChip';

interface HistoryTableProps {
  logs: ExecutionLogEntry[];
}

function Row({ row }: { row: ExecutionLogEntry }) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }} hover onClick={() => setOpen(!open)} style={{ cursor: 'pointer' }}>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={(e) => { e.stopPropagation(); setOpen(!open); }}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell>
          <StatusChip status={row.status} />
        </TableCell>
        <TableCell>
          <Tooltip title={row.command} placement="top" arrow>
            <span style={{ 
              display: 'inline-block', 
              maxWidth: '300px', 
              whiteSpace: 'nowrap', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis' 
            }}>
              {row.command}
            </span>
          </Tooltip>
        </TableCell>
        <TableCell>{new Date(row.timestamp).toLocaleString()}</TableCell>
        <TableCell>{row.duration ?? '-'}</TableCell>
        <TableCell>{row.exitCode ?? '-'}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              {row.status === 'blocked' && (
                <>
                  <Typography variant="subtitle2" gutterBottom component="div">
                    {t('history.detail_block_reason')}
                  </Typography>
                  <Typography variant="body2" color="error" gutterBottom sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', backgroundColor: 'action.hover', p: 1, borderRadius: 1 }}>
                    {row.blockReason}
                  </Typography>
                </>
              )}
              {row.stdoutPreview && (
                <>
                  <Typography variant="subtitle2" gutterBottom component="div" sx={{ mt: 2 }}>
                    {t('history.detail_stdout')}
                  </Typography>
                  <Typography variant="body2" gutterBottom sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', backgroundColor: 'action.hover', p: 1, borderRadius: 1 }}>
                    {row.stdoutPreview}
                  </Typography>
                </>
              )}
              {row.stderrPreview && (
                <>
                  <Typography variant="subtitle2" gutterBottom component="div" sx={{ mt: 2 }}>
                    {t('history.detail_stderr')}
                  </Typography>
                  <Typography variant="body2" color="error" gutterBottom sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', backgroundColor: 'action.hover', p: 1, borderRadius: 1 }}>
                    {row.stderrPreview}
                  </Typography>
                </>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export function HistoryTable({ logs }: HistoryTableProps) {
  const { t } = useTranslation();

  return (
    <TableContainer component={Paper}>
      <Table aria-label="execution history table">
        <TableHead>
          <TableRow>
            <TableCell style={{ width: 40 }} />
            <TableCell>{t('history.col_status')}</TableCell>
            <TableCell>{t('history.col_command')}</TableCell>
            <TableCell>{t('history.col_time')}</TableCell>
            <TableCell>{t('history.col_duration')}</TableCell>
            <TableCell>{t('history.col_exit_code')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.map((log) => (
            <Row key={log.id} row={log} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
