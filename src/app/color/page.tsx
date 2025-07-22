"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Pagination, Breadcrumbs, Link
} from '@mui/material';
import PaletteIcon from '@mui/icons-material/Palette';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import HomeIcon from '@mui/icons-material/Home';
import { apiFetch } from '../../utils/apiFetch';

interface Color {
  _id?: string;
  name: string;
}

const ColorRow = React.memo(({ color, onEdit, onDelete, viewOnly }: {
  color: Color;
  onEdit: (color: Color) => void;
  onDelete: (id: string) => void;
  viewOnly: boolean;
}) => (
  <TableRow hover sx={{ transition: 'background 0.2s', '&:hover': { background: 'rgba(41,72,255,0.08)' } }}>
    <TableCell sx={{ fontSize: 16 }}>{color.name}</TableCell>
    <TableCell>
      <IconButton color="primary" onClick={() => onEdit(color)} disabled={viewOnly}><EditIcon /></IconButton>
      <IconButton color="error" onClick={() => onDelete(color._id || "")} disabled={viewOnly}><DeleteIcon /></IconButton>
    </TableCell>
  </TableRow>
));

ColorRow.displayName = 'ColorRow';


const ColorForm = React.memo(({ 
  open, 
  onClose, 
  form, 
  setForm, 
  onSubmit, 
  submitting, 
  editId, 
  viewOnly, 
  error 
}: {
  open: boolean;
  onClose: () => void;
  form: Color;
  setForm: (form: Color) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  editId: string | null;
  viewOnly: boolean;
  error?: string | null;
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  }, [form, setForm]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, fontSize: 24, background: 'linear-gradient(90deg,#396afc,#2948ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{editId ? "Edit Color" : "Add Color"}</DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, pt: 3 }}>
          <TextField label="Name" name="name" value={form.name} onChange={handleChange} required fullWidth sx={{ fontSize: 18 }} disabled={submitting || viewOnly} InputProps={{ readOnly: viewOnly }} />
          {error && (
            <Typography sx={{ color: 'error.main', mt: 1 }}>{error}</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} sx={{ fontWeight: 700, borderRadius: 3, fontSize: 16 }} disabled={submitting || viewOnly}>Cancel</Button>
          <Button type="submit" variant="contained" sx={{ fontWeight: 700, borderRadius: 3, fontSize: 16 }} disabled={submitting || viewOnly}>{editId ? "Update" : "Add"}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
});

ColorForm.displayName = 'ColorForm';

function getColorPagePermission() {
  if (typeof window === 'undefined') return 'no access';
  const email = localStorage.getItem('admin-email');
  const superAdmin = process.env.NEXT_PUBLIC_SUPER_ADMIN;
  if (email && superAdmin && email === superAdmin) return 'all access';
  const perms = JSON.parse(localStorage.getItem('admin-permissions') || '{}');
  if (perms && perms.filter) {
    return perms.filter;
  }
  return 'no access';
}

export default function ColorPage() {
  // All hooks at the top
  const [pageAccess, setPageAccess] = useState<'all access' | 'only view' | 'no access'>('no access');
  const [colors, setColors] = useState<Color[]>([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Color>({ name: "" });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 8;
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchColors = useCallback(async () => {
    try {
      const data = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/color`).then(res => res.json());
      setColors(data.data || []);
    } catch {}
  }, []);

  useEffect(() => {
    fetchColors();
    setPageAccess(getColorPagePermission());
  }, [fetchColors]);

  const handleOpen = useCallback((color: Color | null = null) => {
    setEditId(color?._id || null);
    setForm(color ? { ...color } : { name: "" });
    setFormError(null);
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setEditId(null);
    setForm({ name: "" });
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      const method = editId ? "PUT" : "POST";
      const url = `${process.env.NEXT_PUBLIC_API_URL}/color${editId ? "/" + editId : ""}`;
      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data && data.message && data.message.includes("unique")) {
          setFormError(data.message);
          return;
        }
        setFormError(data.message || "Failed to save color.");
        return;
      }
      fetchColors();
      handleClose();
    } catch {
      setFormError("Failed to save color.");
    }
  }, [form, editId, fetchColors, handleClose]);

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    setDeleteError(null);
    try {
      const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/color/${deleteId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data && data.message && data.message.includes("in use")) {
          setDeleteError("Cannot delete: Color is in use by one or more products.");
        } else {
          setDeleteError(data.message || "Failed to delete color.");
        }
        return;
      }
      setDeleteId(null);
      fetchColors();
    } catch {}
  }, [deleteId, fetchColors]);

  const handleEdit = useCallback((color: Color) => {
    handleOpen(color);
  }, [handleOpen]);

  const handleDeleteClick = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  // Permission check rendering
  if (pageAccess === 'no access') {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" sx={{ color: '#e74c3c', mb: 2 }}>
          Access Denied
        </Typography>
        <Typography variant="body1" sx={{ color: '#7f8c8d' }}>
          You dont have permission to access this page.
        </Typography>
      </Box>
    );
  }

  // Filter colors by search
  const filteredColors = colors.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );
  // Pagination
  const paginatedColors = filteredColors.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <Box sx={{ p: 0 }}>
      {pageAccess === 'only view' && (
        <Box sx={{ mb: 2 }}>
          <Paper elevation={2} sx={{ p: 2, bgcolor: '#fffbe6', border: '1px solid #ffe58f' }}>
            <Typography color="#ad6800" fontWeight={600}>
              You have view-only access. To make changes, contact your admin.
            </Typography>
          </Paper>
        </Box>
      )}
      {/* Breadcrumbs */}
      <Breadcrumbs 
        separator={<HomeIcon fontSize="small" />} 
        sx={{ mb: 3 }}
      >
        <Link href="/dashboard" sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', textDecoration: 'none' }}>
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          Dashboard
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <PaletteIcon sx={{ mr: 0.5 }} fontSize="small" />
          Colors
        </Typography>
      </Breadcrumbs>

      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ 
              bgcolor: 'secondary.main', 
              color: 'white', 
              width: 48, 
              height: 48 
            }}>
              <PaletteIcon sx={{ fontSize: 24 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ 
                fontWeight: 600, 
                color: 'text.primary',
                mb: 0.5
              }}>
                Color Management
              </Typography>
              <Typography variant="body2" sx={{ 
                color: 'text.secondary'
              }}>
                Manage your product colors
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<PaletteIcon />}
            onClick={() => handleOpen()}
            disabled={pageAccess === 'only view'}
            sx={{
              fontWeight: 500,
              borderRadius: '6px',
              px: 3,
              py: 1.2,
              fontSize: 14,
              backgroundColor: 'secondary.main',
              boxShadow: '0 4px 24px 0 rgba(115, 103, 240, 0.24)',
              '&:hover': { 
                backgroundColor: 'secondary.dark',
                boxShadow: '0 4px 25px 0 rgba(115, 103, 240, 0.24)',
              },
            }}
          >
            Add Color
          </Button>
        </Box>
      </Box>

      {/* Search and Stats */}
      <Card sx={{
        background: 'background.paper',
        borderRadius: '6px',
        boxShadow: '0 4px 24px 0 rgba(34, 41, 47, 0.24)',
        border: '1px solid',
        borderColor: 'divider',
        mb: 3
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Colors ({filteredColors.length})
            </Typography>
          </Box>
          <TextField
            placeholder="Search colors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <PaletteIcon sx={{ color: 'text.secondary', mr: 1 }} />
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '6px',
                '& fieldset': {
                  borderColor: 'divider',
                },
                '&:hover fieldset': {
                  borderColor: 'secondary.main',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'secondary.main',
                },
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Table Section */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: 'linear-gradient(90deg,#396afc,#2948ff)' }}>
              <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: 16 }}>Color Name</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: 16 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedColors.map((color) => (
              <ColorRow
                key={color._id}
                color={color}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                viewOnly={pageAccess === 'only view'}
              />
            ))}
            {paginatedColors.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                  No colors found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {filteredColors.length > rowsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={Math.ceil(filteredColors.length / rowsPerPage)}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="secondary"
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: '6px',
                fontWeight: 500,
              },
            }}
          />
        </Box>
      )}

      {/* Form Dialog */}
      <ColorForm
        open={open}
        onClose={handleClose}
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        submitting={false}
        editId={editId}
        viewOnly={pageAccess === 'only view'}
        error={formError}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteId}
        onClose={() => { setDeleteId(null); setDeleteError(null); }}
        PaperProps={{
          sx: {
            borderRadius: '6px',
            boxShadow: '0 4px 24px 0 rgba(34, 41, 47, 0.24)',
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, color: 'text.primary' }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'text.secondary' }}>
            Are you sure you want to delete this color? This action cannot be undone.
          </Typography>
          {deleteError && (
            <Typography sx={{ color: 'error.main', mt: 2 }}>
              {deleteError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => { setDeleteId(null); setDeleteError(null); }}
            sx={{ 
              fontWeight: 500, 
              borderRadius: '6px',
              color: 'text.secondary',
            }}
            disabled={pageAccess === 'only view'}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDelete}
            variant="contained"
            color="error"
            sx={{ 
              fontWeight: 500, 
              borderRadius: '6px',
            }}
            disabled={pageAccess === 'only view'}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 