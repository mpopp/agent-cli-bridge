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
  Chip,
  Select,
  FormControl,
  InputLabel,
  FormHelperText
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { MaskedApiKey } from '../components/MaskedApiKey'
import type { ServerConfig, ServerStatus, TunnelConfig, NewTunnelConfig, UpdateTunnelConfig } from '../../types/ipc'

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

  // Tunnel state
  const [tunnelConfigs, setTunnelConfigs] = useState<TunnelConfig[]>([])
  const [selectedTunnelId, setSelectedTunnelId] = useState<number | ''>('')
  const [tunnelDialogOpen, setTunnelDialogOpen] = useState(false)
  const [tunnelDialogMode, setTunnelDialogMode] = useState<'add' | 'edit'>('add')
  const [tunnelName, setTunnelName] = useState('')
  const [tunnelCommand, setTunnelCommand] = useState('')
  const [tunnelNameError, setTunnelNameError] = useState('')
  const [tunnelCommandError, setTunnelCommandError] = useState('')
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)

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

  const fetchTunnelConfigs = async () => {
    try {
      const configs = await window.api.tunnelConfig.getAll()
      setTunnelConfigs(configs)
      const active = configs.find(c => c.isActive)
      setSelectedTunnelId(active ? active.id : '')
    } catch (err) {
      console.error('Failed to load tunnel configs', err)
    }
  }

  useEffect(() => {
    fetchConfig()
    fetchTunnelConfigs()
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

  // Tunnel handlers
  const openAddDialog = () => {
    setTunnelDialogMode('add')
    setTunnelName('')
    setTunnelCommand('')
    setTunnelNameError('')
    setTunnelCommandError('')
    setTunnelDialogOpen(true)
  }

  const openEditDialog = () => {
    const selected = tunnelConfigs.find(c => c.id === selectedTunnelId)
    if (!selected) return
    setTunnelDialogMode('edit')
    setTunnelName(selected.name)
    setTunnelCommand(selected.command)
    setTunnelNameError('')
    setTunnelCommandError('')
    setTunnelDialogOpen(true)
  }

  const handleTunnelDialogClose = () => {
    setTunnelDialogOpen(false)
  }

  const handleTunnelSave = async () => {
    let valid = true
    if (!tunnelName.trim()) {
      setTunnelNameError(t('tunnel.name_required'))
      valid = false
    } else {
      setTunnelNameError('')
    }
    if (!tunnelCommand.trim()) {
      setTunnelCommandError(t('tunnel.command_required'))
      valid = false
    } else {
      setTunnelCommandError('')
    }
    if (!valid) return

    try {
      if (tunnelDialogMode === 'add') {
        const newConfig: NewTunnelConfig = { name: tunnelName.trim(), command: tunnelCommand.trim() }
        await window.api.tunnelConfig.add(newConfig)
        showSnackbar(t('tunnel.add_success'), 'success')
      } else {
        if (selectedTunnelId === '') return
        const updateConfig: UpdateTunnelConfig = { id: selectedTunnelId, name: tunnelName.trim(), command: tunnelCommand.trim() }
        await window.api.tunnelConfig.update(updateConfig)
        showSnackbar(t('tunnel.update_success'), 'success')
      }
      setTunnelDialogOpen(false)
      await fetchTunnelConfigs()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      showSnackbar(t('tunnel.error_generic', { error: errorMessage }), 'error')
    }
  }

  const handleRemoveClick = () => {
    setRemoveDialogOpen(true)
  }

  const confirmRemove = async () => {
    setRemoveDialogOpen(false)
    if (selectedTunnelId === '') return
    try {
      await window.api.tunnelConfig.remove(selectedTunnelId)
      setSelectedTunnelId('')
      showSnackbar(t('tunnel.remove_success'), 'success')
      await fetchTunnelConfigs()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      showSnackbar(t('tunnel.error_generic', { error: errorMessage }), 'error')
    }
  }

  const handleUseClick = async () => {
    if (selectedTunnelId === '') return
    try {
      await window.api.tunnelConfig.setActive(selectedTunnelId)
      showSnackbar(t('tunnel.use_success'), 'success')
      await fetchTunnelConfigs()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      showSnackbar(t('tunnel.error_generic', { error: errorMessage }), 'error')
    }
  }

  const hasSelection = selectedTunnelId !== ''

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

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>{t('connection.api_key_settings')}</Typography>
        <MaskedApiKey apiKey={config.apiKey} />
        <Button variant="outlined" color="warning" onClick={() => setRegenerateDialogOpen(true)}>
          {t('connection.regenerate_button')}
        </Button>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>{t('tunnel.section_title')}</Typography>
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <FormControl sx={{ minWidth: 240 }}>
            <InputLabel>{t('tunnel.section_title')}</InputLabel>
            <Select
              value={selectedTunnelId}
              label={t('tunnel.section_title')}
              onChange={(e) => setSelectedTunnelId(e.target.value as number | '')}
              displayEmpty
            >
              {tunnelConfigs.map(tc => (
                <MenuItem key={tc.id} value={tc.id}>{tc.name}</MenuItem>
              ))}
            </Select>
            {tunnelConfigs.length === 0 && (
              <FormHelperText>{t('tunnel.empty_state')}</FormHelperText>
            )}
          </FormControl>
          <Button variant="contained" onClick={openAddDialog}>
            {t('tunnel.add_button')}
          </Button>
          <Button variant="outlined" onClick={openEditDialog} disabled={!hasSelection}>
            {t('tunnel.edit_button')}
          </Button>
          <Button variant="outlined" color="error" onClick={handleRemoveClick} disabled={!hasSelection}>
            {t('tunnel.remove_button')}
          </Button>
          <Button variant="contained" color="success" onClick={handleUseClick} disabled={!hasSelection}>
            {t('tunnel.use_button')}
          </Button>
        </Box>
      </Paper>

      {/* Network restart dialog */}
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

      {/* API key regenerate dialog */}
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

      {/* Tunnel add/edit dialog */}
      <Dialog open={tunnelDialogOpen} onClose={handleTunnelDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {tunnelDialogMode === 'add' ? t('tunnel.dialog_title_add') : t('tunnel.dialog_title_edit')}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              fullWidth
              label={t('tunnel.name_label')}
              value={tunnelName}
              onChange={(e) => setTunnelName(e.target.value)}
              error={!!tunnelNameError}
              helperText={tunnelNameError}
              autoFocus
            />
            <TextField
              fullWidth
              label={t('tunnel.command_label')}
              value={tunnelCommand}
              onChange={(e) => setTunnelCommand(e.target.value)}
              error={!!tunnelCommandError}
              helperText={tunnelCommandError}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleTunnelDialogClose}>{t('tunnel.remove_confirm_no')}</Button>
          <Button onClick={handleTunnelSave} variant="contained" color="primary">
            {t('tunnel.save_button')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tunnel remove confirmation dialog */}
      <Dialog open={removeDialogOpen} onClose={() => setRemoveDialogOpen(false)}>
        <DialogTitle>{t('tunnel.remove_confirm_title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('tunnel.remove_confirm_text')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveDialogOpen(false)}>{t('tunnel.remove_confirm_no')}</Button>
          <Button onClick={confirmRemove} color="error" autoFocus>
            {t('tunnel.remove_confirm_yes')}
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
