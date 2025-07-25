"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  MenuItem,
  FormControl,
  Select,
  Button,
  TextField,
  IconButton,
  Snackbar,
  InputLabel,
} from "@mui/material";
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import SearchIcon from '@mui/icons-material/Search';
import CircularProgress from '@mui/material/CircularProgress';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import Tooltip from '@mui/material/Tooltip';
import { apiFetch } from "@/utils/apiFetch"; // Import the new apiFetch utility
import { AdminRole } from '../types';

const AdminRestrictionPage = () => {
  const [admins, setAdmins] = useState<AdminRole[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [addForm, setAddForm] = useState({ name: '', email: '', filter: 'all access', product: 'all access', seo: 'all access' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Get super admin email from env
  const superAdmin = process.env.NEXT_PUBLIC_SUPER_ADMIN;

  // Get current admin email from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('admin-email');
      setIsSuperAdmin(Boolean(email && superAdmin && email === superAdmin));
    }
  }, [superAdmin]);

  // Fetch admins from backend
  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/roles`);
      if (!res.ok) throw new Error('Failed to fetch roles');
      const data = await res.json();
      console.log('Fetched admins:', data); // Debug: log backend data
      setAdmins((data as AdminRole[]).map((a: AdminRole) => ({
        ...a,
        filter: ['all access', 'only view', 'no access'].includes((a.filter || '').trim()) ? a.filter.trim() as AdminRole['filter'] : 'no access',
        product: ['all access', 'only view', 'no access'].includes((a.product || '').trim()) ? a.product.trim() as AdminRole['product'] : 'no access',
        seo: ['all access', 'only view', 'no access'].includes((a.seo || '').trim()) ? a.seo.trim() as AdminRole['seo'] : 'no access',
      })));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setSnackbar({ open: true, message, severity: 'error' });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isSuperAdmin) fetchAdmins();
  }, [isSuperAdmin]);

  // Update permission
  const handlePermissionChange = async (id: string, type: 'filter' | 'product' | 'seo', value: string) => {
    const admin = admins.find((a: AdminRole) => a._id === id);
    if (!admin) return;
    const updated = { ...admin, [type]: value };
    try {
      const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/roles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: updated.name,
          email: updated.email,
          filter: ['all access', 'only view', 'no access'].includes(updated.filter) ? updated.filter : 'no access',
          product: ['all access', 'only view', 'no access'].includes(updated.product) ? updated.product : 'no access',
          seo: ['all access', 'only view', 'no access'].includes(updated.seo) ? updated.seo : 'no access',
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update role');
      }
      await fetchAdmins();
      setSnackbar({ open: true, message: 'Permission updated', severity: 'success' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setSnackbar({ open: true, message, severity: 'error' });
    }
  };

  // Add new admin
  const handleAddAdmin = async () => {
    if (!addForm.name || !addForm.email) {
      setSnackbar({ open: true, message: 'Name and email required', severity: 'error' });
      return;
    }
    try {
      const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: addForm.name,
          email: addForm.email,
          filter: addForm.filter,
          product: addForm.product,
          seo: addForm.seo,
        }),
      });
      if (!res.ok) throw new Error('Failed to add admin');
      setAddForm({ name: '', email: '', filter: 'all access', product: 'all access', seo: 'all access' });
      fetchAdmins();
      setSnackbar({ open: true, message: 'Admin added', severity: 'success' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setSnackbar({ open: true, message, severity: 'error' });
    }
  };

  // Delete admin
  const handleDeleteAdmin = async (id: string) => {
    try {
      const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/roles/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete admin');
      setAdmins((prev: AdminRole[]) => prev.filter(a => a._id !== id));
      setSnackbar({ open: true, message: 'Admin deleted', severity: 'success' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setSnackbar({ open: true, message, severity: 'error' });
    }
  };

  if (isSuperAdmin === null || loading) {
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

  return (
    <Box sx={{ p: 0, background: '#f7fafd', minHeight: '100vh' }}>
      {/* Header Section */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#2c3e50', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            Admin Restriction
            <Tooltip title="Refresh">
              <IconButton size="small" color="primary" onClick={fetchAdmins} sx={{ ml: 1 }}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAddAdmin} sx={{ borderRadius: 3, px: 3, py: 1.5, fontWeight: 700, fontSize: 16, boxShadow: '0 2px 8px 0 rgba(33,150,243,0.10)' }}>
            Add Admin
          </Button>
        </Box>
        <Typography variant="body1" sx={{ color: '#7f8c8d', fontSize: '16px' }}>
          Manage permissions for each admin below
        </Typography>
      </Box>

      {/* Add Admin Form */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 4, background: '#fff', boxShadow: '0 2px 12px 0 rgba(33,150,243,0.06)', display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            alignItems: { sm: 'center' },
            justifyContent: 'space-between',
          }}
        >
          <TextField label="Name" size="small" value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} sx={{ minWidth: 160, flex: 1 }} />
          <TextField label="Email" size="small" value={addForm.email} onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))} sx={{ minWidth: 200, flex: 2 }} />
          <FormControl size="small" sx={{ minWidth: 140, flex: 1 }}>
            <InputLabel id="filter-label">Filter Permission</InputLabel>
            <Select labelId="filter-label" label="Filter Permission" value={addForm.filter} onChange={e => setAddForm(f => ({ ...f, filter: e.target.value }))}>
              <MenuItem value="all access">All Access</MenuItem>
              <MenuItem value="only view">Only View</MenuItem>
              <MenuItem value="no access">No Access</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140, flex: 1 }}>
            <InputLabel id="product-label">Product Permission</InputLabel>
            <Select labelId="product-label" label="Product Permission" value={addForm.product} onChange={e => setAddForm(f => ({ ...f, product: e.target.value }))}>
              <MenuItem value="all access">All Access</MenuItem>
              <MenuItem value="only view">Only View</MenuItem>
              <MenuItem value="no access">No Access</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140, flex: 1 }}>
            <InputLabel id="seo-label">SEO Permission</InputLabel>
            <Select labelId="seo-label" label="SEO Permission" value={addForm.seo} onChange={e => setAddForm(f => ({ ...f, seo: e.target.value }))}>
              <MenuItem value="all access">All Access</MenuItem>
              <MenuItem value="only view">Only View</MenuItem>
              <MenuItem value="no access">No Access</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Legend Section */}
      <Paper sx={{ mb: 4, p: 2, borderRadius: 3, background: '#e3f2fd', boxShadow: '0 1px 6px 0 rgba(33,150,243,0.06)', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <b>Legend:</b>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterAltIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} /> Filter
            <Inventory2Icon fontSize="small" sx={{ verticalAlign: 'middle', mx: 1 }} /> Product
            <SearchIcon fontSize="small" sx={{ verticalAlign: 'middle', mx: 1 }} /> SEO
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 16, height: 16, bgcolor: '#4caf50', borderRadius: 1, display: 'inline-block', mr: 0.5 }} />
              <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 700 }}>All Access</Typography>
              <Typography variant="caption" sx={{ color: '#888', ml: 0.5 }}>
                (Can view, add, edit, delete)
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 2 }}>
              <Box sx={{ width: 16, height: 16, bgcolor: '#ff9800', borderRadius: 1, display: 'inline-block', mr: 0.5 }} />
              <Typography variant="caption" sx={{ color: '#ff9800', fontWeight: 700 }}>Only View</Typography>
              <Typography variant="caption" sx={{ color: '#888', ml: 0.5 }}>
                (Can only view)
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 2 }}>
              <Box sx={{ width: 16, height: 16, bgcolor: '#f44336', borderRadius: 1, display: 'inline-block', mr: 0.5 }} />
              <Typography variant="caption" sx={{ color: '#f44336', fontWeight: 700 }}>No Access</Typography>
              <Typography variant="caption" sx={{ color: '#888', ml: 0.5 }}>
                (Cannot view or manage)
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Admins List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {admins.length === 0 && (
          <Paper sx={{ p: 4, borderRadius: 4, background: '#fff', textAlign: 'center', color: '#888', fontWeight: 600, fontSize: 18 }}>
            No admins found. Add an admin to get started.
          </Paper>
        )}
        {admins.map((admin: AdminRole, idx: number) => (
          <Paper
            key={admin._id}
            elevation={2}
            sx={{
              borderRadius: 4,
              background: '#fff',
              boxShadow: '0 2px 12px 0 rgba(33,150,243,0.08)',
              p: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              minHeight: 80,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 220 }}>
              <Avatar sx={{ bgcolor: idx % 2 === 0 ? 'primary.main' : 'secondary.main', color: '#fff', width: 48, height: 48 }}>
                <AdminPanelSettingsIcon />
              </Avatar>
              <Box>
                <Typography variant="body1" fontWeight={700} color="text.primary" sx={{ fontSize: 18 }}>
                  {admin.email}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {admin.name}
                </Typography>
              </Box>
            </Box>
            {/* Filter Permission */}
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <Select
                value={admin.filter || 'no access'}
                onChange={e => handlePermissionChange(admin._id, "filter", e.target.value)}
                sx={{
                  fontWeight: 600,
                  color:
                    admin.filter === 'all access'
                      ? '#4caf50'
                      : admin.filter === 'only view'
                        ? '#ff9800'
                        : '#f44336',
                  background: '#f7fafd',
                  borderRadius: 2,
                }}
              >
                <MenuItem key={`${admin._id}-filter-all-access`} value="all access" sx={{ color: '#4caf50', fontWeight: 600 }}>All Access</MenuItem>
                <MenuItem key={`${admin._id}-filter-only-view`} value="only view" sx={{ color: '#ff9800', fontWeight: 600 }}>Only View</MenuItem>
                <MenuItem key={`${admin._id}-filter-no-access`} value="no access" sx={{ color: '#f44336', fontWeight: 600 }}>No Access</MenuItem>
              </Select>
            </FormControl>
            {/* Product Permission */}
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <Select
                value={admin.product || 'no access'}
                onChange={e => handlePermissionChange(admin._id, "product", e.target.value)}
                sx={{
                  fontWeight: 600,
                  color:
                    admin.product === 'all access'
                      ? '#4caf50'
                      : admin.product === 'only view'
                        ? '#ff9800'
                        : '#f44336',
                  background: '#f7fafd',
                  borderRadius: 2,
                }}
              >
                <MenuItem key={`${admin._id}-product-all-access`} value="all access" sx={{ color: '#4caf50', fontWeight: 600 }}>All Access</MenuItem>
                <MenuItem key={`${admin._id}-product-only-view`} value="only view" sx={{ color: '#ff9800', fontWeight: 600 }}>Only View</MenuItem>
                <MenuItem key={`${admin._id}-product-no-access`} value="no access" sx={{ color: '#f44336', fontWeight: 600 }}>No Access</MenuItem>
              </Select>
            </FormControl>
            {/* SEO Permission */}
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <Select
                value={admin.seo || 'no access'}
                onChange={e => handlePermissionChange(admin._id, "seo", e.target.value)}
                sx={{
                  fontWeight: 600,
                  color:
                    admin.seo === 'all access'
                      ? '#4caf50'
                      : admin.seo === 'only view'
                        ? '#ff9800'
                        : '#f44336',
                  background: '#f7fafd',
                  borderRadius: 2,
                }}
              >
                <MenuItem key={`${admin._id}-seo-all-access`} value="all access" sx={{ color: '#4caf50', fontWeight: 600 }}>All Access</MenuItem>
                <MenuItem key={`${admin._id}-seo-only-view`} value="only view" sx={{ color: '#ff9800', fontWeight: 600 }}>Only View</MenuItem>
                <MenuItem key={`${admin._id}-seo-no-access`} value="no access" sx={{ color: '#f44336', fontWeight: 600 }}>No Access</MenuItem>
              </Select>
            </FormControl>
            {/* Delete Button */}
            <IconButton color="error" onClick={() => handleDeleteAdmin(admin._id)} sx={{ ml: 2 }}>
              <DeleteIcon />
            </IconButton>
          </Paper>
        ))}
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default AdminRestrictionPage; 