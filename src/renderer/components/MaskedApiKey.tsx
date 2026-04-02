import React, { useState, useEffect, useCallback } from 'react'
import { Box, IconButton, InputAdornment, TextField, Tooltip, Snackbar, Alert } from '@mui/material'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import ContentCopy from '@mui/icons-material/ContentCopy'
import { useTranslation } from 'react-i18next'

interface MaskedApiKeyProps {
  apiKey: string
}

export const MaskedApiKey: React.FC<MaskedApiKeyProps> = ({ apiKey }) => {
  const { t } = useTranslation()
  const [showKey, setShowKey] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)

  // Auto-hide after 30 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (showKey) {
      timer = setTimeout(() => {
        setShowKey(false)
      }, 30000)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [showKey])

  const handleTogglePasswordVisibility = () => {
    setShowKey((show) => !show)
  }

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(apiKey)
      setSnackbarOpen(true)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }, [apiKey])

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }
    setSnackbarOpen(false)
  }

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <TextField
        fullWidth
        variant="outlined"
        type={showKey ? 'text' : 'password'}
        label={t('connection.api_key_label')}
        value={apiKey}
        InputProps={{
          readOnly: true,
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip title={showKey ? t('connection.hide_key') : t('connection.show_key')}>
                <IconButton
                  aria-label="toggle api key visibility"
                  onClick={handleTogglePasswordVisibility}
                  edge="end"
                >
                  {showKey ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </Tooltip>
              <Tooltip title={t('connection.copy_key')}>
                <IconButton
                  aria-label="copy api key"
                  onClick={handleCopy}
                  edge="end"
                  sx={{ ml: 1 }}
                >
                  <ContentCopy />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          )
        }}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {t('connection.copy_success')}
        </Alert>
      </Snackbar>
    </Box>
  )
}
