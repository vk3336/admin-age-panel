"use client";
import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
  Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Pagination, Breadcrumbs, Link, Chip, InputAdornment
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { cachedFetch } from '../../utils/performance';

interface Groupcode {
  _id?: string;
  name: string;
  img?: string;
  video?: string;
}

const GroupcodeRow = React.memo(({ groupcode, onEdit, onDelete, onView, viewOnly }: {
  groupcode: Groupcode;
  onEdit: (groupcode: Groupcode) => void;
  onDelete: (id: string) => void;
  onView: (groupcode: Groupcode) => void;
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
      {groupcode.name}
    </TableCell>
    <TableCell>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <IconButton 
          size="small" 
          onClick={() => onView(groupcode)}
          sx={{ 
            color: 'info.main',
            '&:hover': {
              backgroundColor: 'rgba(115, 103, 240, 0.08)',
            }
          }}
        >
          <VisibilityIcon fontSize="small" />
        </IconButton>
        <IconButton 
          size="small" 
          onClick={() => onEdit(groupcode)}
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
          onClick={() => onDelete(groupcode._id || "")}
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

GroupcodeRow.displayName = 'GroupcodeRow';

const GroupcodeForm = React.memo(({ 
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
  form: Groupcode;
  setForm: (form: Groupcode) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  editId: string | null;
  viewOnly: boolean;
}) => {
  const imgInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [imgPreview, setImgPreview] = useState<string | null>(form.img ? (typeof form.img === 'string' ? form.img : null) : null);
  const [videoPreview, setVideoPreview] = useState<string | null>(form.video ? (typeof form.video === 'string' ? form.video : null) : null);
  const [imgDims, setImgDims] = useState<[number, number] | undefined>(undefined);
  const [videoDims, setVideoDims] = useState<[number, number] | undefined>(undefined);

  useEffect(() => {
    if (typeof form.img === 'string') setImgPreview(form.img);
    // don't touch imgPreview if form.img is a File
    if (typeof form.video === 'string') setVideoPreview(form.video);
    // don't touch videoPreview if form.video is a File
  }, [form.img, form.video, open]);

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
          borderRadius: '12px',
          boxShadow: '0 4px 24px 0 rgba(34, 41, 47, 0.18)',
          p: 0
        }
      }}
    >
      <DialogTitle sx={{ 
        fontWeight: 900, 
        fontSize: 28, 
        color: 'primary.main',
        borderBottom: '1px solid',
        borderColor: 'divider',
        pb: 2,
        textAlign: 'center',
        letterSpacing: 1
      }}>
        {editId ? "Edit Group Code" : "Add New Group Code"}
      </DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 3, pb: 1 }}>
          <TextField 
            label="Group Code Name" 
            name="name" 
            value={form.name} 
            onChange={handleChange} 
            required 
            fullWidth 
            disabled={submitting || viewOnly}
            InputProps={{ readOnly: viewOnly }}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                fontSize: 18,
                '& fieldset': { borderColor: 'divider' },
                '&:hover fieldset': { borderColor: 'primary.main' },
                '&.Mui-focused fieldset': { borderColor: 'primary.main' },
              },
            }}
          />
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
            {/* Image upload */}
            <Box sx={{ textAlign: 'center', minWidth: 160 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block', letterSpacing: 0.5 }}>Image</Typography>
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={imgInputRef}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setForm((prev: Groupcode) => ({ ...prev, img: file }));
                    setImgPreview(URL.createObjectURL(file));
                  }
                }}
              />
              <Button
                variant="outlined"
                onClick={() => imgInputRef.current?.click()}
                sx={{
                  borderRadius: '8px',
                  borderColor: '#bdc3c7',
                  color: '#7f8c8d',
                  fontWeight: 600,
                  mb: 1,
                  px: 2,
                  py: 1,
                  '&:hover': {
                    borderColor: '#95a5a6',
                    bgcolor: '#f8f9fa',
                  }
                }}
                disabled={submitting || viewOnly}
              >
                {imgPreview ? 'Change Image' : 'Upload Image'}
              </Button>
              {imgPreview && (
                <Box sx={{ mt: 1, textAlign: 'center' }}>
                  <img
                    src={imgPreview}
                    alt="Preview"
                    style={{ maxWidth: 120, borderRadius: 8, border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                    onLoad={e => {
                      const target = e.target as HTMLImageElement;
                      setImgDims([target.naturalWidth, target.naturalHeight]);
                    }}
                  />
                  {imgDims && (
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                      w: {imgDims[0]} h: {imgDims[1]}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
            {/* Video upload */}
            <Box sx={{ textAlign: 'center', minWidth: 160 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block', letterSpacing: 0.5 }}>Video</Typography>
              <input
                type="file"
                accept="video/*"
                style={{ display: 'none' }}
                ref={videoInputRef}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setForm((prev: Groupcode) => ({ ...prev, video: file }));
                    setVideoPreview(URL.createObjectURL(file));
                  }
                }}
              />
              <Button
                variant="outlined"
                onClick={() => videoInputRef.current?.click()}
                sx={{
                  borderRadius: '8px',
                  borderColor: '#bdc3c7',
                  color: '#7f8c8d',
                  fontWeight: 600,
                  mb: 1,
                  px: 2,
                  py: 1,
                  '&:hover': {
                    borderColor: '#95a5a6',
                    bgcolor: '#f8f9fa',
                  }
                }}
                disabled={submitting || viewOnly}
              >
                {videoPreview ? 'Change Video' : 'Upload Video'}
              </Button>
              {videoPreview && (
                <Box sx={{ mt: 1, textAlign: 'center' }}>
                  <video
                    src={videoPreview}
                    controls
                    style={{ maxWidth: 120, borderRadius: 8, border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                    onLoadedMetadata={e => {
                      const target = e.target as HTMLVideoElement;
                      setVideoDims([target.videoWidth, target.videoHeight]);
                    }}
                  />
                  {videoDims && (
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                      w: {videoDims[0]} h: {videoDims[1]}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, bgcolor: '#f8f9fa', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
          <Button 
            onClick={onClose} 
            sx={{ 
              fontWeight: 500, 
              borderRadius: '8px',
              color: '#7f8c8d',
              px: 3,
              py: 1.2,
              '&:hover': {
                backgroundColor: '#f0f0f0',
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
              fontWeight: 600, 
              borderRadius: '8px',
              bgcolor: 'primary.main',
              px: 3,
              py: 1.2,
              '&:hover': {
                bgcolor: 'primary.dark',
              }
            }} 
            disabled={submitting || viewOnly}
          >
            {submitting ? 'Saving...' : (editId ? 'Update' : 'Add Group Code')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
});

GroupcodeForm.displayName = 'GroupcodeForm';

// Helper to get current logged-in admin email from localStorage
function getCurrentAdminEmail() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin-email');
}

function getGroupcodePagePermission() {
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

export default function GroupcodePage() {
  // All hooks at the top
  const [pageAccess, setPageAccess] = useState<'full' | 'view' | 'denied'>('denied');
  const [groupcodes, setGroupcodes] = useState<Groupcode[]>([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Groupcode>({ name: "" });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 8;
  // Add state for image/video and previews
  // const [imgPreview, setImgPreview] = useState<string | null>(null);
  // const [videoPreview, setVideoPreview] = useState<string | null>(null);
  // const [imgDims, setImgDims] = useState<[number, number] | undefined>(undefined);
  // const [videoDims, setVideoDims] = useState<[number, number] | undefined>(undefined);
  // const imgInputRef = useRef<HTMLInputElement>(null);
  // const videoInputRef = useRef<HTMLInputElement>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewGroupcode, setViewGroupcode] = useState<Groupcode | null>(null);
  const [imgDims, setImgDims] = useState<[number, number] | undefined>(undefined);
  const [videoDims, setVideoDims] = useState<[number, number] | undefined>(undefined);

  function isFile(val: unknown): val is File {
    return typeof val === 'object' && val !== null && (val as File).name !== undefined;
  }

  const fetchGroupcodes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000/api"}/groupcode`);
      const data = await res.json();
      setGroupcodes(data.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroupcodes();
    setPageAccess(getGroupcodePagePermission());
  }, [fetchGroupcodes]);

  useEffect(() => {
    // Check permission from localStorage
    const permission = getGroupcodePagePermission();
    setPageAccess(permission);
  }, []);

  const handleOpen = useCallback((groupcode: Groupcode | null = null) => {
    setEditId(groupcode?._id || null);
    setForm(groupcode ? { ...groupcode } : { name: "" });
    // setImgPreview(groupcode?.img || null); // This will be handled by GroupcodeForm
    // setVideoPreview(groupcode?.video || null); // This will be handled by GroupcodeForm
    // setImgDims(undefined); // This will be handled by GroupcodeForm
    // setVideoDims(undefined); // This will be handled by GroupcodeForm
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    // setImgPreview(null); // This will be handled by GroupcodeForm
    // setVideoPreview(null); // This will be handled by GroupcodeForm
    // setImgDims(undefined); // This will be handled by GroupcodeForm
    // setVideoDims(undefined); // This will be handled by GroupcodeForm
    setForm({ name: "" });
    setEditId(null);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const method = editId ? "PUT" : "POST";
      const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000/api"}/groupcode${editId ? "/" + editId : ""}`;
      const formData = new FormData();
      formData.append("name", form.name);
      if (isFile(form.img)) formData.append("img", form.img);
      if (isFile(form.video)) formData.append("video", form.video);
      await fetch(url, {
        method,
        body: formData,
        // Do NOT set Content-Type, browser will set it automatically
      });
      fetchGroupcodes();
      handleClose();
    } finally {
      setSubmitting(false);
    }
  }, [form, editId, fetchGroupcodes, handleClose]);

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000/api"}/groupcode/${deleteId}`, { method: "DELETE" });
      setDeleteId(null);
      fetchGroupcodes();
    } catch (error) {
      console.error("Delete error:", error);
    }
  }, [deleteId, fetchGroupcodes]);

  const handleEdit = useCallback((groupcode: Groupcode) => {
    handleOpen(groupcode);
  }, [handleOpen]);

  const handleDeleteClick = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const handleView = useCallback(async (groupcode: Groupcode) => {
    await fetchGroupcodes(); // Always fetch latest before viewing
    // Find the latest groupcode by id
    const latest = groupcodes.find(g => g._id === groupcode._id) || groupcode;
    setViewGroupcode(latest);
    setViewDialogOpen(true);
    setImgDims(undefined);
    setVideoDims(undefined);
  }, [fetchGroupcodes, groupcodes]);
  const handleViewClose = useCallback(() => {
    setViewDialogOpen(false);
    setViewGroupcode(null);
    setImgDims(undefined);
    setVideoDims(undefined);
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

  // Filter groupcodes by search
  const filteredGroupcodes = groupcodes.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );
  
  // Pagination
  const paginatedGroupcodes = filteredGroupcodes.slice((page - 1) * rowsPerPage, page * rowsPerPage);

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
          <CodeIcon sx={{ mr: 0.5 }} fontSize="small" />
          Group Codes
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
            <CodeIcon sx={{ fontSize: 24 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ 
              fontWeight: 600, 
              color: 'text.primary',
              mb: 0.5
            }}>
              Group Code Management
            </Typography>
            <Typography variant="body2" sx={{ 
              color: 'text.secondary'
            }}>
              Manage your product group codes
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
          Add Group Code
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
              Group Codes ({filteredGroupcodes.length})
            </Typography>
            <Chip 
              label={`${paginatedGroupcodes.length} of ${filteredGroupcodes.length}`}
              size="small"
              sx={{ 
                bgcolor: 'error.main',
                color: 'white',
                fontWeight: 500
              }}
            />
          </Box>
          
          <TextField
            placeholder="Search group codes..."
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
                  borderColor: 'error.main',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'error.main',
                },
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Group Codes Table */}
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
                    Group Code Name
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
                {paginatedGroupcodes.map((groupcode) => (
                  <GroupcodeRow
                    key={groupcode._id}
                    groupcode={groupcode}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    onView={handleView}
                    viewOnly={pageAccess === 'view'}
                  />
                ))}
                {paginatedGroupcodes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                      No group codes found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredGroupcodes.length > rowsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={Math.ceil(filteredGroupcodes.length / rowsPerPage)}
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
      <GroupcodeForm
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
            Are you sure you want to delete this group code? This action cannot be undone.
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

      {/* View Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={handleViewClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 4px 24px 0 rgba(34, 41, 47, 0.18)',
            p: 0
          }
        }}
      >
        <DialogTitle sx={{
          fontWeight: 900,
          fontSize: 28,
          color: 'primary.main',
          borderBottom: '1px solid',
          borderColor: 'divider',
          pb: 2,
          textAlign: 'center',
          letterSpacing: 1
        }}>
          Group Code Details
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 3, pb: 1 }}>
          {viewGroupcode && (
            <>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, textAlign: 'center' }}>Groupcode: {viewGroupcode.name}</Typography>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
                {/* Image */}
                {viewGroupcode.img && (
                  <Box sx={{ textAlign: 'center', minWidth: 160 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block', letterSpacing: 0.5 }}>Image</Typography>
                    <img
                      src={viewGroupcode.img}
                      alt="Groupcode Image"
                      style={{ maxWidth: 220, borderRadius: 8, border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                      onLoad={e => {
                        const target = e.target as HTMLImageElement;
                        if (!imgDims) setImgDims([target.naturalWidth, target.naturalHeight]);
                      }}
                    />
                    {imgDims && (
                      <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                        w: {imgDims[0]} h: {imgDims[1]}
                      </Typography>
                    )}
                  </Box>
                )}
                {/* Video */}
                {viewGroupcode.video && (
                  <Box sx={{ textAlign: 'center', minWidth: 160 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block', letterSpacing: 0.5 }}>Video</Typography>
                    <video
                      src={viewGroupcode.video}
                      controls
                      style={{ maxWidth: 220, borderRadius: 8, border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                      onLoadedMetadata={e => {
                        const target = e.target as HTMLVideoElement;
                        if (!videoDims) setVideoDims([target.videoWidth, target.videoHeight]);
                      }}
                    />
                    {videoDims && (
                      <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                        w: {videoDims[0]} h: {videoDims[1]}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, bgcolor: '#f8f9fa', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
          <Button
            onClick={handleViewClose}
            sx={{
              fontWeight: 500,
              borderRadius: '8px',
              color: '#7f8c8d',
              px: 3,
              py: 1.2,
              '&:hover': {
                backgroundColor: '#f0f0f0',
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 