"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Pagination, Breadcrumbs, Link, Avatar
} from '@mui/material';
import BrushIcon from '@mui/icons-material/Brush';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import HomeIcon from '@mui/icons-material/Home';
import { apiFetch } from '../../utils/apiFetch';

interface Motif {
  _id?: string;
  name: string;
}

const MotifRow = React.memo(({ motif, onEdit, onDelete, viewOnly }: {
  motif: Motif;
  onEdit: (motif: Motif) => void;
  onDelete: (id: string) => void;
  viewOnly: boolean;
}) => (
  <TableRow hover sx={{ transition: 'background 0.2s', '&:hover': { background: 'rgba(41,72,255,0.08)' } }}>
    <TableCell sx={{ fontSize: 16 }}>{motif.name}</TableCell>
    <TableCell>
      <IconButton color="primary" onClick={() => onEdit(motif)} disabled={viewOnly}><EditIcon /></IconButton>
      <IconButton color="error" onClick={() => onDelete(motif._id || "")} disabled={viewOnly}><DeleteIcon /></IconButton>
    </TableCell>
  </TableRow>
));

MotifRow.displayName = 'MotifRow';

const MotifForm = React.memo(({ 
  open, 
  onClose, 
  form, 
  setForm, 
  onSubmit, 
  submitting, 
  editId, 
  viewOnly
}: {
  open: boolean;
  onClose: () => void;
  form: Motif;
  setForm: (form: Motif) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  editId: string | null;
  viewOnly: boolean;
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  }, [form, setForm]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, fontSize: 24, background: 'linear-gradient(90deg,#396afc,#2948ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{editId ? "Edit Motif" : "Add Motif"}</DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, pt: 3 }}>
          <TextField label="Name" name="name" value={form.name} onChange={handleChange} required fullWidth sx={{ fontSize: 18 }} disabled={submitting || viewOnly} InputProps={{ readOnly: viewOnly }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} sx={{ fontWeight: 700, borderRadius: 3, fontSize: 16 }} disabled={submitting || viewOnly}>Cancel</Button>
          <Button type="submit" variant="contained" sx={{ fontWeight: 700, borderRadius: 3, fontSize: 16 }} disabled={submitting || viewOnly}>{editId ? "Update" : "Add"}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
});

MotifForm.displayName = 'MotifForm';

function getMotifPagePermission() {
  if (typeof window === 'undefined') return 'denied';
  const email = localStorage.getItem('admin-email');
  const superAdmin = process.env.NEXT_PUBLIC_SUPER_ADMIN;
  if (email && superAdmin && email === superAdmin) return 'full';
  const perms = JSON.parse(localStorage.getItem('admin-permissions') || '{}');
  if (perms && perms.filter) {
    if (perms.filter === 'all access') return 'full';
    if (perms.filter === 'only view') return 'view';
    if (perms.filter === 'no access') return 'denied';
  }
  return 'denied';
}

export default function MotifPage() {
  // All hooks at the top
  const [pageAccess, setPageAccess] = useState<'full' | 'view' | 'denied'>('denied');
  const [motifs, setMotifs] = useState<Motif[]>([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Motif>({ name: "" });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 8;
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchMotifs = useCallback(async () => {
    try {
      const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/motif`);
      const data = await res.json();
      setMotifs(data.data || []);
    } catch (error) {
        console.error('Failed to fetch motifs:', error)
    }
  }, []);

  useEffect(() => {
    const permission = getMotifPagePermission();
    setPageAccess(permission);
    if (permission !== 'denied') {
      fetchMotifs();
    }
  }, [fetchMotifs]);

  const handleOpen = useCallback((motif: Motif | null = null) => {
    setEditId(motif?._id || null);
    setForm(motif ? { ...motif } : { name: "" });
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setEditId(null);
    setForm({ name: "" });
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const method = editId ? "PUT" : "POST";
      const url = `${process.env.NEXT_PUBLIC_API_URL}/motif${editId ? "/" + editId : ""}`;
      await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      fetchMotifs();
      handleClose();
    } finally {
      setSubmitting(false);
    }
  }, [form, editId, fetchMotifs, handleClose]);

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    setDeleteError(null);
    try {
      const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/motif/${deleteId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data && data.message && data.message.includes("in use")) {
          setDeleteError("Cannot delete: Motif is in use by one or more products.");
        } else {
          setDeleteError(data.message || "Failed to delete motif.");
        }
        return;
      }
      setDeleteId(null);
      fetchMotifs();
    } catch {}
  }, [deleteId, fetchMotifs]);

  const handleEdit = useCallback((motif: Motif) => {
    handleOpen(motif);
  }, [handleOpen]);

  const handleDeleteClick = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  // Filter motifs by search
  const filteredMotifs = motifs.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );
  // Pagination
  const paginatedMotifs = filteredMotifs.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Permission check rendering
  if (pageAccess === 'denied') {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" sx={{ color: '#e74c3c', mb: 2 }}>
          Access Denied
        </Typography>
        <Typography variant="body1" sx={{ color: '#7f8c8d' }}>
          You don&apost have permission to access this page.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 0 }}>
      {pageAccess === 'view' && (
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
          <BrushIcon sx={{ mr: 0.5 }} fontSize="small" />
          Motifs
        </Typography>
      </Breadcrumbs>

      {/* Header Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ 
            bgcolor: 'info.main', 
            color: 'white', 
            width: 48, 
            height: 48 
          }}>
            <BrushIcon sx={{ fontSize: 24 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ 
              fontWeight: 600, 
              color: 'text.primary',
              mb: 0.5
            }}>
              Motif Management
            </Typography>
            <Typography variant="body2" sx={{ 
              color: 'text.secondary'
            }}>
              Manage your product motifs
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<BrushIcon />}
          onClick={() => handleOpen()}
          disabled={pageAccess === 'view'}
          sx={{
            fontWeight: 500,
            borderRadius: '6px',
            px: 3,
            py: 1.2,
            fontSize: 14,
            backgroundColor: 'info.main',
            boxShadow: '0 4px 24px 0 rgba(115, 103, 240, 0.24)',
            '&:hover': { 
              backgroundColor: 'info.dark',
              boxShadow: '0 4px 25px 0 rgba(115, 103, 240, 0.24)',
            },
          }}
        >
          Add Motif
        </Button>
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
              Motifs ({filteredMotifs.length})
            </Typography>
          </Box>
          <TextField
            placeholder="Search motifs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <BrushIcon sx={{ color: 'text.secondary', mr: 1 }} />
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '6px',
                '& fieldset': {
                  borderColor: 'divider',
                },
                '&:hover fieldset': {
                  borderColor: 'success.main',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'success.main',
                },
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Motifs Table */}
      <Card sx={{
        background: 'background.paper',
        borderRadius: '6px',
        boxShadow: '0 4px 24px 0 rgba(34, 41, 47, 0.24)',
        border: '1px solid',
        borderColor: 'divider',
      }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'rgba(115, 103, 240, 0.04)' }}>
                  <TableCell sx={{ 
                    fontWeight: 600, 
                    color: 'text.primary',
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                  }}>
                    Motif Name
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 600, 
                    color: 'text.primary',
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                  }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedMotifs.map((motif) => (
                  <MotifRow
                    key={motif._id}
                    motif={motif}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    viewOnly={pageAccess === 'view'}
                  />
                ))}
                {paginatedMotifs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                      No motifs found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredMotifs.length > rowsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={Math.ceil(filteredMotifs.length / rowsPerPage)}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}

      {/* Motif Form Dialog */}
      <MotifForm
        open={open}
        onClose={handleClose}
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        submitting={submitting}
        editId={editId}
        viewOnly={pageAccess === 'view'}
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
            Are you sure you want to delete this motif? This action cannot be undone.
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
            disabled={pageAccess === 'view'}
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
            disabled={pageAccess === 'view'}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 