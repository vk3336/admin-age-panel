"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Chip, FormControl, 
  InputLabel, Select, MenuItem, Pagination, Snackbar, Alert, InputBase,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { apiFetch } from '../../utils/apiFetch';

// Removed unused BaseField and SectionField interfaces

interface StaticSEO {
  _id?: string;
  // Basic Identification
  name: string;
  slug?: string;
  
  // Standard Meta Tags
  title?: string;
  description?: string;
  keywords?: string;
  robots?: string;
  canonical_url?: string;
  excerpt?: string;
  description_html?: string;
  
  // HTML Meta Configuration
  charset?: string;
  xUaCompatible?: string;
  viewport?: string;
  contentLanguage?: string;
  googleSiteVerification?: string;
  msValidate?: string;
  themeColor?: string;
  mobileWebAppCapable?: string;
  appleStatusBarStyle?: string;
  formatDetection?: string;
  author_name?: string;
  
  // Open Graph
  ogLocale?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
  ogSiteName?: string;
  ogUrl?: string;
  openGraph?: {
    images?: string[];
    video?: {
      url?: string;
      secure_url?: string;
      type?: string;
      width?: number;
      height?: number;
    };
  };
  
  // Twitter
  twitterCard?: string;
  twitterSite?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitter?: {
    image?: string;
    player?: string;
    player_width?: number;
    player_height?: number;
  };
  
  // Internationalization
  hreflang?: string;
  x_default?: string;
  
  // JSON-LD
  VideoJsonLd?: string;
  LogoJsonLd?: string;
  BreadcrumbJsonLd?: string;
  LocalBusinessJsonLd?: string;
  
  // Status
  status?: 'draft' | 'published' | 'archived';
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
  
  // For form handling
  [key: string]: string | number | boolean | undefined | null | Date | Record<string, unknown> | Array<unknown>;
}

function getStaticSeoPagePermission() {
  // This function will be re-evaluated on the client side
  if (typeof window === 'undefined') return 'no access';
  
  try {
    const email = localStorage.getItem('admin-email');
    const superAdmin = process.env.NEXT_PUBLIC_SUPER_ADMIN;
    if (email && superAdmin && email === superAdmin) return 'all access';
    
    const perms = JSON.parse(localStorage.getItem('admin-permissions') || '{}');
    if (perms && perms.seo) {
      return perms.seo;
    }
  } catch (error) {
    console.error('Error checking permissions:', error);
  }
  
  return 'no access';
}

export default function StaticSeoPage() {
  const [staticSeos, setStaticSeos] = useState<Partial<StaticSEO>[]>([]);
  const [loading, setLoading] = useState(false);
  // Removed unused isSubmitting state
  const [editingSeo, setEditingSeo] = useState<Partial<StaticSEO> | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  const [pageAccess, setPageAccess] = useState<'all access' | 'only view' | 'no access'>('no access');
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedSeo, setSelectedSeo] = useState<Partial<StaticSEO> | null>(null);
  const [open, setOpen] = useState(false);
  
  // Update page access after component mounts (client-side only)
  useEffect(() => {
    setPageAccess(getStaticSeoPagePermission());
  }, []);

  const STATIC_SEO_FIELDS: Array<{
    section?: string;
    key?: string;
    label?: string;
    type?: 'text' | 'number' | 'textarea' | 'select' | 'color';
    options?: Array<{ value: string; label: string }>;
    placeholder?: string;
    required?: boolean;
  }> = [
    { section: "Basic Info" },
    { key: "name", label: "Name", type: "text", required: true, placeholder: "Enter name" },
    { key: "slug", label: "Slug", type: "text", placeholder: "Enter URL slug" },
    { key: "title", label: "Title", type: "text", placeholder: "Enter page title" },
    { key: "description", label: "Description", type: "text", placeholder: "Enter meta description" },
    { key: "keywords", label: "Keywords", type: "text", placeholder: "Enter keywords (comma separated)" },
    { key: "robots", label: "Robots", type: "text", placeholder: "e.g., index, follow" },
    { key: "canonical_url", label: "Canonical URL", type: "text", placeholder: "Enter canonical URL" },
    { key: "excerpt", label: "Excerpt", type: "text", placeholder: "Enter excerpt" },
    { key: "description_html", label: "Description HTML", type: "textarea", placeholder: "Enter HTML description" },
    { key: "charset", label: "Charset", type: "text", placeholder: "e.g., UTF-8" },
    { key: "xUaCompatible", label: "X-UA-Compatible", type: "text", placeholder: "e.g., IE=edge" },
    { key: "viewport", label: "Viewport", type: "text", placeholder: "e.g., width=device-width, initial-scale=1" },
    { key: "contentLanguage", label: "Content Language", type: "text", placeholder: "e.g., en-US" },
    { key: "googleSiteVerification", label: "Google Site Verification", type: "text", placeholder: "Enter verification code" },
    { key: "msValidate", label: "MS Validate", type: "text", placeholder: "Enter validation ID" },
    { key: "themeColor", label: "Theme Color", type: "text", placeholder: "e.g., #ffffff" },
    { key: "mobileWebAppCapable", label: "Mobile Web App Capable", type: "text", placeholder: "e.g., yes" },
    { key: "appleStatusBarStyle", label: "Apple Status Bar Style", type: "text", placeholder: "e.g., black-translucent" },
    { key: "formatDetection", label: "Format Detection", type: "text", placeholder: "e.g., telephone=no" },
    { key: "author_name", label: "Author Name", type: "text", placeholder: "Enter author name" },
    { section: "OpenGraph" },
    { key: "ogLocale", label: "OG Locale", type: "text", placeholder: "e.g., en_US" },
    { key: "ogTitle", label: "OG Title", type: "text", placeholder: "Enter OpenGraph title" },
    { key: "ogDescription", label: "OG Description", type: "text", placeholder: "Enter OpenGraph description" },
    { key: "ogType", label: "OG Type", type: "text", placeholder: "e.g., website, article" },
    { key: "ogSiteName", label: "OG Site Name", type: "text", placeholder: "Enter site name" },
    { key: "ogUrl", label: "OG URL", type: "text", placeholder: "Enter OpenGraph URL" },
    { key: "openGraph.images[0]", label: "OpenGraph Image URL", type: "text", placeholder: "Enter image URL" },
    { key: "openGraph.video.url", label: "OpenGraph Video URL", type: "text", placeholder: "Enter video URL" },
    { key: "openGraph.video.secure_url", label: "OpenGraph Video Secure URL", type: "text", placeholder: "Enter secure video URL" },
    { key: "openGraph.video.type", label: "OpenGraph Video Type", type: "text", placeholder: "e.g., video/mp4" },
    { key: "openGraph.video.width", label: "OpenGraph Video Width", type: "number", placeholder: "Enter width in pixels" },
    { key: "openGraph.video.height", label: "OpenGraph Video Height", type: "number", placeholder: "Enter height in pixels" },
    { section: "Twitter" },
    { key: "twitterCard", label: "Twitter Card", type: "text", placeholder: "e.g., summary_large_image" },
    { key: "twitterSite", label: "Twitter Site", type: "text", placeholder: "@username" },
    { key: "twitterTitle", label: "Twitter Title", type: "text", placeholder: "Enter Twitter card title" },
    { key: "twitterDescription", label: "Twitter Description", type: "text", placeholder: "Enter Twitter card description" },
    { key: "twitter.image", label: "Twitter Image URL", type: "text", placeholder: "Enter Twitter card image URL" },
    { key: "twitter.player", label: "Twitter Player URL", type: "text", placeholder: "Enter Twitter player URL" },
    { key: "twitter.player_width", label: "Twitter Player Width", type: "number", placeholder: "Enter player width" },
    { key: "twitter.player_height", label: "Twitter Player Height", type: "number", placeholder: "Enter player height" },
    { section: "Hreflang" },
    { key: "hreflang", label: "Hreflang", type: "text", placeholder: "e.g., en-US" },
    { key: "x_default", label: "X-Default Hreflang", type: "text", placeholder: "e.g., en" },
    { section: "Structured Data" },
    { key: "VideoJsonLd", label: "Video JSON-LD", type: "textarea", placeholder: "Enter Video JSON-LD script" },
    { key: "LogoJsonLd", label: "Logo JSON-LD", type: "textarea", placeholder: "Enter Logo JSON-LD script" },
    { key: "BreadcrumbJsonLd", label: "Breadcrumb JSON-LD", type: "textarea", placeholder: "Enter Breadcrumb JSON-LD script" },
    { key: "LocalBusinessJsonLd", label: "Local Business JSON-LD", type: "textarea", placeholder: "Enter Local Business JSON-LD script" },
    { section: "Status" },
    { 
      key: "status", 
      label: "Status", 
      type: "select", 
      placeholder: "Select status",
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'published', label: 'Published' },
        { value: 'archived', label: 'Archived' }
      ]
    },
  ];


  const fetchStaticSeos = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = `/static-seo?page=${page}${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ''}`;
      
      console.log('Fetching static SEOs from:', endpoint);
      const response = await apiFetch(endpoint);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received static SEOs data:', data);
      
      setStaticSeos(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching static SEOs:', error);
      // You might want to show an error toast/notification to the user here
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm]);

  useEffect(() => {
    fetchStaticSeos();
  }, [fetchStaticSeos]);

  const handleOpen = (seo?: Partial<StaticSEO>) => {
    if (seo) {
      setEditingSeo({ ...seo });
    } else {
      setEditingSeo({ status: 'draft' });
    }
    setOpen(true);
  };

  const handleView = (seo: Partial<StaticSEO>) => {
    setSelectedSeo(seo);
    setViewOpen(true);
  };

  const handleViewClose = () => {
    setViewOpen(false);
    setSelectedSeo(null);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingSeo(null);
  };

  type InputChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
  type GenericChangeEvent = { target: { name?: string; value: unknown } } | { currentTarget: { name?: string; value: unknown } } | { name: string; value: unknown };

  const handleChange = (e: InputChangeEvent | GenericChangeEvent) => {
    let name: string | undefined;
    let value: unknown;
    let type: string | undefined;

    if ('target' in e && e.target) {
      const target = e.target as { name?: string; value: unknown; type?: string };
      name = target.name;
      value = target.value;
      type = target.type;
    } else if ('currentTarget' in e && e.currentTarget) {
      const target = e.currentTarget as { name?: string; value: unknown };
      name = target.name;
      value = target.value;
    } else if ('name' in e && 'value' in e) {
      name = e.name;
      value = e.value;
    }

    if (!editingSeo || !name) return;

    // Helper type for nested objects that can contain arrays or nested objects
  type NestedObject = Record<string, unknown>;
  
  const updateNestedValue = (
    obj: NestedObject,
    path: string,
    value: unknown,
    type?: string
  ): NestedObject => {
      const [current, ...rest] = path.split('.');
      const arrayMatch = current.match(/(\w+)\[(\d+)\]/);
      
      if (arrayMatch) {
        const arrayName = arrayMatch[1];
        const index = parseInt(arrayMatch[2]);
        
        // Ensure the array exists and is actually an array
        if (!Array.isArray(obj[arrayName])) {
          obj[arrayName] = [];
        }
        
        // We know this is an array because we just ensured it above
        const currentArray = obj[arrayName] as unknown[];
        
        if (rest.length === 0) {
          const newArray = [...currentArray];
          newArray[index] = type === 'number' ? Number(value) : value;
          return { ...obj, [arrayName]: newArray } as NestedObject;
        }
        
        // Ensure the item at the index is an object
        if (!currentArray[index] || typeof currentArray[index] !== 'object' || currentArray[index] === null) {
          currentArray[index] = {} as NestedObject;
        }
        
        // Create a new array with the updated nested value
        const updatedArray = [
          ...currentArray.slice(0, index),
          updateNestedValue(currentArray[index] as NestedObject, rest.join('.'), value, type),
          ...currentArray.slice(index + 1)
        ];
        
        return {
          ...obj,
          [arrayName]: updatedArray
        } as NestedObject;
      }
      
      if (rest.length === 0) {
        return { ...obj, [current]: type === 'number' ? Number(value) : value } as NestedObject;
      }
      
      // Ensure the nested object exists and is actually an object
      const currentObj = obj[current];
      if (!currentObj || typeof currentObj !== 'object' || currentObj === null) {
        obj[current] = {} as NestedObject;
      }
      
      // Recursively update the nested object
      const updatedNested = updateNestedValue(
        obj[current] as NestedObject, 
        rest.join('.'), 
        value, 
        type
      );
      
      return {
        ...obj,
        [current]: updatedNested
      } as NestedObject;
    };

    setEditingSeo(prev => {
      if (!prev) return prev;
      // Cast the result to Partial<StaticSEO> since we know the structure matches
      return updateNestedValue({ ...prev }, name!, value, type) as unknown as Partial<StaticSEO>;
    });
  };

  const handleSubmit = async () => {   // No need to check for 'no access' here as it's already handled at the component level

    try {
      setLoading(true);
      if (editingSeo?._id) {
        // Update existing
        await apiFetch(`/static-seo/${editingSeo._id}`, {
          method: 'PUT',
          body: JSON.stringify(editingSeo)
        });
        setSnackbar({ open: true, message: 'Static SEO updated successfully', severity: 'success' });
      } else if (editingSeo) {
        // Create new
        await apiFetch('/static-seo', {
          method: 'POST',
          body: JSON.stringify(editingSeo)
        });
        setSnackbar({ open: true, message: 'Static SEO created successfully', severity: 'success' });
      }
      fetchStaticSeos();
      handleClose();
    } catch (error) {
      console.error('Error saving static SEO:', error);
      setSnackbar({ open: true, message: 'Failed to save static SEO', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (pageAccess !== 'all access') {
      setSnackbar({ open: true, message: 'You do not have permission to perform this action', severity: 'error' });
      return;
    }

    if (window.confirm('Are you sure you want to delete this static SEO entry?')) {
      try {
        await apiFetch(`/static-seo/${id}`, { method: 'DELETE' });
        setSnackbar({ open: true, message: 'Static SEO deleted successfully', severity: 'success' });
        fetchStaticSeos();
      } catch (error) {
        console.error('Error deleting static SEO:', error);
        setSnackbar({ open: true, message: 'Failed to delete static SEO', severity: 'error' });
      }
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown> | null, value: number) => {
    setPage(value);
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ p: 3 }}>
      {pageAccess === 'no access' ? (
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" color="error">
            You don&apos;t have permission to access this page.
          </Typography>
        </Box>
      ) : (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h4">Static SEO Management</Typography>
            {pageAccess === 'all access' && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleOpen()}
              >
                Add New Static SEO
              </Button>
            )}
          </Box>

          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', backgroundColor: 'background.paper', borderRadius: 1, px: 2, py: 1, maxWidth: 400 }}>
            <SearchIcon color="action" sx={{ mr: 1 }} />
            <InputBase
              placeholder="Search static SEO..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  fetchStaticSeos();
                }
              }}
              sx={{ flex: 1 }}
            />
          </Box>

      <Paper elevation={3} sx={{ mb: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.main' }}>
                <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Title</TableCell>
                <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Slug</TableCell>
                <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell align="right" sx={{ color: 'common.white', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : staticSeos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No static SEO entries found
                  </TableCell>
                </TableRow>
              ) : (
                staticSeos.map((seo) => (
                  <TableRow key={seo._id}>
                    <TableCell>{seo.name}</TableCell>
                    <TableCell>{seo.title || '-'}</TableCell>
                    <TableCell>{seo.slug || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={seo.status || 'draft'}
                        color={
                          seo.status === 'published' 
                            ? 'success' 
                            : seo.status === 'archived' 
                              ? 'default' 
                              : 'warning'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleView(seo)} title="View">
                        <VisibilityIcon color="info" />
                      </IconButton>
                      {pageAccess === 'all access' && (
                        <>
                          <IconButton onClick={() => handleOpen(seo)} title="Edit">
                            <EditIcon color="primary" />
                          </IconButton>
                          <IconButton onClick={() => seo._id && handleDelete(seo._id)} title="Delete">
                            <DeleteIcon color="error" />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
          showFirstButton
          showLastButton
        />
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth={true} scroll="paper">
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingSeo?._id ? 'Edit Static SEO' : 'Create New Static SEO'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2, maxHeight: '70vh', overflowY: 'auto', p: 1 }}>
              {STATIC_SEO_FIELDS.map((field, index) => {
                if ('section' in field) {
                  return (
                    <Typography key={`section-${index}`} variant="h6" sx={{ mt: 2, mb: 1, color: 'primary.main' }}>
                      {field.section}
                    </Typography>
                  );
                }

                if (!field.key) return null;

                type NestedValue = string | Record<string, unknown> | unknown[] | undefined;
                
                const value = field.key.split('.').reduce<NestedValue>((obj, key) => {
                  if (obj === null || obj === undefined) return '';
                  
                  const arrayMatch = key.match(/(\w+)\[(\d+)\]/);
                  if (arrayMatch) {
                    const arrayName = arrayMatch[1];
                    const index = parseInt(arrayMatch[2]);
                    if (typeof obj === 'object' && obj !== null && arrayName in obj) {
                      const arr = obj[arrayName as keyof typeof obj];
                      if (Array.isArray(arr)) {
                        return arr[index] ?? '';
                      }
                    }
                    return '';
                  }
                  
                  if (typeof obj === 'object' && obj !== null && key in obj) {
                    return obj[key as keyof typeof obj] as NestedValue;
                  }
                  
                  return '';
                }, editingSeo as NestedValue);

                if (field.type === 'select' && field.key) {
                  return (
                    <FormControl key={field.key} fullWidth margin="normal">
                      <InputLabel>{field.label}</InputLabel>
                      <Select
                        name={field.key}
                        value={value || ''}
                        onChange={handleChange}
                        label={field.label}
                      >
                        {field.options?.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  );
                }

                if (field.type === 'textarea') {
                  return (
                    <TextField
                      key={field.key}
                      name={field.key}
                      label={field.label}
                      value={value || ''}
                      onChange={handleChange}
                      multiline
                      rows={4}
                      fullWidth
                      margin="normal"
                      placeholder={field.placeholder}
                    />
                  );
                }

                if (field.key === 'themeColor') {
                  return (
                    <TextField
                      key={field.key}
                      name={field.key}
                      label="Theme Color (e.g., #ffffff or 'red')"
                      value={value || ''}
                      onChange={handleChange}
                      fullWidth
                      margin="normal"
                      placeholder="Enter color value (hex, rgb, or named color)"
                    />
                  );
                }

                return (
                  <TextField
                    key={field.key}
                    name={field.key}
                    label={field.label}
                    value={value || ''}
                    onChange={handleChange}
                    type={field.type === 'number' ? 'number' : 'text'}
                    fullWidth
                    margin="normal"
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                );
              })}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingSeo?._id ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* View Dialog */}
      <Dialog 
        open={viewOpen} 
        onClose={handleViewClose} 
        maxWidth="md" 
        fullWidth
        scroll="paper"
      >
        <DialogTitle>View SEO Details</DialogTitle>
        <DialogContent>
          {selectedSeo ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', borderBottom: '1px solid #eee', pb: 1 }}>
                Basic Information
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2, mb: 3 }}>
                {selectedSeo.name && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Name</Typography>
                    <Typography>{selectedSeo.name}</Typography>
                  </Box>
                )}
                {selectedSeo.slug && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Slug</Typography>
                    <Typography>{selectedSeo.slug}</Typography>
                  </Box>
                )}
                {selectedSeo.status && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                    <Chip 
                      label={selectedSeo.status} 
                      color={
                        selectedSeo.status === 'published' 
                          ? 'success' 
                          : selectedSeo.status === 'archived' 
                            ? 'default' 
                            : 'warning'
                      }
                      size="small"
                    />
                  </Box>
                )}
              </Box>

              {/* Meta Tags Section */}
              {(selectedSeo.title || selectedSeo.description || selectedSeo.keywords) && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', borderBottom: '1px solid #eee', pb: 1 }}>
                    Meta Tags
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
                    {selectedSeo.title && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Title</Typography>
                        <Typography>{selectedSeo.title}</Typography>
                      </Box>
                    )}
                    {selectedSeo.description && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                        <Typography>{selectedSeo.description}</Typography>
                      </Box>
                    )}
                    {selectedSeo.keywords && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Keywords</Typography>
                        <Typography>{selectedSeo.keywords}</Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              )}

              {/* Open Graph Section */}
              {(selectedSeo.ogTitle || selectedSeo.ogDescription || selectedSeo.ogType) && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', borderBottom: '1px solid #eee', pb: 1 }}>
                    Open Graph
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
                    {selectedSeo.ogTitle && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">OG Title</Typography>
                        <Typography>{selectedSeo.ogTitle}</Typography>
                      </Box>
                    )}
                    {selectedSeo.ogDescription && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">OG Description</Typography>
                        <Typography>{selectedSeo.ogDescription}</Typography>
                      </Box>
                    )}
                    {selectedSeo.ogType && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">OG Type</Typography>
                        <Typography>{selectedSeo.ogType}</Typography>
                      </Box>
                    )}
                    {selectedSeo.openGraph?.images?.[0] && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">OG Image</Typography>
                        <Box component="img" 
                          src={selectedSeo.openGraph.images[0]} 
                          alt="OpenGraph" 
                          sx={{ maxWidth: '100%', maxHeight: '200px', mt: 1, borderRadius: 1 }}
                        />
                      </Box>
                    )}
                  </Box>
                </Box>
              )}

              {/* Twitter Card Section */}
              {(selectedSeo.twitterTitle || selectedSeo.twitterDescription || selectedSeo.twitterCard) && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', borderBottom: '1px solid #eee', pb: 1 }}>
                    Twitter Card
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
                    {selectedSeo.twitterCard && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Card Type</Typography>
                        <Typography>{selectedSeo.twitterCard}</Typography>
                      </Box>
                    )}
                    {selectedSeo.twitterTitle && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Twitter Title</Typography>
                        <Typography>{selectedSeo.twitterTitle}</Typography>
                      </Box>
                    )}
                    {selectedSeo.twitterDescription && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Twitter Description</Typography>
                        <Typography>{selectedSeo.twitterDescription}</Typography>
                      </Box>
                    )}
                    {selectedSeo.twitter?.image && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Twitter Image</Typography>
                        <Box component="img" 
                          src={selectedSeo.twitter.image} 
                          alt="Twitter Card" 
                          sx={{ maxWidth: '100%', maxHeight: '200px', mt: 1, borderRadius: 1 }}
                        />
                      </Box>
                    )}
                  </Box>
                </Box>
              )}

              {/* JSON-LD Section */}
              {(selectedSeo.VideoJsonLd || selectedSeo.LogoJsonLd || selectedSeo.BreadcrumbJsonLd || selectedSeo.LocalBusinessJsonLd) && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', borderBottom: '1px solid #eee', pb: 1 }}>
                    Structured Data
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {selectedSeo.VideoJsonLd && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Video JSON-LD</Typography>
                        <Box component="pre" sx={{ 
                          p: 2, 
                          bgcolor: '#f5f5f5', 
                          borderRadius: 1, 
                          overflow: 'auto',
                          maxHeight: '200px',
                          fontSize: '0.8rem'
                        }}>
                          {selectedSeo.VideoJsonLd}
                        </Box>
                      </Box>
                    )}
                    {selectedSeo.LogoJsonLd && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Logo JSON-LD</Typography>
                        <Box component="pre" sx={{ 
                          p: 2, 
                          bgcolor: '#f5f5f5', 
                          borderRadius: 1, 
                          overflow: 'auto',
                          maxHeight: '200px',
                          fontSize: '0.8rem'
                        }}>
                          {selectedSeo.LogoJsonLd}
                        </Box>
                      </Box>
                    )}
                    {selectedSeo.BreadcrumbJsonLd && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Breadcrumb JSON-LD</Typography>
                        <Box component="pre" sx={{ 
                          p: 2, 
                          bgcolor: '#f5f5f5', 
                          borderRadius: 1, 
                          overflow: 'auto',
                          maxHeight: '200px',
                          fontSize: '0.8rem'
                        }}>
                          {selectedSeo.BreadcrumbJsonLd}
                        </Box>
                      </Box>
                    )}
                    {selectedSeo.LocalBusinessJsonLd && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Local Business JSON-LD</Typography>
                        <Box component="pre" sx={{ 
                          p: 2, 
                          bgcolor: '#f5f5f5', 
                          borderRadius: 1, 
                          overflow: 'auto',
                          maxHeight: '200px',
                          fontSize: '0.8rem'
                        }}>
                          {selectedSeo.LocalBusinessJsonLd}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
              )}

              {/* Timestamps */}
              {(selectedSeo.createdAt || selectedSeo.updatedAt) && (
                <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #eee' }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Timestamps</Typography>
                  <Box sx={{ display: 'flex', gap: 3 }}>
                    {selectedSeo.createdAt && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">Created At</Typography>
                        <Typography variant="body2">
                          {new Date(selectedSeo.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                    )}
                    {selectedSeo.updatedAt && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">Updated At</Typography>
                        <Typography variant="body2">
                          {new Date(selectedSeo.updatedAt).toLocaleString()}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          ) : (
            <Typography>No data available</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleViewClose}>Close</Button>
        </DialogActions>
      </Dialog>
        </Box>
      )}
    </Box>
  );
}
