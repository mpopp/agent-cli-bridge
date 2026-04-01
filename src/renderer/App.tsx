import React from 'react'
import { Outlet } from '@tanstack/react-router'
import { CssBaseline, ThemeProvider, createTheme, Box } from '@mui/material'
import { Sidebar } from './components/Sidebar'

const theme = createTheme({
  palette: {
    mode: 'dark'
  }
})

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  )
}
