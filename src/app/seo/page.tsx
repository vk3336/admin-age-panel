"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, MenuItem, Select, InputLabel, FormControl, CircularProgress, Pagination, Checkbox, FormControlLabel, Avatar, Chip, Autocomplete, ListItem, ListItemAvatar, ListItemText
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import VisibilityIcon from '@mui/icons-material/Visibility';

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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000/api";

function getCurrentAdminEmail() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin-email');
}

function getSeoPagePermission() {
  if (typeof window === 'undefined') return 'denied';
  const email = localStorage.getItem('admin-email');
  if (!email) return 'denied';
  const perms = JSON.parse(localStorage.getItem('admin-permissions') || '{}');
  let adminPerm = email ? perms[email] : undefined;
  if (typeof adminPerm === 'string') {
    try { adminPerm = JSON.parse(adminPerm); } catch {}
  }
  return adminPerm?.seoPermission || 'denied';
}

function SeoPage() {
  const [seoList, setSeoList] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedSeo, setSelectedSeo] = useState<any | null>(null);
  const [viewOnly, setViewOnly] = useState<boolean>(false);
  const [pageAccess, setPageAccess] = useState<'full' | 'view' | 'denied'>('denied');

  // Fetch products for dropdown
  useEffect(() => {
    fetch(`${API_URL}/product?limit=1000`)
      .then(res => res.json())
      .then(data => setProducts(data.data || []));
  }, []);

  // Fetch SEO list
  const fetchSeo = useCallback(() => {
    setLoading(true);
    fetch(`${API_URL}/seo?page=1&limit=100${search ? `&search=${encodeURIComponent(search)}` : ""}`)
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
  const handleOpen = (item?: any) => {
    setEditId(item?._id || null);
    setForm(item ? { ...item, product: item.product?._id || item.product } : {});
    setOpen(true);
  };
  const handleClose = () => { setOpen(false); setEditId(null); setForm({}); };

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleProductChange = (_: any, value: any) => {
    const productId = value ? value.value : '';
    // Find SEO for this product
    const existingSeo = seoList.find(seo => seo.product && (seo.product._id === productId || seo.product === productId));
    if (existingSeo) {
      // Fill all fields except product
      const newForm: any = { product: productId };
      SEO_FIELDS.forEach(f => {
        if (f.key !== 'product') newForm[f.key] = existingSeo[f.key] ?? '';
      });
      setForm(newForm);
    } else {
      // Only update product, keep other fields as-is
      setForm((prev: any) => ({ ...prev, product: productId }));
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
    const res = await fetch(url, {
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
    await fetch(`${API_URL}/seo/${id}`, { method: "DELETE" });
    await fetchSeo(); // Always refresh after delete
    setLoading(false);
  };

  // Helper to get product image URL
  function getProductImageUrl(product: any): string | undefined {
    if (!product) return undefined;
    if (product.img && (product.img.startsWith('http://') || product.img.startsWith('https://'))) return product.img;
    if (product.img) return `${API_URL}/images/${product.img}`;
    return undefined;
  }

  // Render
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
            disabled={pageAccess === 'view'}
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
                <TableRow><TableCell colSpan={7} align="center"><CircularProgress /></TableCell></TableRow>
              ) : seoList.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center">No SEO entries found.</TableCell></TableRow>
              ) : seoList.map(seo => (
                <TableRow key={seo._id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        src={seo.product?.img ? (seo.product.img.startsWith('http') ? seo.product.img : `${API_URL}/images/${seo.product.img}`) : undefined}
                        sx={{ width: 32, height: 32, mr: 1 }}
                      >
                        {seo.product?.name?.[0] || '-'}
                      </Avatar>
                      {seo.product?.name || "-"}
                    </Box>
                  </TableCell>
                  <TableCell>{seo.slug}</TableCell>
                  <TableCell>{seo.title}</TableCell>
                  <TableCell>{seo.popularproduct ? "Yes" : "No"}</TableCell>
                  <TableCell>{seo.topratedproduct ? "Yes" : "No"}</TableCell>
                  <TableCell>{seo.rating_value ?? "-"}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleOpen(seo)} disabled={pageAccess === 'view'}><EditIcon /></IconButton>
                    <IconButton color="info" onClick={() => { setSelectedSeo(seo); setViewOpen(true); }}><VisibilityIcon /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(seo._id)} disabled={pageAccess === 'view'}><DeleteIcon /></IconButton>
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
              const value = field.key ? field.key.split('.').reduce((acc, k) => acc && acc[k], form) || "" : "";
              if (field.type === "select") {
                // Product field: use products list, no freeSolo
                return (
                  <Autocomplete
                    key={field.key}
                    options={products.map((p: any) => ({ label: p.name, value: p._id, img: p.img }))}
                    getOptionLabel={option => {
                      if (!option) return '';
                      if (typeof option === 'string') return option;
                      if (typeof option === 'object' && 'label' in option) return String(option.label);
                      return String(option);
                    }}
                    value={
                      products.find(p => p._id === form[field.key])
                        ? { label: products.find(p => p._id === form[field.key])?.name, value: form[field.key], img: products.find(p => p._id === form[field.key])?.img }
                        : null
                    }
                    onChange={handleProductChange}
                    renderInput={(params) => (
                      <TextField {...params} label={field.label} name={field.key} required disabled={pageAccess === 'view'} />
                    )}
                    renderOption={(props, option) => (
                      <ListItem {...props} key={option.value || option.label}>
                        <ListItemAvatar>
                          <Avatar src={option.img ? (option.img.startsWith('http') ? option.img : `${API_URL}/images/${option.img}`) : undefined}>
                            {option.label[0]}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={option.label} />
                      </ListItem>
                    )}
                    disabled={pageAccess === 'view'}
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
                  disabled={pageAccess === 'view'}
                />
                );
              } else {
                // Support nested fields (dot notation)
                if (!field.key) return null;
                const value = field.key.split('.').reduce((acc, k) => acc && acc[k], form) || "";
                return (
                <TextField
                  key={field.key}
                  label={field.label}
                  name={field.key}
                    value={value}
                    onChange={e => {
                      if (!field.key) return;
                      const keys = field.key.split('.');
                      setForm((prev: any) => {
                        const updated = { ...prev };
                        let obj = updated;
                        for (let i = 0; i < keys.length - 1; i++) {
                          const k = keys[i];
                          if (typeof k !== 'string' || !k) continue;
                          if (!obj[k]) obj[k] = {};
                          obj = obj[k];
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
                  disabled={pageAccess === 'view'}
                    helperText={field.key === 'openGraph.images' ? 'Separate multiple images with commas' : ''}
                />
                );
              }
            })}
          </DialogContent>
          <DialogActions sx={{ pr: 3, pb: 2 }}>
            <Button onClick={handleClose} sx={{ fontWeight: 700, borderRadius: 3 }} disabled={pageAccess === 'view'}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ fontWeight: 900, borderRadius: 3 }} disabled={pageAccess === 'view' || submitting}>{editId ? "Update" : "Add"}</Button>
          </DialogActions>
        </form>
      </Dialog>
      {/* View Dialog */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 900, fontSize: 28 }}>SEO Details</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedSeo && (
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr 1fr' }} gap={3}>
              <Box display="flex" alignItems="center" gap={3} mb={2}>
                <Box>
                  <Avatar
                    variant="rounded"
                    src={getProductImageUrl(selectedSeo.product)}
                    sx={{ width: 120, height: 120, mb: 1 }}
                  >
                    {selectedSeo.product?.name?.[0] || "-"}
                  </Avatar>
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={700} color="primary">
                    {selectedSeo.product?.name || "-"}
                  </Typography>
                </Box>
              </Box>
              {/* Group fields by section for display */}
              {(() => {
                let currentSection = null;
                return SEO_FIELDS.map(field => {
                  if (field.section) {
                    currentSection = field.section;
                    return (
                      <Box key={field.section} sx={{ width: '100%', mt: 3, mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {field.section}
                        </Typography>
                      </Box>
                    );
                  }
                  if (!field.key) return null;
                  // Support nested fields for view
                  const value = field.key.split('.').reduce((acc, k) => acc && acc[k], selectedSeo) ?? "-";
                  return (
                  <Box key={field.key} minWidth={220} flex={1}>
                    <Typography variant="subtitle2" color="textSecondary" fontWeight={600}>{field.label}</Typography>
                    <Typography variant="body1">
                        {typeof value === "boolean"
                          ? (value ? "Yes" : "No")
                          : Array.isArray(value)
                            ? value.join(", ")
                            : (typeof value === "object" && value !== null && value.name)
                              ? value.name
                              : (typeof value === "object" && value !== null)
                                ? JSON.stringify(value)
                                : value}
                    </Typography>
                  </Box>
                  );
                });
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