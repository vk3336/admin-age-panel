"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Card, CardContent, Typography, Box, Avatar, Switch, FormControlLabel, TextField, Button, Divider, Alert
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import PaletteIcon from '@mui/icons-material/Palette';
import { cachedFetch } from '../../utils/performance';

interface Settings {
  notifications: boolean;
  darkMode: boolean;
  autoSave: boolean;
  emailAlerts: boolean;
  theme: string;
  language: string;
}

const SettingsSection = React.memo(({ 
  title, 
  icon, 
  children 
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <Card sx={{ mb: 3, borderRadius: 3, background: 'rgba(255,255,255,0.8)', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
    <CardContent>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Avatar sx={{ bgcolor: 'primary.main', color: 'white', width: 40, height: 40 }}>
          {icon}
        </Avatar>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#333' }}>
          {title}
        </Typography>
      </Box>
      {children}
    </CardContent>
  </Card>
));

SettingsSection.displayName = 'SettingsSection';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    notifications: true,
    darkMode: false,
    autoSave: true,
    emailAlerts: false,
    theme: 'light',
    language: 'en'
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSettingChange = useCallback((key: keyof Settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setLoading(false);
    }
  }, [settings]);

  const titleStyle = useMemo(() => ({
    fontWeight: 700,
    letterSpacing: 1,
    background: 'linear-gradient(90deg,#396afc,#2948ff)',
    WebkitBackgroundClip: 'text' as const,
    WebkitTextFillColor: 'transparent' as const
  }), []);

  return (
    <main style={{ padding: 24 }}>
      <Box mb={4} display="flex" alignItems="center" gap={2}>
        <Avatar sx={{ bgcolor: 'primary.main', color: 'white', width: 56, height: 56 }}>
          <SettingsIcon sx={{ fontSize: 32 }} />
        </Avatar>
        <Typography variant="h4" sx={titleStyle}>Settings</Typography>
      </Box>

      {saved && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          Settings saved successfully!
        </Alert>
      )}

      <SettingsSection title="Notifications" icon={<NotificationsIcon />}>
        <Box display="flex" flexDirection="column" gap={2}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.notifications}
                onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                color="primary"
              />
            }
            label="Enable push notifications"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.emailAlerts}
                onChange={(e) => handleSettingChange('emailAlerts', e.target.checked)}
                color="primary"
              />
            }
            label="Email alerts for important updates"
          />
        </Box>
      </SettingsSection>

      <SettingsSection title="Appearance" icon={<PaletteIcon />}>
        <Box display="flex" flexDirection="column" gap={3}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.darkMode}
                onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                color="primary"
              />
            }
            label="Dark mode"
          />
          <TextField
            select
            label="Theme"
            value={settings.theme}
            onChange={(e) => handleSettingChange('theme', e.target.value)}
            fullWidth
            sx={{ maxWidth: 300 }}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </TextField>
        </Box>
      </SettingsSection>

      <SettingsSection title="General" icon={<SettingsIcon />}>
        <Box display="flex" flexDirection="column" gap={2}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.autoSave}
                onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                color="primary"
              />
            }
            label="Auto-save changes"
          />
          <TextField
            select
            label="Language"
            value={settings.language}
            onChange={(e) => handleSettingChange('language', e.target.value)}
            fullWidth
            sx={{ maxWidth: 300 }}
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </TextField>
        </Box>
      </SettingsSection>

      <SettingsSection title="Security" icon={<SecurityIcon />}>
        <Box display="flex" flexDirection="column" gap={2}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Security settings and preferences
          </Typography>
          <Button variant="outlined" color="primary" sx={{ alignSelf: 'flex-start' }}>
            Change Password
          </Button>
          <Button variant="outlined" color="secondary" sx={{ alignSelf: 'flex-start' }}>
            Two-Factor Authentication
          </Button>
        </Box>
      </SettingsSection>

      <Box display="flex" gap={2} mt={4}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={loading}
          sx={{ fontWeight: 700, borderRadius: 3, px: 4, py: 1.5, fontSize: 16 }}
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
        <Button
          variant="outlined"
          onClick={() => setSettings({
            notifications: true,
            darkMode: false,
            autoSave: true,
            emailAlerts: false,
            theme: 'light',
            language: 'en'
          })}
          sx={{ fontWeight: 700, borderRadius: 3, px: 4, py: 1.5, fontSize: 16 }}
        >
          Reset to Default
        </Button>
      </Box>
    </main>
  );
} 