"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Pagination, Breadcrumbs, Link, Chip, InputAdornment, MenuItem, FormControlLabel, Checkbox, FormGroup, FormLabel
} from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { apiFetch } from '../../utils/apiFetch';

interface Suitablefor {
  _id: string;
  name: string;
}

interface Subsuitable {
  _id?: string;
  name: string;
  suitablefor: string[] | Suitablefor[];
}

const SubsuitableRow = React.memo(({ subsuitable, onEdit, onDelete, viewOnly }: {
  subsuitable: Subsuitable;
  onEdit: (subsuitable: Subsuitable) => void;
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
      {subsuitable.name}
    </TableCell>
    <TableCell>
      {Array.isArray(subsuitable.suitablefor)
        ? subsuitable.suitablefor.map((sf, index) => (
            <Chip 
              key={index} 
              label={typeof sf === 'object' && sf !== null && 'name' in sf ? sf.name : String(sf)} 
              size="small" 
              sx={{ mr: 0.5, mb: 0.5 }}
            />
          ))
        : typeof subsuitable.suitablefor === 'object' && subsuitable.suitablefor !== null && 'name' in subsuitable.suitablefor
        ? (subsuitable.suitablefor as Suitablefor).name
        : String(subsuitable.suitablefor) || 'N/A'}
    </TableCell>
    <TableCell>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <IconButton 
          size="small" 
          onClick={() => onEdit(subsuitable)}
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
          onClick={() => onDelete(subsuitable._id || "")}
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

SubsuitableRow.displayName = 'SubsuitableRow';

const SubsuitableForm = React.memo(({ 
  open, 
  onClose, 
  form, 
  setForm, 
  onSubmit, 
  submitting, 
  editId, 
  viewOnly,
  suitablefors
}: {
  open: boolean;
  onClose: () => void;
  form: Subsuitable;
  setForm: (form: Subsuitable) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  editId: string | null;
  viewOnly: boolean;
  suitablefors: Suitablefor[];
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const name = e.target.name;
    const value = e.target.value;
    if (name) {
      setForm({ ...form, [name]: value });
    }
  }, [form, setForm]);

  const handleCheckboxChange = useCallback((suitableforId: string, checked: boolean) => {
    const currentIds = Array.isArray(form.suitablefor) 
      ? form.suitablefor.map(sf => typeof sf === 'string' ? sf : sf._id)
      : [];
    
    let newIds: string[];
    if (checked) {
      newIds = [...currentIds, suitableforId];
    } else {
      newIds = currentIds.filter(id => id !== suitableforId);
    }
    
    setForm({ ...form, suitablefor: newIds });
  }, [form, setForm]);

  const isChecked = useCallback((suitableforId: string) => {
    if (!Array.isArray(form.suitablefor)) return false;
    return form.suitablefor.some(sf => 
      typeof sf === 'string' ? sf === suitableforId : sf._id === suitableforId
    );
  }, [form.suitablefor]);

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
        {editId ? "Edit Sub Suitable" : "Add New Sub Suitable"}
      </DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 3 }}>
          <TextField 
            label="Sub Suitable Name" 
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
          <Box>
            <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>Suitable For *</FormLabel>
            <FormGroup>
              {suitablefors.map((s) => (
                <FormControlLabel
                  key={s._id}
                  control={
                    <Checkbox
                      checked={isChecked(s._id)}
                      onChange={(e) => handleCheckboxChange(s._id, e.target.checked)}
                      disabled={submitting || viewOnly}
                    />
                  }
                  label={s.name}
                />
              ))}
            </FormGroup>
          </Box>
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
            {editId ? "Update" : "Add Sub Suitable"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
});

SubsuitableForm.displayName = 'SubsuitableForm';

function getSubsuitablePagePermission() {
  if (typeof window === 'undefined') return 'no access';
  const email = localStorage.getItem('admin-email');
  const superAdmin = process.env.NEXT_PUBLIC_Role_Management_Key_Value;
  if (email && superAdmin && email === superAdmin) return 'all access';
  const perms = JSON.parse(localStorage.getItem('admin-permissions') || '{}');
  if (perms && perms.filter) {
    return perms.filter;
  }
  return 'no access';
}

export default function SubsuitablePage() {
  // All hooks at the top
  const [pageAccess, setPageAccess] = useState<'all access' | 'only view' | 'no access'>('no access');
  const [subsuitables, setSubsuitables] = useState<Subsuitable[]>([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Subsuitable>({
    name: "",
    suitablefor: []
  });
  const [suitablefors, setSuitablefors] = useState<Suitablefor[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 8;

  const fetchSubsuitables = useCallback(async () => {
    try {
      const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/subsuitable`);
      const data = await res.json();
      setSubsuitables(data.data || []);
    } catch (error) {
        console.error("Failed to fetch subsuitables:", error);
    }
  }, []);

  const fetchSuitablefors = useCallback(async () => {
    try {
      const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/suitablefor`);
      const data = await res.json();
      setSuitablefors(data.data || []);
    } catch (error) {
        console.error("Failed to fetch suitablefors:", error);
    }
  }, []);

  useEffect(() => {
    fetchSubsuitables();
    fetchSuitablefors();
    setPageAccess(getSubsuitablePagePermission());
  }, [fetchSubsuitables, fetchSuitablefors]);

  const handleOpen = useCallback((subsuitable: Subsuitable | null = null) => {
    setEditId(subsuitable?._id || null);
    setForm(subsuitable ? { ...subsuitable } : { name: "", suitablefor: [] });
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setEditId(null);
    setForm({ name: "", suitablefor: [] });
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const method = editId ? "PUT" : "POST";
      const url = `${process.env.NEXT_PUBLIC_API_URL}/subsuitable${editId ? "/" + editId : ""}`;
      // Send array of IDs for multiple selection
      const payload = {
        ...form,
        suitablefor: Array.isArray(form.suitablefor) 
          ? form.suitablefor.map(sf => typeof sf === 'string' ? sf : sf._id)
          : [],
      };
      await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      fetchSubsuitables();
      handleClose();
    } finally {
      setSubmitting(false);
    }
  }, [form, editId, fetchSubsuitables, handleClose]);

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    try {
      await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/subsuitable/${deleteId}`, { method: "DELETE" });
      setDeleteId(null);
      fetchSubsuitables();
    } catch (error) {
        console.error("Failed to delete subsuitable:", error);
    }
  }, [deleteId, fetchSubsuitables]);

  const handleEdit = useCallback((subsuitable: Subsuitable) => {
    handleOpen(subsuitable);
  }, [handleOpen]);

  const handleDeleteClick = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  // Permission check rendering
  if (pageAccess === 'no access') {
    return (
      <Box sx={{ 
        p: 4, 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: 'background.default' 
      }}>
        <Typography sx={{ color: 'error.main', fontWeight: 600, fontSize: 24 }}>
          Access Denied: You do not have permission to access this page.
        </Typography>
      </Box>
    );
  }

  // Filter subsuitables by search
  const filteredSubsuitables = subsuitables.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );
  
  // Pagination
  const paginatedSubsuitables = filteredSubsuitables.slice((page - 1) * rowsPerPage, page * rowsPerPage);

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
        separator={<NavigateNextIcon fontSize="small" />} 
        sx={{ mb: 3 }}
      >
        <Link href="/dashboard" sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', textDecoration: 'none' }}>
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          Dashboard
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <CategoryIcon sx={{ mr: 0.5 }} fontSize="small" />
          Sub Suitable
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
            <CategoryIcon sx={{ fontSize: 24 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ 
              fontWeight: 600, 
              color: 'text.primary',
              mb: 0.5
            }}>
              Sub Suitable Management
            </Typography>
            <Typography variant="body2" sx={{ 
              color: 'text.secondary'
            }}>
              Manage your product sub suitable categories
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          disabled={pageAccess === 'only view'}
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
          Add Sub Suitable
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
              Sub Suitable ({filteredSubsuitables.length})
            </Typography>
            <Chip 
              label={`${paginatedSubsuitables.length} of ${filteredSubsuitables.length}`}
              size="small"
              sx={{ 
                bgcolor: 'info.main',
                color: 'white',
                fontWeight: 500
              }}
            />
          </Box>
          
          <TextField
            placeholder="Search sub suitable..."
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
                  borderColor: 'info.main',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'info.main',
                },
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Sub Suitable Table */}
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
                    Sub Suitable Name
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 600, 
                    color: 'text.primary',
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                  }}>
                    Suitable For
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
                {paginatedSubsuitables.map((subsuitable) => (
                  <SubsuitableRow
                    key={subsuitable._id}
                    subsuitable={subsuitable}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    viewOnly={pageAccess === 'only view'}
                  />
                ))}
                {paginatedSubsuitables.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                      No sub suitable found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredSubsuitables.length > rowsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={Math.ceil(filteredSubsuitables.length / rowsPerPage)}
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
      <SubsuitableForm
        open={open}
        onClose={handleClose}
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        submitting={submitting}
        editId={editId}
        viewOnly={pageAccess === 'only view'}
        suitablefors={suitablefors}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={!!deleteId} 
        onClose={() => { setDeleteId(null); }}
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
            Are you sure you want to delete this subsuitable? This action cannot be undone.
          </Typography>
          {/* {deleteError && ( // This line was removed */}
          {/*   <Typography sx={{ color: 'error.main', mt: 2 }}> // This line was removed */}
          {/*     {deleteError} // This line was removed */}
          {/*   </Typography> // This line was removed */}
          {/* )} // This line was removed */}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => { setDeleteId(null); }}
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