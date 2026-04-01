import { Box, Typography, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';

export function About() {
  const { t } = useTranslation();

  return (
    <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
      <Paper sx={{ p: 4, maxWidth: 600, width: '100%', textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('app_name')}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {t('welcome')}
        </Typography>
        <Typography variant="body2" sx={{ mt: 2 }}>
          {/* @ts-expect-error - The api might not be perfectly typed if app version is injected */}
          {t('version', { version: window.api?.versions?.app || '1.0.0' })}
        </Typography>
        
        <Box sx={{ mt: 4, pt: 2, borderTop: 1, borderColor: 'divider', textAlign: 'left' }}>
          <Typography variant="subtitle2" gutterBottom>
            Environment:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Node: {window.api?.versions?.node}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Chrome: {window.api?.versions?.chrome}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Electron: {window.api?.versions?.electron}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
