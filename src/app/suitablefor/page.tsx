"use client";
import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
  Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Pagination, Breadcrumbs, Link, Chip, InputAdornment
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { cachedFetch } from '../../utils/performance';

interface Suitablefor {
  _id?: string;
  name: string;
}

const SuitableforRow = React.memo(({ suitablefor, onEdit, onDelete, viewOnly }: {
  suitablefor: Suitablefor;
  onEdit: (suitablefor: Suitablefor) => void;
  onDelete: (id: string) => void;
  viewOnly: boolean;
}) => (
  <TableRow hover sx={{ 
    transition: 'all 0.3s ease', 
    '&:hover': { 
      backgroundColor: 'rgba(115, 103, 240, 0.08)',
      transform: 'translateY(-1px)',
    } 
  }}>
    <TableCell sx={{ 
      fontSize: 14, 
      fontWeight: 500, 
      color: 'text.primary',
      borderBottom: '1px solid',
      borderColor: 'divider'
    }}>
      {suitablefor.name}
    </TableCell>
    <TableCell>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <IconButton 
          size="small" 
          onClick={() => onEdit(suitablefor)}
          sx={{ 
            color: 'primary.main',
            '&:hover': {
              backgroundColor: 'rgba(115, 103, 240, 0.08)',
            }
          }}
          disabled={viewOnly}
        >
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton 
          size="small" 
          onClick={() => onDelete(suitablefor._id || "")}
          sx={{ 
            color: 'error.main',
            '&:hover': {
              backgroundColor: 'rgba(234, 84, 85, 0.08)',
            }
          }}
          disabled={viewOnly}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    </TableCell>
  </TableRow>
));

SuitableforRow.displayName = 'SuitableforRow';

const SuitableforForm = React.memo(({ 
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
  form: Suitablefor;
  setForm: (form: Suitablefor) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  editId: string | null;
  viewOnly: boolean;
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  }, [form, setForm]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '6px',
          boxShadow: '0 4px 24px 0 rgba(34, 41, 47, 0.24)',
        }
      }}
    >
      <DialogTitle sx={{ 
        fontWeight: 600, 
        fontSize: 20, 
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
        pb: 2
      }}>
        {editId ? "Edit Suitable For" : "Add New Suitable For"}
      </DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 3 }}>
          <TextField 
            label="Suitable For Name" 
            name="name" 
            value={form.name} 
            onChange={handleChange} 
            required 
            fullWidth 
            disabled={submitting || viewOnly}
            InputProps={{ readOnly: viewOnly }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '6px',
                '& fieldset': {
                  borderColor: 'divider',
                },
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={onClose} 
            sx={{ 
              fontWeight: 500, 
              borderRadius: '6px',
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'rgba(108, 117, 125, 0.08)',
              }
            }} 
            disabled={submitting || viewOnly}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            sx={{ 
              fontWeight: 500, 
              borderRadius: '6px',
              backgroundColor: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.dark',
              }
            }} 
            disabled={submitting || viewOnly}
          >
            {editId ? "Update" : "Add Suitable For"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
});

SuitableforForm.displayName = 'SuitableforForm';

// Helper to get current logged-in admin email from localStorage
function getCurrentAdminEmail() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin-email');
}

function getSuitableforPagePermission() {
  if (typeof window === 'undefined') return 'denied';
  const email = localStorage.getItem('admin-email');
  if (!email) return 'denied';
  const perms = JSON.parse(localStorage.getItem('admin-permissions') || '{}');
  let adminPerm = email ? perms[email] : undefined;
  if (typeof adminPerm === 'string') {
    try { adminPerm = JSON.parse(adminPerm); } catch {}
  }
  return adminPerm?.filterPermission || 'denied';
}

export default function SuitableforPage() {
  // All hooks at the top
  const [pageAccess, setPageAccess] = useState<'full' | 'view' | 'denied'>('denied');
  const [suitablefors, setSuitablefors] = useState<Suitablefor[]>([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Suitablefor>({ name: "" });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 8;


  const fetchSuitablefors = useCallback(async () => {
    setLoading(true);
    try {
      const data = await cachedFetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000/api"}/suitablefor`);
      setSuitablefors(data.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuitablefors();
    setPageAccess(getSuitableforPagePermission());
  }, [fetchSuitablefors]);

  const handleOpen = useCallback((suitablefor: Suitablefor | null = null) => {
    setEditId(suitablefor?._id || null);
    setForm(suitablefor ? { ...suitablefor } : { name: "" });
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
      const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000/api"}/suitablefor${editId ? "/" + editId : ""}`;
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      fetchSuitablefors();
      handleClose();
    } finally {
      setSubmitting(false);
    }
  }, [form, editId, fetchSuitablefors, handleClose]);

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000/api"}/suitablefor/${deleteId}`, { method: "DELETE" });
      setDeleteId(null);
      fetchSuitablefors();
    } catch (error) {
      console.error("Delete error:", error);
    }
  }, [deleteId, fetchSuitablefors]);

  const handleEdit = useCallback((suitablefor: Suitablefor) => {
    handleOpen(suitablefor);
  }, [handleOpen]);

  const handleDeleteClick = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  // Permission check rendering
  if (pageAccess === 'denied') {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" sx={{ color: '#e74c3c', mb: 2 }}>
          Access Denied
        </Typography>
        <Typography variant="body1" sx={{ color: '#7f8c8d' }}>
          You don't have permission to access this page.
        </Typography>
      </Box>
    );
  }

  // Filter suitablefors by search
  const filteredSuitablefors = suitablefors.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );
  
  // Pagination
  const paginatedSuitablefors = filteredSuitablefors.slice((page - 1) * rowsPerPage, page * rowsPerPage);

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
        separator={<NavigateNextIcon fontSize="small" />} 
        sx={{ mb: 3 }}
      >
        <Link href="/dashboard" sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', textDecoration: 'none' }}>
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          Dashboard
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <CheckCircleIcon sx={{ mr: 0.5 }} fontSize="small" />
          Suitable For
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
            <CheckCircleIcon sx={{ fontSize: 24 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ 
              fontWeight: 600, 
              color: 'text.primary',
              mb: 0.5
            }}>
              Suitable For Management
            </Typography>
            <Typography variant="body2" sx={{ 
              color: 'text.secondary'
            }}>
              Manage your product suitable for categories
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
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
          Add Suitable For
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
              Suitable For ({filteredSuitablefors.length})
            </Typography>
            <Chip 
              label={`${paginatedSuitablefors.length} of ${filteredSuitablefors.length}`}
              size="small"
              sx={{ 
                bgcolor: 'success.main',
                color: 'white',
                fontWeight: 500
              }}
            />
          </Box>
          
          <TextField
            placeholder="Search suitable for..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
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

      {/* Suitable For Table */}
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
                    Suitable For Name
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
                {paginatedSuitablefors.map((suitablefor) => (
                  <SuitableforRow
                    key={suitablefor._id}
                    suitablefor={suitablefor}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    viewOnly={pageAccess === 'view'}
                  />
                ))}
                {paginatedSuitablefors.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                      No suitable for categories found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredSuitablefors.length > rowsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={Math.ceil(filteredSuitablefors.length / rowsPerPage)}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
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
      <SuitableforForm
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
        onClose={() => setDeleteId(null)}
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
            Are you sure you want to delete this suitable for? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setDeleteId(null)}
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