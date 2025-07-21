"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Chip, Autocomplete, ListItem, ListItemAvatar, ListItemText, Checkbox, FormControlLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Avatar } from '@mui/material';
import { Pagination } from '@mui/material';
import { apiFetch } from '../../utils/apiFetch';

// --- SEO Model Fields ---
const SEO_FIELDS = [
  { section: "Basic Info" },
  { key: "product", label: "Product", type: "select" },
  { key: "purchasePrice", label: "Purchase Price", type: "number" },
  { key: "salesPrice", label: "Sales Price", type: "number" },
  { key: "locationCode", label: "Location Code", type: "text" },
  { key: "productIdentifier", label: "Product Identifier", type: "text" },
  { key: "sku", label: "SKU", type: "text" },
  { key: "productdescription", label: "Product Description", type: "text" },
  { key: "popularproduct", label: "Popular Product", type: "checkbox" },
  { key: "topratedproduct", label: "Top Rated Product", type: "checkbox" },
  { key: "slug", label: "Slug", type: "text" },
  { key: "title", label: "Title", type: "text" },
  { key: "description", label: "Description", type: "text" },
  { section: "OpenGraph" },
  { key: "ogTitle", label: "OG Title", type: "text" },
  { key: "ogDescription", label: "OG Description", type: "text" },
  { key: "ogType", label: "OG Type", type: "text" },
  { key: "ogSiteName", label: "OG Site Name", type: "text" },
  { key: "openGraph.images", label: "OpenGraph Images (comma separated)", type: "text" },
  { key: "openGraph.video.url", label: "OpenGraph Video URL", type: "text" },
  { key: "openGraph.video.secure_url", label: "OpenGraph Video Secure URL", type: "text" },
  { key: "openGraph.video.type", label: "OpenGraph Video Type", type: "text" },
  { key: "openGraph.video.width", label: "OpenGraph Video Width", type: "number" },
  { key: "openGraph.video.height", label: "OpenGraph Video Height", type: "number" },
  { section: "Twitter" },
  { key: "twitterCard", label: "Twitter Card", type: "text" },
  { key: "twitterSite", label: "Twitter Site", type: "text" },
  { key: "twitterTitle", label: "Twitter Title", type: "text" },
  { key: "twitterDescription", label: "Twitter Description", type: "text" },
  { key: "twitter.image", label: "Twitter Image", type: "text" },
  { key: "twitter.player", label: "Twitter Player", type: "text" },
  { key: "twitter.player_width", label: "Twitter Player Width", type: "number" },
  { key: "twitter.player_height", label: "Twitter Player Height", type: "number" },
  { section: "JsonLd" },
  { key: "VideoJsonLd", label: "VideoJsonLd", type: "text" },
  { key: "LogoJsonLd", label: "LogoJsonLd", type: "text" },
  { key: "BreadcrumbJsonLd", label: "BreadcrumbJsonLd", type: "text" },
  { key: "LocalBusinessJsonLd", label: "LocalBusinessJsonLd", type: "text" },
  { section: "Other Meta" },
  { key: "canonical_url", label: "Canonical URL", type: "text" },
  { key: "ogUrl", label: "OG URL", type: "text" },
  { key: "excerpt", label: "Excerpt", type: "text" },
  { key: "description_html", label: "Description HTML", type: "text" },
  { key: "rating_value", label: "Rating Value", type: "number" },
  { key: "rating_count", label: "Rating Count", type: "number" },
  { key: "charset", label: "Charset", type: "text" },
  { key: "xUaCompatible", label: "X-UA-Compatible", type: "text" },
  { key: "viewport", label: "Viewport", type: "text" },
  { key: "keywords", label: "Keywords", type: "text" },
  { key: "robots", label: "Robots", type: "text" },
  { key: "contentLanguage", label: "Content Language", type: "text" },
  { key: "googleSiteVerification", label: "Google Site Verification", type: "text" },
  { key: "msValidate", label: "MS Validate", type: "text" },
  { key: "themeColor", label: "Theme Color", type: "text" },
  { key: "mobileWebAppCapable", label: "Mobile Web App Capable", type: "text" },
  { key: "appleStatusBarStyle", label: "Apple Status Bar Style", type: "text" },
  { key: "formatDetection", label: "Format Detection", type: "text" },
  { key: "ogLocale", label: "OG Locale", type: "text" },
  { key: "hreflang", label: "Hreflang", type: "text" },
  { key: "x_default", label: "X-Default", type: "text" },
  { key: "author_name", label: "Author Name", type: "text" },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getSeoPagePermission() {
  if (typeof window === 'undefined') return 'no access';
  const email = localStorage.getItem('admin-email');
  const superAdmin = process.env.NEXT_PUBLIC_SUPER_ADMIN;
  if (email && superAdmin && email === superAdmin) return 'all access';
  const perms = JSON.parse(localStorage.getItem('admin-permissions') || '{}');
  if (perms && perms.seo) {
    return perms.seo;
  }
  return 'no access';
}

interface Product {
  _id: string;
  name: string;
  img?: string;
}

// Type guards for dynamic property access
function hasName(obj: unknown): obj is { name: string } {
  return Boolean(obj && typeof obj === 'object' && 'name' in obj && typeof (obj as { name?: unknown }).name === 'string');
}
function hasImg(obj: unknown): obj is { img: string } {
  return Boolean(obj && typeof obj === 'object' && 'img' in obj && typeof (obj as { img?: unknown }).img === 'string');
}

function SeoPage() {
  const [seoList, setSeoList] = useState<Record<string, unknown>[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedSeo, setSelectedSeo] = useState<Record<string, unknown> | null>(null);
  const [pageAccess, setPageAccess] = useState<'all access' | 'only view' | 'no access'>('no access');

  // Fetch products for dropdown
  useEffect(() => {
    apiFetch(`${API_URL}/product?limit=100`)
      .then(res => res.json())
      .then(data => setProducts(data.data || []));
  }, []);

  // Fetch SEO list
  const fetchSeo = useCallback(() => {
    setLoading(true);
    apiFetch(`${API_URL}/seo?page=1&limit=100${search ? `&search=${encodeURIComponent(search)}` : ""}`)
      .then(res => res.json())
      .then(data => {
        setSeoList(data.data || []);
        setTotalPages(data.pagination?.pages || 1);
      })
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    fetchSeo();
    setPageAccess(getSeoPagePermission());
  }, [fetchSeo]);

  // Handlers
  const handleOpen = (item?: Record<string, unknown>) => {
    setEditId(item && typeof item._id === 'string' ? item._id : null);
    // Initialize form with all fields, including nested
    const newForm: Record<string, unknown> = {};
    SEO_FIELDS.forEach(f => {
      if (typeof f.key === 'string') {
        if (f.key.includes('.')) {
          const keys = f.key.split('.');
          let obj = newForm;
          let src = item as Record<string, unknown>;
          for (let i = 0; i < keys.length - 1; i++) {
            if (!obj[keys[i]]) obj[keys[i]] = {};
            obj = obj[keys[i]] as Record<string, unknown>;
            src = (src && typeof src === 'object' && src[keys[i]]) ? src[keys[i]] as Record<string, unknown> : {};
          }
          obj[keys[keys.length - 1]] = src && typeof src === 'object' && keys[keys.length - 1] in src ? src[keys[keys.length - 1]] : '';
        } else {
          newForm[f.key] = item && typeof item === 'object' && f.key in item ? item[f.key] : '';
        }
      }
    });
    // Special handling for product field
    if (item && typeof item === 'object' && item.product) {
      newForm.product = item.product && typeof item.product === 'object' && '_id' in item.product && typeof (item.product as { _id: string })._id === 'string'
        ? (item.product as { _id: string })._id
        : item.product;
    }
    setForm(item ? newForm : {});
    setOpen(true);
  };
  const handleClose = () => { setOpen(false); setEditId(null); setForm({}); };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleProductChange = (_: React.SyntheticEvent, value: { label: string; value: string; img?: string } | null) => {
    const productId = value ? value.value : '';
    const existingSeo = seoList.find(seo =>
      seo.product &&
      typeof seo.product === 'object' &&
      seo.product !== null &&
      '_id' in seo.product &&
      typeof (seo.product as unknown as { _id: string })._id === 'string' &&
      ((seo.product as unknown as { _id: string })._id === productId)
    );
    if (existingSeo) {
      // Deeply initialize all fields from SEO_FIELDS
      const newForm: Record<string, unknown> = { product: productId };
      SEO_FIELDS.forEach(f => {
        if (typeof f.key === 'string') {
          if (f.key.includes('.')) {
            const keys = f.key.split('.');
            let obj = newForm;
            let src = existingSeo as Record<string, unknown>;
            for (let i = 0; i < keys.length - 1; i++) {
              if (!obj[keys[i]]) obj[keys[i]] = {};
              obj = obj[keys[i]] as Record<string, unknown>;
              src = (src && typeof src === 'object' && src[keys[i]]) ? src[keys[i]] as Record<string, unknown> : {};
            }
            obj[keys[keys.length - 1]] = src && typeof src === 'object' && keys[keys.length - 1] in src ? src[keys[keys.length - 1]] : '';
          } else {
            newForm[f.key] = (existingSeo as Record<string, unknown>)[f.key] ?? '';
          }
        }
      });
      setForm(newForm);
    } else {
      setForm((prev) => ({ ...prev, product: productId }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate product field
    if (!products.find(p => p._id === form.product)) {
      alert('Please select a valid product from the dropdown.');
      return;
    }
    setSubmitting(true);
    const method = editId ? "PUT" : "POST";
    const url = editId ? `${API_URL}/seo/${editId}` : `${API_URL}/seo`;
    const body = { ...form };
    // Convert number fields
    SEO_FIELDS.forEach(f => {
      if (f.type === "number" && body[f.key] !== undefined && body[f.key] !== "") {
        body[f.key] = Number(body[f.key]);
      }
    });
    // Remove empty fields
    Object.keys(body).forEach(k => (body[k] === "" || body[k] === undefined) && delete body[k]);
    const res = await apiFetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setSearch("");      // Clear search so new entry is visible
      handleClose();      // Close dialog first
      await fetchSeo();   // Then fetch latest data
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    // Only call window.confirm in the browser
    if (typeof window !== 'undefined' && !window.confirm("Are you sure you want to delete this SEO entry?")) return;
    setLoading(true);
    await apiFetch(`${API_URL}/seo/${id}`, { method: "DELETE" });
    await fetchSeo(); // Always refresh after delete
    setLoading(false);
  };

  // Helper to get product image URL
  function getProductImageUrl(product: { img?: string } | undefined): string | undefined {
    if (!product) return undefined;
    if (product.img && (product.img.startsWith('http://') || product.img.startsWith('https://'))) return product.img;
    if (product.img) return `${API_URL}/images/${product.img}`;
    return undefined;
  }

  // Render
  if (pageAccess === 'no access') {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" sx={{ color: '#e74c3c', mb: 2 }}>
          Access Denied
        </Typography>
        <Typography variant="body1" sx={{ color: '#7f8c8d' }}>
          You don&apos;t have permission to access this page.
        </Typography>
      </Box>
    );
  }

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
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#2c3e50' }}>
            SEO Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
            disabled={pageAccess === 'only view'}
            sx={{
              bgcolor: '#3498db',
              '&:hover': { bgcolor: '#2980b9' },
              borderRadius: '8px',
              px: 3,
              py: 1.5,
              fontWeight: 600
            }}
          >
            Add SEO
          </Button>
        </Box>
        <Typography variant="body1" sx={{ color: '#7f8c8d', fontSize: '16px' }}>
          Manage your SEO entries
        </Typography>
      </Box>

      {/* Search and Stats */}
      <Paper sx={{
        p: 3,
        borderRadius: '12px',
        background: '#fff',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        border: '1px solid #ecf0f1',
        mb: 4
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#f8f9fa',
            borderRadius: '8px',
            px: 2,
            py: 1,
            flex: 1,
            border: '1px solid #ecf0f1'
          }}>
            <SearchIcon sx={{ color: '#7f8c8d', mr: 1 }} />
            <InputBase
              placeholder="Search by slug, title, product..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              sx={{ flex: 1, fontSize: '14px' }}
            />
          </Box>
          <Chip
            icon={<SearchIcon />}
            label={`${seoList.length} SEO`}
            sx={{
              bgcolor: '#3498db',
              color: 'white',
              fontWeight: 600
            }}
          />
        </Box>
      </Paper>

      {/* Table Section */}
      <Paper sx={{
        borderRadius: '12px',
        background: '#fff',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        border: '1px solid #ecf0f1',
        overflow: 'hidden'
      }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                <TableCell sx={{ fontWeight: 600, color: '#2c3e50', fontSize: '14px' }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#2c3e50', fontSize: '14px' }}>Slug</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#2c3e50', fontSize: '14px' }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#2c3e50', fontSize: '14px' }}>Popular</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#2c3e50', fontSize: '14px' }}>Top Rated</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#2c3e50', fontSize: '14px' }}>Rating</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#2c3e50', fontSize: '14px' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} align="center">Loading...</TableCell></TableRow>
              ) : seoList.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center">No SEO entries found.</TableCell></TableRow>
              ) : seoList.map(seo => (
                <TableRow key={typeof seo._id === 'string' ? seo._id : ''} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        src={hasImg(seo.product) ? (seo.product.img.startsWith('http') ? seo.product.img : `${API_URL}/images/${seo.product.img}`) : undefined}
                        sx={{ width: 32, height: 32, mr: 1 }}
                      >
                        {hasName(seo.product) ? seo.product.name[0] : '-'}
                      </Avatar>
                      {hasName(seo.product) ? seo.product.name : "-"}
                    </Box>
                  </TableCell>
                  <TableCell>{typeof seo.slug === 'string' ? seo.slug : '-'}</TableCell>
                  <TableCell>{typeof seo.title === 'string' ? seo.title : '-'}</TableCell>
                  <TableCell>{seo.popularproduct ? "Yes" : "No"}</TableCell>
                  <TableCell>{seo.topratedproduct ? "Yes" : "No"}</TableCell>
                  <TableCell>{typeof seo.rating_value === 'number' ? seo.rating_value : '-'}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleOpen(seo)} disabled={pageAccess === 'only view'}><EditIcon /></IconButton>
                    <IconButton color="info" onClick={() => { setSelectedSeo(seo); setViewOpen(true); }}><VisibilityIcon /></IconButton>
                    <IconButton color="error" onClick={() => typeof seo._id === 'string' && handleDelete(seo._id)} disabled={pageAccess === 'only view'}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3, borderTop: '1px solid #ecf0f1' }}>
          <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" sx={{ '& .MuiPaginationItem-root': { borderRadius: '6px' } }} />
        </Box>
      </Paper>

      {/* Dialogs remain unchanged */}
      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 900, fontSize: 28 }}>{editId ? "Edit SEO" : "Add SEO"}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, pt: 2 }}>
            {SEO_FIELDS.map(field => {
              if (field.section) {
                return (
                  <Box key={field.section} sx={{ width: '100%', mt: 3, mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {field.section}
                    </Typography>
                  </Box>
                );
              }
              if (!field.key) return null;
              // Only use field.key as an index if it's defined
              if (field.type === "select") {
                // Product field: use products list, no freeSolo
                return (
                  <Autocomplete
                    key={field.key}
                    options={products.map((p: Product) => ({ label: p.name, value: p._id, img: p.img }))}
                    getOptionLabel={option => {
                      if (!option) return '';
                      if (typeof option === 'string') return option;
                      if (typeof option === 'object' && 'label' in option) return String(option.label);
                      return String(option);
                    }}
                    value={
                      products.find(p => typeof field.key === 'string' && p._id === form[field.key])
                        ? {
                            label: String(products.find(p => typeof field.key === 'string' && p._id === form[field.key])?.name ?? ''),
                            value: String(typeof field.key === 'string' ? form[field.key] ?? '' : ''),
                            img: products.find(p => typeof field.key === 'string' && p._id === form[field.key])?.img
                          }
                        : null
                    }
                    onChange={(_event: React.SyntheticEvent, value: { label: string; value: string; img?: string } | null) => handleProductChange(_event, value)}
                    renderInput={(params) => (
                      <TextField {...params} label={field.label} name={field.key} required disabled={pageAccess === 'only view'} />
                    )}
                    renderOption={(props, option, { index }) => (
                      <ListItem {...props} key={option.value || option.label || index}>
                        <ListItemAvatar>
                          <Avatar src={option.img ? (option.img.startsWith('http') ? option.img : `${API_URL}/images/${option.img}`) : undefined}>
                            {typeof option.label === 'string' ? option.label[0] : '-'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={typeof option.label === 'string' ? option.label : '-'} />
                      </ListItem>
                    )}
                    disabled={pageAccess === 'only view'}
                    sx={{ minWidth: 220 }}
                  />
                );
              } else if (field.type === "checkbox") {
                return (
                <FormControlLabel
                  key={field.key}
                  control={<Checkbox checked={!!form[field.key]} onChange={handleChange} name={field.key} />}
                  label={field.label}
                  sx={{ minWidth: 220 }}
                  disabled={pageAccess === 'only view'}
                />
                );
              } else {
                // Support nested fields (dot notation)
                if (!field.key) return null;
                const value = typeof field.key === 'string'
                  ? field.key.split('.').reduce((acc: unknown, k: string) => (acc && typeof acc === 'object' && k in acc) ? (acc as Record<string, unknown>)[k] : undefined, form) ?? "-"
                  : "-";
                return (
                <TextField
                  key={field.key}
                  label={field.label}
                  name={field.key}
                    value={value}
                    onChange={e => {
                      if (!field.key) return;
                      const keys = field.key.split('.');
                      setForm((prev) => {
                        const updated = { ...prev };
                        let obj = updated;
                        for (let i = 0; i < keys.length - 1; i++) {
                          const k = keys[i];
                          if (typeof k !== 'string' || !k) continue;
                          if (!obj[k]) obj[k] = {};
                          obj = obj[k] as Record<string, unknown>;
                        }
                        const lastKey = keys[keys.length - 1];
                        if (typeof lastKey === 'string' && lastKey) {
                          obj[lastKey] = field.key === 'openGraph.images' ? e.target.value : (field.type === 'number' ? Number(e.target.value) : e.target.value);
                        }
                        return updated;
                      });
                    }}
                  type={field.type}
                  fullWidth
                  sx={{ minWidth: 220 }}
                  disabled={pageAccess === 'only view'}
                    helperText={field.key === 'openGraph.images' ? 'Separate multiple images with commas' : ''}
                />
                );
              }
            })}
          </DialogContent>
          <DialogActions sx={{ pr: 3, pb: 2 }}>
            <Button onClick={handleClose} sx={{ fontWeight: 700, borderRadius: 3 }} disabled={pageAccess === 'only view'}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ fontWeight: 900, borderRadius: 3 }} disabled={pageAccess === 'only view' || submitting}>{editId ? "Update" : "Add"}</Button>
          </DialogActions>
        </form>
      </Dialog>
      {/* View Dialog */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 900, fontSize: 28 }}>SEO Details</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedSeo && (
            <Box>
              {/* Product Info at the top */}
              <Box display="flex" alignItems="center" gap={3} mb={4}>
                <Avatar
                  variant="rounded"
                  src={hasImg(selectedSeo.product) ? getProductImageUrl(selectedSeo.product as { img?: string }) : undefined}
                  sx={{ width: 100, height: 100, mr: 2 }}
                >
                  {hasName(selectedSeo.product) ? selectedSeo.product.name[0] : "-"}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700} color="primary">
                    {hasName(selectedSeo.product) ? selectedSeo.product.name : "-"}
                  </Typography>
                  <Typography variant="subtitle2" color="textSecondary">
                    Product
                  </Typography>
                </Box>
              </Box>
              {/* Group fields by section for display */}
              {(() => {
                let currentSection: string | null = null;
                let sectionFields: React.ReactNode[] = [];
                const sections: React.ReactNode[] = [];
                SEO_FIELDS.forEach(field => {
                  if (field.section) {
                    if (sectionFields.length > 0 && currentSection !== null) {
                      sections.push(
                        <Box key={currentSection} mb={3}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                            {currentSection}
                          </Typography>
                          <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
                            {sectionFields}
                          </Box>
                        </Box>
                      );
                      sectionFields = [];
                    }
                    currentSection = field.section;
                  } else if (field.key) {
                    // Support nested fields for view
                    const value = typeof field.key === 'string'
                      ? field.key.split('.').reduce((acc: unknown, k: string) => (acc && typeof acc === 'object' && k in acc) ? (acc as Record<string, unknown>)[k] : undefined, selectedSeo) ?? "-"
                      : "-";
                    sectionFields.push(
                      <Box key={field.key} minWidth={180}>
                        <Typography variant="subtitle2" color="textSecondary" fontWeight={600}>{field.label}</Typography>
                        <Typography variant="body1">
                          {typeof value === "boolean"
                            ? (value ? "Yes" : "No")
                            : Array.isArray(value)
                              ? value.join(", ")
                              : (typeof value === "object" && value !== null)
                                ? (hasName(value) ? value.name : JSON.stringify(value))
                                : typeof value === "string" || typeof value === "number"
                                  ? value
                                  : String(value)}
                        </Typography>
                      </Box>
                    );
                  }
                });
                // Push last section
                if (sectionFields.length > 0 && currentSection !== null) {
                  sections.push(
                    <Box key={currentSection} mb={3}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                        {currentSection}
                      </Typography>
                      <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
                        {sectionFields}
                      </Box>
                    </Box>
                  );
                }
                return sections;
              })()}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ pr: 3, pb: 2 }}>
          <Button onClick={() => setViewOpen(false)} sx={{ fontWeight: 700, borderRadius: 3 }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

import dynamic from 'next/dynamic';

const SeoPageComponent = SeoPage;
export default dynamic(() => Promise.resolve(SeoPageComponent), { ssr: false }); 