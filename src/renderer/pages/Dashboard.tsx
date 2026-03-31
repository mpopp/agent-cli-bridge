import React from 'react'
import { Typography, Box, Paper, List, ListItem, ListItemText } from '@mui/material'
import { useTranslation } from 'react-i18next'

export function Dashboard() {
  const { t } = useTranslation()

  const versions = window.api?.versions || {
    node: 'Unknown',
    chrome: 'Unknown',
    electron: 'Unknown',
    app: 'Unknown'
  }

  return (
    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h4" component="h1">
        {t('app_name')}
      </Typography>
      <Typography variant="body1">{t('welcome')}</Typography>

      <Paper sx={{ mt: 4, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          System Information
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="App Version" secondary={versions.app} />
          </ListItem>
          <ListItem>
            <ListItemText primary="Node.js" secondary={versions.node} />
          </ListItem>
          <ListItem>
            <ListItemText primary="Chromium" secondary={versions.chrome} />
          </ListItem>
          <ListItem>
            <ListItemText primary="Electron" secondary={versions.electron} />
          </ListItem>
        </List>
      </Paper>
    </Box>
  )
}
