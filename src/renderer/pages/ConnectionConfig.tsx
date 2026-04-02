import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  Snackbar,
  Chip
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { MaskedApiKey } from '../components/MaskedApiKey'
import type { ServerConfig, ServerStatus } from '../../types/ipc'

export const ConnectionConfig: React.FC = () => {
  const { t } = useTranslation()
  const [config, setConfig] = useState<ServerConfig | null>(null)
  const [serverStatus, setServerStatus] = useState<ServerStatus['status']>('stopped')
  
  const [editAddress, setEditAddress] = useState<string>('127.0.0.1')
  const [editPort, setEditPort] = useState<number>(3000)
  
  const [restartDialogOpen, setRestartDialogOpen] = useState(false)
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false)
  
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null)
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success')

  const fetchConfig = async () => {
    try {
      const data = await window.api.connectionConfig.getConfig()
      setConfig(data)
      setEditAddress(data.address)
      setEditPort(data.port)
      
      const statusData = await window.api.connectionConfig.getServerStatus()
      setServerStatus(statusData.status)
    } catch (err) {
      console.error('Failed to load config', err)
    }
  }

  useEffect(() => {
    fetchConfig()
  }, [])

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message)
    setSnackbarSeverity(severity)
  }

  const handleSaveNetwork = () => {
    if (editPort < 1024 || editPort > 65535) {
      showSnackbar(t('connection.save_error', { error: 'Port must be between 1024 and 65535' }), 'error')
      return
    }
    setRestartDialogOpen(true)
  }

  const confirmRestart = async () => {
    setRestartDialogOpen(false)
    try {
      const success = await window.api.connectionConfig.saveNetworkConfig({ address: editAddress, port: editPort })
      if (success) {
        showSnackbar(t('connection.save_success'), 'success')
        await fetchConfig()
      } else {
        showSnackbar(t('connection.save_error', { error: 'Unknown error' }), 'error')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Port might be in use'
      showSnackbar(t('connection.save_error', { error: errorMessage }), 'error')
    }
  }

  const confirmRegenerate = async () => {
    setRegenerateDialogOpen(false)
    try {
      await window.api.connectionConfig.regenerateApiKey()
      showSnackbar(t('connection.regenerate_success'), 'success')
      await fetchConfig()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      showSnackbar(t('connection.save_error', { error: errorMessage }), 'error')
    }
  }

  if (!config) return <Box p={3}><Typography>Loading...</Typography></Box>

  return (
    <Box p={3} sx={{ maxWidth: 800, margin: '0 auto' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">{t('connection.title')}</Typography>
        <Chip
          label={t(`connection.status_${serverStatus}`)}
          color={serverStatus === 'running' ? 'success' : serverStatus === 'error' ? 'error' : 'default'}
        />
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>{t('connection.network_settings')}</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label={t('connection.address_label')}
              value={editAddress}
              onChange={(e) => setEditAddress(e.target.value)}
            >
              <MenuItem value="127.0.0.1">{t('connection.address_local')}</MenuItem>
              <MenuItem value="0.0.0.0">{t('connection.address_all')}</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label={t('connection.port_label')}
              value={editPort}
              onChange={(e) => setEditPort(parseInt(e.target.value, 10))}
              InputProps={{ inputProps: { min: 1024, max: 65535 } }}
            />
          </Grid>
          {editAddress === '0.0.0.0' && (
            <Grid item xs={12}>
              <Alert severity="warning">{t('connection.address_warning')}</Alert>
            </Grid>
          )}
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveNetwork}
              disabled={editAddress === config.address && editPort === config.port}
            >
              {t('connection.save_button')}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>{t('connection.api_key_settings')}</Typography>
        <MaskedApiKey apiKey={config.apiKey} />
        <Button variant="outlined" color="warning" onClick={() => setRegenerateDialogOpen(true)}>
          {t('connection.regenerate_button')}
        </Button>
      </Paper>

      <Dialog open={restartDialogOpen} onClose={() => setRestartDialogOpen(false)}>
        <DialogTitle>{t('connection.restart_confirm_title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('connection.restart_confirm_text')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestartDialogOpen(false)}>{t('connection.restart_confirm_no')}</Button>
          <Button onClick={confirmRestart} color="primary" autoFocus>
            {t('connection.restart_confirm_yes')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={regenerateDialogOpen} onClose={() => setRegenerateDialogOpen(false)}>
        <DialogTitle>{t('connection.regenerate_confirm_title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('connection.regenerate_confirm_text')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegenerateDialogOpen(false)}>{t('connection.regenerate_confirm_no')}</Button>
          <Button onClick={confirmRegenerate} color="warning" autoFocus>
            {t('connection.regenerate_confirm_yes')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snackbarMessage}
        autoHideDuration={4000}
        onClose={() => setSnackbarMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarMessage(null)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}
