"use client";
import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
  Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Alert, Pagination, Breadcrumbs, Link
} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import HomeIcon from '@mui/icons-material/Home';
import { cachedFetch } from '../../utils/performance';

interface Content {
  _id?: string;
  name: string;
}

const ContentRow = React.memo(({ content, onEdit, onDelete, viewOnly }: {
  content: Content;
  onEdit: (content: Content) => void;
  onDelete: (id: string) => void;
  viewOnly: boolean;
}) => (
  <TableRow hover sx={{ transition: 'background 0.2s', '&:hover': { background: 'rgba(41,72,255,0.08)' } }}>
    <TableCell sx={{ fontSize: 16 }}>{content.name}</TableCell>
    <TableCell>
      <IconButton color="primary" onClick={() => onEdit(content)} disabled={viewOnly}><EditIcon /></IconButton>
      <IconButton color="error" onClick={() => onDelete(content._id || "")} disabled={viewOnly}><DeleteIcon /></IconButton>
    </TableCell>
  </TableRow>
));

ContentRow.displayName = 'ContentRow';

const ContentForm = React.memo(({ 
  open, 
  onClose, 
  form, 
  setForm, 
  onSubmit, 
  submitting, 
  editId,
  error,
  viewOnly
}: {
  open: boolean;
  onClose: () => void;
  form: Content;
  setForm: (form: Content) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  editId: string | null;
  error?: string;
  viewOnly: boolean;
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  }, [form, setForm]);

  if (!open) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      disableEscapeKeyDown={submitting}
    >
      <DialogTitle sx={{ fontWeight: 700, fontSize: 24, background: 'linear-gradient(90deg,#396afc,#2948ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        {editId ? "Edit Content" : "Add Content"}
      </DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField 
            label="Name" 
            name="name" 
            value={form.name} 
            onChange={handleChange} 
            required 
            fullWidth 
            sx={{ fontSize: 18 }} 
            disabled={submitting || viewOnly}
            InputProps={{ readOnly: viewOnly }}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={onClose} 
            sx={{ fontWeight: 700, borderRadius: 3, fontSize: 16 }} 
            disabled={submitting || viewOnly}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            sx={{ fontWeight: 700, borderRadius: 3, fontSize: 16 }} 
            disabled={submitting || viewOnly}
          >
            {editId ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
});

ContentForm.displayName = 'ContentForm';

function getCurrentAdminEmail() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin-email');
}

function getContentPagePermission() {
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

export default function ContentPage() {
  // All hooks at the top
  const [pageAccess, setPageAccess] = useState<'full' | 'view' | 'denied'>('denied');
  const [contents, setContents] = useState<Content[]>([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Content>({ name: "" });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 8;
  const [error, setError] = useState("");


  const fetchContents = useCallback(async () => {
    try {
      const data = await cachedFetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000/api"}/content`);
      setContents(data.data || []);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }, []);

  useEffect(() => {
    const checkPermission = async () => {
      const email = getCurrentAdminEmail();
      if (!email) {
        setAllowed(false);
        return;
      }
      const res = await fetch(`http://localhost:7000/api/admin/allowed-admins-permissions`);
      const data = await res.json();
      if (data.success) {
        const admin = data.data.find((a: any) => a.email === email);
        setAllowed(admin?.canAccessFilter ?? false);
      } else {
        setAllowed(false);
      }
    };
    checkPermission();
  }, []);

  useEffect(() => {
    fetchContents();
    setPageAccess(getContentPagePermission());
  }, [fetchContents]);

  useEffect(() => {
    // Check permission from localStorage
    const permission = getContentPagePermission();
    setPageAccess(permission);
  }, []);

  const handleOpen = useCallback((content: Content | null = null) => {
    setEditId(content?._id || null);
    setForm(content ? { ...content } : { name: "" });
    setError("");
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setEditId(null);
    setForm({ name: "" });
    setError("");
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    
    try {
      const method = editId ? "PUT" : "POST";
      const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000/api"}/content${editId ? "/" + editId : ""}`;
      
      const response = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        fetchContents();
        handleClose();
      } else {
        setError(result.message || "Operation failed");
      }
    } catch (error) {
      console.error("Submit error:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  }, [form, editId, fetchContents, handleClose]);

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000/api"}/content/${deleteId}`, { 
        method: "DELETE" 
      });
      
      if (response.ok) {
        setDeleteId(null);
        fetchContents();
      } else {
        console.error("Delete failed:", response.statusText);
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  }, [deleteId, fetchContents]);

  const handleEdit = useCallback((content: Content) => {
    handleOpen(content);
  }, [handleOpen]);

  const handleDeleteClick = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const titleStyle = useMemo(() => ({
    fontWeight: 700,
    letterSpacing: 1,
    background: 'linear-gradient(90deg,#396afc,#2948ff)',
    WebkitBackgroundClip: 'text' as const,
    WebkitTextFillColor: 'transparent' as const
  }), []);

  // Filter contents by search
  const filteredContents = contents.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );
  // Pagination
  const paginatedContents = filteredContents.slice((page - 1) * rowsPerPage, page * rowsPerPage);

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
          <ArticleIcon sx={{ mr: 0.5 }} fontSize="small" />
          Contents
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
            <ArticleIcon sx={{ fontSize: 24 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ 
              fontWeight: 600, 
              color: 'text.primary',
              mb: 0.5
            }}>
              Content Management
            </Typography>
            <Typography variant="body2" sx={{ 
              color: 'text.secondary'
            }}>
              Manage your product content
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<ArticleIcon />}
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
          Add Content
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
              Contents ({filteredContents.length})
            </Typography>
          </Box>
          <TextField
            placeholder="Search contents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <ArticleIcon sx={{ color: 'text.secondary', mr: 1 }} />
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '6px',
                '& fieldset': {
                  borderColor: 'divider',
                },
                '&:hover fieldset': {
                  borderColor: 'warning.main',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'warning.main',
                },
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Contents Table */}
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
                    Content Name
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
                {paginatedContents.map((content) => (
                  <ContentRow
                    key={content._id}
                    content={content}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    viewOnly={pageAccess === 'view'}
                  />
                ))}
                {paginatedContents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                      No content found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredContents.length > rowsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={Math.ceil(filteredContents.length / rowsPerPage)}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="warning"
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
      <ContentForm
        open={open}
        onClose={handleClose}
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        submitting={submitting}
        editId={editId}
        error={error}
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
            Are you sure you want to delete this content? This action cannot be undone.
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