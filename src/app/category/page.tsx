"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Card, 
  CardContent, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button, 
  Box, 
  Avatar, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  IconButton, 
  Pagination,
  Chip,
  InputAdornment,
  Breadcrumbs,
  Link
} from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ImageIcon from '@mui/icons-material/Image';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { apiFetch } from '../../utils/apiFetch';

interface Category {
  _id?: string;
  name: string;
  image?: string;
}

const CategoryRow = React.memo(({ category, onEdit, onDelete, viewOnly }: {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  viewOnly: boolean;
}) => {
  const [imgDim, setImgDim] = React.useState<{ width: number; height: number } | null>(null);

  return (
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
        {category.name}
      </TableCell>
      <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        {category.image ? (
          <Box>
            <Avatar 
              variant="rounded" 
              src={category.image} 
              sx={{ 
                width: 40, 
                height: 40,
                border: '2px solid',
                borderColor: 'divider'
              }}
              imgProps={{
                onLoad: (e: React.SyntheticEvent<HTMLImageElement>) => {
                  const { width, height } = e.currentTarget;
                  setImgDim({ width, height });
                }
              }}
            >
              <ImageIcon />
            </Avatar>
            {imgDim && (
              <Typography variant="caption" sx={{ display: "block", mt: 0.5, textAlign: "center" }}>
                {imgDim.width}×{imgDim.height}
              </Typography>
            )}
          </Box>
        ) : (
          <Avatar 
            variant="rounded" 
            sx={{ 
              width: 40, 
              height: 40, 
              bgcolor: 'grey.200',
              border: '2px solid',
              borderColor: 'divider'
            }}
          >
            <ImageIcon />
          </Avatar>
        )}
      </TableCell>
      <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton 
            size="small" 
            onClick={() => onEdit(category)}
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
            onClick={() => onDelete(category._id || "")}
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
  );
});

CategoryRow.displayName = 'CategoryRow';

const CategoryForm = React.memo(({ 
  open, 
  onClose, 
  form, 
  setForm, 
  onSubmit, 
  submitting, 
  editId, 
  imagePreview, 
  onImageChange, 
  viewOnly
}: {
  open: boolean;
  onClose: () => void;
  form: Category;
  setForm: (form: Category) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  editId: string | null;
  imagePreview: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
        {editId ? "Edit Category" : "Add New Category"}
      </DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 3 }}>
          <TextField 
            label="Category Name" 
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
          <Box display="flex" alignItems="center" gap={2}>
            <Button 
              variant="outlined" 
              component="label" 
              sx={{ 
                borderRadius: '6px', 
                fontWeight: 500,
                borderColor: 'divider',
                color: 'text.primary',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'rgba(115, 103, 240, 0.08)',
                }
              }} 
              disabled={submitting || viewOnly}
              startIcon={<ImageIcon />}
            >
              Upload Image
              <input type="file" accept="image/*" hidden onChange={onImageChange} disabled={viewOnly} />
            </Button>
            {imagePreview && (
              <Avatar 
                variant="rounded" 
                src={imagePreview} 
                sx={{ 
                  width: 56, 
                  height: 56,
                  border: '2px solid',
                  borderColor: 'divider'
                }}
              >
                <ImageIcon />
              </Avatar>
            )}
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
            {editId ? "Update" : "Add Category"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
});

CategoryForm.displayName = 'CategoryForm';

function getCategoryPagePermission() {
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

function isFile(value: unknown): value is File {
  return typeof File !== 'undefined' && value instanceof File;
}

export default function CategoryPage() {
  // All hooks at the top
  const [pageAccess, setPageAccess] = useState<'all access' | 'only view' | 'no access'>('no access');
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Category>({ name: "" });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 8;
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000/api"}/category`);
      setCategories(data.data || []);
    } finally {
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    setPageAccess(getCategoryPagePermission());
  }, [fetchCategories]);

  const handleOpen = useCallback((category: Category | null = null) => {
    setEditId(category?._id || null);
    setForm(category ? { ...category } : { name: "" });
    setImagePreview(category?.image || null);
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setEditId(null);
    setImagePreview(null);
    setForm({ name: "" });
  }, []);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, image: file as File }));
      setImagePreview(URL.createObjectURL(file));
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      if (isFile(form.image)) {
        formData.append("image", form.image);
      }
      const method = editId ? "PUT" : "POST";
      const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000/api"}/category${editId ? "/" + editId : ""}`;
      await apiFetch(url, {
        method,
        body: formData,
      });
      fetchCategories();
      handleClose();
    } finally {
      setSubmitting(false);
    }
  }, [form, editId, fetchCategories, handleClose]);

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    setDeleteError(null);
    try {
      const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000/api"}/category/${deleteId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data && data.message && data.message.includes("in use")) {
          setDeleteError("Cannot delete: Category is in use by one or more products.");
        } else {
          setDeleteError(data.message || "Failed to delete category.");
        }
        return;
      }
      setDeleteId(null);
      fetchCategories();
    } catch {}
  }, [deleteId, fetchCategories]);

  const handleEdit = useCallback((category: Category) => {
    handleOpen(category);
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

  // Filter categories by search
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );
  
  // Pagination
  const paginatedCategories = filteredCategories.slice((page - 1) * rowsPerPage, page * rowsPerPage);

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
          Categories
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
              Category Management
            </Typography>
            <Typography variant="body2" sx={{ 
              color: 'text.secondary'
            }}>
              Manage your product categories
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
          Add Category
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
              Categories ({filteredCategories.length})
            </Typography>
            <Chip 
              label={`${paginatedCategories.length} of ${filteredCategories.length}`}
              size="small"
              sx={{ 
                bgcolor: 'primary.main',
                color: 'white',
                fontWeight: 500
              }}
            />
          </Box>
          
          <TextField
            placeholder="Search categories..."
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
                  borderColor: 'primary.main',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Categories Table */}
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
                    Category Name
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 600, 
                    color: 'text.primary',
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                  }}>
                    Image
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
                {paginatedCategories.map((category) => (
                  <CategoryRow
                    key={category._id}
                    category={category}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    viewOnly={pageAccess === 'only view'}
                  />
                ))}
                {paginatedCategories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                      No categories found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredCategories.length > rowsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={Math.ceil(filteredCategories.length / rowsPerPage)}
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
      <CategoryForm
        open={open}
        onClose={handleClose}
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        submitting={submitting}
        editId={editId}
        imagePreview={imagePreview}
        onImageChange={handleImageChange}
        viewOnly={pageAccess === 'only view'}
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
            Are you sure you want to delete this category? This action cannot be undone.
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