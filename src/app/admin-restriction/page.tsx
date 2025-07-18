"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
  Alert,
  MenuItem,
  FormControl,
  Select,
} from "@mui/material";
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import SearchIcon from '@mui/icons-material/Search';
import CircularProgress from '@mui/material/CircularProgress';
import Checkbox from '@mui/material/Checkbox';

const AdminRestrictionPage = () => {
  // All hooks at the top
  // Remove backend and super admin logic
  // Only show emails from NEXT_PUBLIC_ALLOW_EMAIL
  const allowedEmails: string[] = (process.env.NEXT_PUBLIC_ALLOW_EMAIL || '').split(',').map(e => e.trim()).filter(Boolean);
  // Load permissions from localStorage if present
  const getInitialAdmins = () => {
    const perms = (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('admin-permissions') || '{}') : {});
    return allowedEmails.map(email => ({
      email,
      filterPermission: perms[email]?.filterPermission || 'denied',
      productPermission: perms[email]?.productPermission || 'denied',
      seoPermission: perms[email]?.seoPermission || 'denied',
    }));
  };
  const [admins, setAdmins] = useState(getInitialAdmins);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('admin-email');
      const superAdmin = process.env.NEXT_PUBLIC_SUPER_ADMIN;
      setIsSuperAdmin(Boolean(email && superAdmin && email === superAdmin));
    }
  }, []);

  // Save permissions to localStorage whenever admins change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const perms: { [key: string]: { filterPermission: string; productPermission: string; seoPermission: string } } = {};
      admins.forEach(a => {
        perms[a.email] = {
          filterPermission: a.filterPermission,
          productPermission: a.productPermission,
          seoPermission: a.seoPermission,
        };
      });
      localStorage.setItem('admin-permissions', JSON.stringify(perms));
    }
  }, [admins]);

  if (isSuperAdmin === null) {
    return <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #e3f2fd 0%, #fce4ec 100%)' }}><CircularProgress /></Box>;
  }
  if (!isSuperAdmin) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #e3f2fd 0%, #fce4ec 100%)' }}>
        <Paper elevation={6} sx={{ p: 4, borderRadius: 5, background: 'rgba(255,255,255,0.95)' }}>
          <Typography variant="h4" color="error" fontWeight={800} align="center" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" align="center">
            You are not the super admin.
          </Typography>
        </Paper>
      </Box>
    );
  }

  // Handle checkbox change (frontend only)
  const handlePermissionChange = (email: string, type: 'filterPermission' | 'productPermission' | 'seoPermission', value: 'full' | 'view' | 'denied') => {
    setAdmins(prev => prev.map(a =>
      a.email === email ? { ...a, [type]: value } : a
    ));
  };

  return (
    <Box sx={{ p: 0 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#2c3e50' }}>
            Admin Restriction
          </Typography>
          <Chip
            label={`Total Admins: ${admins.length}`}
            color="primary"
            variant="filled"
            sx={{ fontWeight: 600, fontSize: 16, px: 2, py: 1, bgcolor: '#3498db', color: 'white' }}
          />
        </Box>
        <Typography variant="body1" sx={{ color: '#7f8c8d', fontSize: '16px' }}>
          Manage permissions for each admin below
        </Typography>
      </Box>

      {/* Main Content */}
      <Paper sx={{
        p: 3,
        borderRadius: '12px',
        background: '#fff',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        border: '1px solid #ecf0f1',
        mb: 4
      }}>
        <Box mb={3}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <b>Legend:</b> <FilterAltIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} /> Allow Filter —
            <span style={{ marginLeft: 8, marginRight: 8 }}></span>
            <Inventory2Icon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} /> Allow Product
            <span style={{ marginLeft: 8, marginRight: 8 }}></span>
            <SearchIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} /> Allow SEO
            <span style={{ marginLeft: 16, marginRight: 8 }}></span>
            <Checkbox sx={{ color: 'green', p: 0, verticalAlign: 'middle' }} checked /> = Allowed
            <Checkbox sx={{ color: 'red', p: 0, verticalAlign: 'middle' }} /> = Denied
          </Alert>
        </Box>
        <Box sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', fontWeight: 700, mb: 2, pl: 2, gap: 2, borderBottom: '2px solid #e3f2fd', pb: 1 }}>
            {/* Avatar placeholder for alignment */}
            <Box sx={{ width: 44, height: 44, mr: 2 }} />
            <Box sx={{ width: 220, display: 'flex', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                Admin Email
              </Typography>
            </Box>
            <Box sx={{ width: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FilterAltIcon sx={{ mr: 1, color: '#3498db' }} />
              <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                Allow Filter
              </Typography>
            </Box>
            <Box sx={{ width: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Inventory2Icon sx={{ mr: 1, color: '#3498db' }} />
              <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                Allow Product
              </Typography>
            </Box>
            <Box sx={{ width: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SearchIcon sx={{ mr: 1, color: '#3498db' }} />
              <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                Allow SEO
              </Typography>
            </Box>
          </Box>
          {admins.map((admin, idx) => (
            <Box key={admin.email} mb={2}>
              <Paper
                elevation={1}
                sx={{
                  borderRadius: 3,
                  background: idx % 2 === 0 ? '#f8f9fa' : '#f4f7fa',
                  boxShadow: '0 2px 8px 0 rgba(33,150,243,0.06)',
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Avatar sx={{ bgcolor: idx % 2 === 0 ? 'primary.main' : 'secondary.main', color: '#fff', width: 44, height: 44 }}>
                  <AdminPanelSettingsIcon />
                </Avatar>
                <Box sx={{ width: 220 }}>
                  <Typography variant="body1" fontWeight={700} color="text.primary">
                    {admin.email}
                  </Typography>
                </Box>
                {/* Filter Permission */}
                <Box sx={{ width: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={admin.filterPermission || 'denied'}
                      onChange={e => handlePermissionChange(admin.email, "filterPermission", e.target.value)}
                      sx={{
                        fontWeight: 600,
                        color:
                          admin.filterPermission === 'full'
                            ? '#4caf50'
                            : admin.filterPermission === 'view'
                            ? '#ff9800'
                            : '#f44336',
                      }}
                    >
                      <MenuItem value="full" sx={{ color: '#4caf50', fontWeight: 600 }}>All Access</MenuItem>
                      <MenuItem value="view" sx={{ color: '#ff9800', fontWeight: 600 }}>Only View</MenuItem>
                      <MenuItem value="denied" sx={{ color: '#f44336', fontWeight: 600 }}>No Access</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                {/* Product Permission */}
                <Box sx={{ width: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={admin.productPermission || 'denied'}
                      onChange={e => handlePermissionChange(admin.email, "productPermission", e.target.value)}
                      sx={{
                        fontWeight: 600,
                        color:
                          admin.productPermission === 'full'
                            ? '#4caf50'
                            : admin.productPermission === 'view'
                            ? '#ff9800'
                            : '#f44336',
                      }}
                    >
                      <MenuItem value="full" sx={{ color: '#4caf50', fontWeight: 600 }}>All Access</MenuItem>
                      <MenuItem value="view" sx={{ color: '#ff9800', fontWeight: 600 }}>Only View</MenuItem>
                      <MenuItem value="denied" sx={{ color: '#f44336', fontWeight: 600 }}>No Access</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                {/* SEO Permission */}
                <Box sx={{ width: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={admin.seoPermission || 'denied'}
                      onChange={e => handlePermissionChange(admin.email, "seoPermission", e.target.value)}
                      sx={{
                        fontWeight: 600,
                        color:
                          admin.seoPermission === 'full'
                            ? '#4caf50'
                            : admin.seoPermission === 'view'
                            ? '#ff9800'
                            : '#f44336',
                      }}
                    >
                      <MenuItem value="full" sx={{ color: '#4caf50', fontWeight: 600 }}>All Access</MenuItem>
                      <MenuItem value="view" sx={{ color: '#ff9800', fontWeight: 600 }}>Only View</MenuItem>
                      <MenuItem value="denied" sx={{ color: '#f44336', fontWeight: 600 }}>No Access</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Paper>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminRestrictionPage; 