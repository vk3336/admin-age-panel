"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, MenuItem, Select, InputLabel, FormControl, CircularProgress, Pagination, Chip, Autocomplete
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import FilterListIcon from '@mui/icons-material/FilterList';
import Image from 'next/image';

interface Product {
  _id?: string;
  name: string;
  img?: string;
  image1?: string;
  image2?: string;
  category: string;
  substructure: string;
  content: string;
  design: string;
  subfinish: string;
  subsuitable: string;
  vendor: string;
  groupcode: string;
  color: string;
  motif?: string;
  um?: string;
  currency?: string;
  gsm?: number;
  oz?: number;
  cm?: number;
  inch?: number;
  video?: string;
  videoThumbnail?: string;
  quantity?: number;
}

interface Option { _id: string; name: string; }

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000/api";

function getProductPagePermission() {
  if (typeof window === 'undefined') return 'denied';
  const email = localStorage.getItem('admin-email');
  if (!email) return 'denied';
  const perms = JSON.parse(localStorage.getItem('admin-permissions') || '{}');
  let adminPerm = perms[email];
  if (typeof adminPerm === 'string') {
    try { adminPerm = JSON.parse(adminPerm); } catch {}
  }
  return adminPerm?.productPermission || 'denied';
}

function getImageUrl(img: string | undefined): string | undefined {
  if (!img) return undefined;
  
  if (img.startsWith('http://') || img.startsWith('https://')) {
    return img;
  }
  
  return `${API_URL}/images/${img}`;
}

function hasName(obj: unknown): obj is { name: string } {
  return Boolean(obj && typeof obj === 'object' && 'name' in obj && typeof (obj as { name?: unknown }).name === 'string');
}

// Add a type guard for objects with a name property
function isNameObject(val: unknown): val is { name: string } {
  return typeof val === 'object' && val !== null && 'name' in val && typeof (val as { name?: unknown }).name === 'string';
}

export default function ProductPage() {
  const [pageAccess, setPageAccess] = useState('denied');
  const [products, setProducts] = useState<Product[]>([]);
  const [dropdowns, setDropdowns] = useState<{ [key: string]: Option[] }>({});
  const [productsLoading, setProductsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<{
    name: string;
    category: string;
    substructure: string;
    content: string;
    design: string;
    subfinish: string;
    subsuitable: string;
    vendor: string;
    groupcode: string;
    color: string;
    motif?: string;
    um?: string;
    currency?: string;
    gsm?: string;
    oz?: string;
    cm?: string;
    inch?: string;
    img?: File | string;
    image1?: File | string;
    image2?: File | string;
    video?: File | string;
    quantity?: string;
    [key: string]: string | File | undefined;
  }>({
    name: "",
    category: "",
    substructure: "",
    content: "",
    design: "",
    subfinish: "",
    subsuitable: "",
    vendor: "",
    groupcode: "",
    color: "",
    motif: "",
    um: "",
    currency: "",
    gsm: "",
    oz: "",
    cm: "",
    inch: "",
    img: undefined,
    image1: undefined,
    image2: undefined,
    video: undefined,
    quantity: "",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [image1Preview, setImage1Preview] = useState<string | null>(null);
  const [image2Preview, setImage2Preview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const image1InputRef = React.useRef<HTMLInputElement>(null);
  const image2InputRef = React.useRef<HTMLInputElement>(null);
  const videoInputRef = React.useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 8;
  const dropdownFields = React.useMemo(() => [
    { key: "category", label: "Category" },
    { key: "substructure", label: "Substructure" },
    { key: "content", label: "Content" },
    { key: "design", label: "Design" },
    { key: "subfinish", label: "Subfinish" },
    { key: "subsuitable", label: "Subsuitable" },
    { key: "vendor", label: "Vendor" },
    { key: "groupcode", label: "Groupcode" },
    { key: "color", label: "Color" },
    // ...add any other dropdown fields you use
  ], []);
  // Add state for image dimensions
  const [imgDims, setImgDims] = useState<{img?: [number, number], image1?: [number, number], image2?: [number, number]}>({});
  // Add state for video dimensions
  const [videoDims, setVideoDims] = useState<[number, number] | undefined>(undefined);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const umOptions: string[] = ["KG", "Yard", "Meter"];
  const currencyOptions: string[] = ["INR", "USD", "EUR", "GBP", "JPY", "CNY", "CAD", "AUD", "SGD", "CHF", "ZAR", "RUB", "BRL", "HKD", "NZD", "KRW", "THB", "MYR", "IDR", "PHP", "VND", "TRY", "SAR", "AED", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "ILS", "MXN", "TWD", "ARS", "CLP", "COP", "PEN", "EGP", "PKR", "BDT", "LKR", "NPR", "KES", "NGN", "GHS", "UAH", "QAR", "OMR", "KWD", "BHD", "JOD", "MAD", "DZD", "TND", "LBP", "IQD", "IRR", "AFN", "MNT", "UZS", "KZT", "AZN", "GEL", "BYN", "MDL", "ALL", "MKD", "BAM", "HRK", "RSD", "BGN", "RON", "ISK"];

  const fetchDropdowns = useCallback(async () => {
    try {
      const results = await Promise.all(
        dropdownFields.map(f => fetch(`${API_URL}/${f.key}`))
      );
      const datas = await Promise.all(results.map(r => r.json()));
      const newDropdowns: { [key: string]: Option[] } = {};
      dropdownFields.forEach((f, i) => {
        newDropdowns[f.key] = datas[i].data || [];
      });
      setDropdowns(newDropdowns);
    } finally {
      // setDropdownLoading(false); // Removed as per edit hint
    }
  }, [dropdownFields]);

  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const res = await fetch(`${API_URL}/product`);
      const data = await res.json();
      setProducts(Array.isArray(data.data) ? (data.data as Product[]) : []);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkPermission = async () => {
      // Permission logic can be handled by setPageAccess only
    };
    checkPermission();
  }, [fetchProducts, fetchDropdowns]);

  useEffect(() => {
    fetchProducts();
    fetchDropdowns();
  }, [fetchProducts, fetchDropdowns]);

  useEffect(() => {
    setPageAccess(getProductPagePermission());
  }, []);

  const getId = useCallback((field: unknown): string => {
    if (field && typeof field === 'object' && '_id' in field && typeof (field as { _id?: unknown })._id === 'string') {
      return (field as { _id: string })._id;
    }
    if (typeof field === 'string') return field;
    return '';
  }, []);

  const handleOpen = useCallback((product: Product | null = null) => {
    setEditId(product?._id || null);
    setForm(product ? {
      name: product.name,
      category: getId(product.category),
      substructure: getId(product.substructure),
      content: getId(product.content),
      design: getId(product.design),
      subfinish: getId(product.subfinish),
      subsuitable: getId(product.subsuitable),
      vendor: getId(product.vendor),
      groupcode: getId(product.groupcode),
      color: getId(product.color),
      motif: getId(product.motif),
      um: getId(product.um),
      currency: getId(product.currency),
      gsm: product.gsm !== undefined && product.gsm !== null ? String(product.gsm) : "",
      oz: product.oz !== undefined && product.oz !== null ? String(product.oz) : "",
      cm: product.cm !== undefined && product.cm !== null ? String(product.cm) : "",
      inch: product.inch !== undefined && product.inch !== null ? String(product.inch) : "",
      img: product.img,
      image1: product.image1,
      image2: product.image2,
      video: product.video,
      quantity: product.quantity !== undefined && product.quantity !== null ? String(product.quantity) : "",
    } : {
      name: "",
      category: "",
      substructure: "",
      content: "",
      design: "",
      subfinish: "",
      subsuitable: "",
      vendor: "",
      groupcode: "",
      color: "",
      motif: "",
      um: "",
      currency: "",
      gsm: "",
      oz: "",
      cm: "",
      inch: "",
      img: undefined,
      image1: undefined,
      image2: undefined,
      video: undefined,
      quantity: "",
    });
    setImagePreview(product?.img ? getImageUrl(product.img) || null : null);
    setImage1Preview(product?.image1 ? getImageUrl(product.image1) || null : null);
    setImage2Preview(product?.image2 ? getImageUrl(product.image2) || null : null);
    setVideoPreview(product?.video ? getImageUrl(product.video) || null : null);
    setOpen(true);
  }, [getId]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setEditId(null);
    setImagePreview(null);
    setImage1Preview(null);
    setImage2Preview(null);
    setVideoPreview(null);
    setForm({
      name: "",
      category: "",
      substructure: "",
      content: "",
      design: "",
      subfinish: "",
      subsuitable: "",
      vendor: "",
      groupcode: "",
      color: "",
      motif: "",
      um: "",
      currency: "",
      gsm: "",
      oz: "",
      cm: "",
      inch: "",
      img: undefined,
      image1: undefined,
      image2: undefined,
      video: undefined,
      quantity: "",
    });
  }, []);

  const handleView = useCallback((product: Product) => {
    setSelectedProduct(product);
    setViewOpen(true);
  }, []);

  const handleViewClose = useCallback(() => {
    setViewOpen(false);
    setSelectedProduct(null);
  }, []);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, img: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  }, []);

  const handleImage1Change = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, image1: file }));
      setImage1Preview(URL.createObjectURL(file));
    }
  }, []);
  const handleImage2Change = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, image2: file }));
      setImage2Preview(URL.createObjectURL(file));
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name.trim()) {
      alert("Name is required");
      return;
    }
    
    const missingFields = dropdownFields.filter(f => !form[f.key] || form[f.key] === "");
    if (missingFields.length > 0) {
      alert(`Please select: ${missingFields.map(f => f.label).join(", ")}`);
      return;
    }
    
    if (!editId && (!form.img || !(form.img instanceof File))) {
      alert("Please select an image for the product");
      return;
    }
    
    setSubmitting(true);
    try {
      const formData = new FormData();
      // Append all text fields first
      Object.keys(form).forEach(key => {
        if (!["img", "image1", "image2", "video"].includes(key) && form[key] !== undefined && form[key] !== "") {
          formData.append(key, form[key] as string);
        }
      });
      // Then append files
      if (form.img) formData.append("file", form.img as File);
      if (form.image1) formData.append("image1", form.image1 as File);
      if (form.image2) formData.append("image2", form.image2 as File);
      if (form.video) formData.append("video", form.video as File);
      const url = editId ? `${API_URL}/product/${editId}` : `${API_URL}/product`;
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        body: formData,
      });
      if (res.ok) {
        handleClose();
        fetchProducts();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to save product");
      }
    } catch {} finally {
      setSubmitting(false);
    }
  }, [form, editId, dropdownFields, handleClose, fetchProducts]);

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    setDeleteError(null);
    try {
      const res = await fetch(`${API_URL}/product/${deleteId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data && data.message && data.message.includes("in use")) {
          setDeleteError(data.message);
        } else {
          setDeleteError(data.message || "Failed to delete product.");
        }
        return;
      }
      setDeleteId(null);
      fetchProducts();
    } catch {}
  }, [deleteId, fetchProducts]);

  const filteredProducts = useCallback(() => {
    return products.filter(product => 
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      (hasName(product.category) && product.category.name.toLowerCase().includes(search.toLowerCase()))
    );
  }, [products, search]);

  const paginatedProducts = useCallback(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredProducts().slice(start, start + rowsPerPage);
  }, [filteredProducts, page]);

  // Add this handler for product selection
  const handleProductSelect = useCallback((
    _: React.SyntheticEvent,
    value: { label?: string; value?: string } | null
  ) => {
    if (!value) return;
    const selected = products.find(p => p._id === value.value);
    if (selected) {
      setForm({
        name: selected.name,
        category: getId(selected.category),
        substructure: getId(selected.substructure),
        content: getId(selected.content),
        design: getId(selected.design),
        subfinish: getId(selected.subfinish),
        subsuitable: getId(selected.subsuitable),
        vendor: getId(selected.vendor),
        groupcode: getId(selected.groupcode),
        color: getId(selected.color),
        motif: getId(selected.motif),
        um: getId(selected.um),
        currency: getId(selected.currency),
        gsm: selected.gsm !== undefined && selected.gsm !== null ? String(selected.gsm) : "",
        oz: selected.oz !== undefined && selected.oz !== null ? String(selected.oz) : "",
        cm: selected.cm !== undefined && selected.cm !== null ? String(selected.cm) : "",
        inch: selected.inch !== undefined && selected.inch !== null ? String(selected.inch) : "",
        img: selected.img,
        image1: selected.image1,
        image2: selected.image2,
        video: selected.video,
        quantity: selected.quantity !== undefined && selected.quantity !== null ? String(selected.quantity) : "",
      });
      setImagePreview(selected.img ? getImageUrl(selected.img) || null : null);
      setImage1Preview(selected.image1 ? getImageUrl(selected.image1) || null : null);
      setImage2Preview(selected.image2 ? getImageUrl(selected.image2) || null : null);
      setVideoPreview(selected.video ? getImageUrl(selected.video) || null : null);
    } else {
      setForm(prev => ({ ...prev, name: value.label || "" }));
    }
  }, [products, getId, setForm, setImagePreview, setImage1Preview, setImage2Preview, setVideoPreview]);

  // Add effect to auto-calculate oz and inch
  useEffect(() => {
    if (form.gsm && !isNaN(Number(form.gsm))) {
      const oz = (Number(form.gsm) / 33.906).toFixed(2);
      setForm(prev => ({ ...prev, oz }));
    } else {
      setForm(prev => ({ ...prev, oz: "" }));
    }
  }, [form.gsm]);
  useEffect(() => {
    if (form.cm && !isNaN(Number(form.cm))) {
      const inch = (Number(form.cm) / 2.54).toFixed(2);
      setForm(prev => ({ ...prev, inch }));
    } else {
      setForm(prev => ({ ...prev, inch: "" }));
    }
  }, [form.cm]);

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
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 600, 
            color: '#2c3e50'
          }}>
            Product Management
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
            Add Product
          </Button>
        </Box>
        <Typography variant="body1" sx={{ 
          color: '#7f8c8d',
          fontSize: '16px'
        }}>
          Manage your product catalog and inventory
        </Typography>
      </Box>

      {/* Search and Stats */}
      <Box sx={{ mb: 3 }}>
        <Paper sx={{
          p: 3,
          borderRadius: '12px',
          background: '#fff',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          border: '1px solid #ecf0f1',
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
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ flex: 1, fontSize: '14px' }}
              />
            </Box>
            <Chip
              icon={<FilterListIcon />}
              label={`${filteredProducts().length} products`}
              sx={{
                bgcolor: '#3498db',
                color: 'white',
                fontWeight: 600
              }}
            />
          </Box>
        </Paper>
      </Box>

      {/* Products Table */}
      <Paper sx={{
        borderRadius: '12px',
        background: '#fff',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        border: '1px solid #ecf0f1',
        overflow: 'hidden'
      }}>
        {productsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#2c3e50', fontSize: '14px' }}>
                    Product
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2c3e50', fontSize: '14px' }}>
                    Category
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2c3e50', fontSize: '14px' }}>
                    Vendor
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2c3e50', fontSize: '14px' }}>
                    Color
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2c3e50', fontSize: '14px' }}>
                    Quantity
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2c3e50', fontSize: '14px' }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedProducts().map((product) => (
                  <TableRow key={product._id} sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          src={getImageUrl(product.img) || ""}
                          sx={{ width: 48, height: 48, bgcolor: '#f8f9fa' }}
                        >
                          <ImageIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                            {product.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#7f8c8d' }}>
                            ID: {product._id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={hasName(product.category) ? product.category.name : product.category || 'N/A'}
                        size="small"
                        sx={{ bgcolor: '#e8f4fd', color: '#3498db', fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#2c3e50' }}>
                        {hasName(product.vendor) ? product.vendor.name : product.vendor || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={hasName(product.color) ? product.color.name : product.color || 'N/A'}
                        size="small"
                        sx={{ bgcolor: '#fef2f2', color: '#e74c3c', fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      {product.quantity ?? '-'}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleView(product)}
                          sx={{ color: '#3498db' }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleOpen(product)}
                          disabled={pageAccess === 'view'}
                          sx={{ color: '#f39c12' }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => setDeleteId(product._id || null)}
                          disabled={pageAccess === 'view'}
                          sx={{ color: '#e74c3c' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        
        {/* Pagination */}
        {filteredProducts().length > rowsPerPage && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3, borderTop: '1px solid #ecf0f1' }}>
            <Pagination
              count={Math.ceil(filteredProducts().length / rowsPerPage)}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: '6px',
                }
              }}
            />
          </Box>
        )}
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 900, fontSize: 28 }}>{editId ? "Edit Product" : "Add Product"}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, pt: 2 }}>
          {/* Product selection dropdown for duplication/quick fill */}
          <Autocomplete
            options={products.map((p: Product) => ({ label: p.name, value: p._id }))}
            getOptionLabel={option => typeof option === 'string' ? option : option.label}
            onChange={handleProductSelect}
            renderInput={(params) => (
              <TextField {...params} label="Copy From Product" placeholder="Type or select to copy..." />
            )}
            sx={{ minWidth: 220, mb: 2 }}
            disabled={pageAccess === 'view'}
          />
            <TextField
              label="Product Name"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              required
              InputProps={{ readOnly: pageAccess === 'view' }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                }
              }}
            />
            
            {dropdownFields.map((field) => (
              <FormControl key={field.key} fullWidth required>
                <InputLabel>{field.label}</InputLabel>
                <Select
                  value={form[field.key] || ""}
                  onChange={(e) => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                  label={field.label}
                  sx={{
                    borderRadius: '8px',
                  }}
                  disabled={pageAccess === 'view'}
                >
                  {dropdowns[field.key]?.map((option: Option) => (
                    <MenuItem key={option._id} value={option._id}>
                      {option.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ))}
            
            <FormControl fullWidth required>
              <InputLabel>UM</InputLabel>
              <Select
                value={form.um || ""}
                onChange={e => setForm(prev => ({ ...prev, um: e.target.value }))}
                label="UM"
                sx={{ borderRadius: '8px' }}
                disabled={pageAccess === 'view'}
              >
                {umOptions.map(opt => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Autocomplete
              freeSolo
              options={currencyOptions}
              value={form.currency || ""}
              onInputChange={(_, value) => setForm(prev => ({ ...prev, currency: value }))}
              renderInput={(params) => (
                <TextField {...params} label="Currency" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} disabled={pageAccess === 'view'} />
              )}
              disabled={pageAccess === 'view'}
            />
            <TextField
              label="GSM"
              type="number"
              value={form.gsm || ""}
              onChange={e => setForm(prev => ({ ...prev, gsm: e.target.value }))}
              fullWidth
              disabled={pageAccess === 'view'}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
            <TextField
              label="OZ"
              type="number"
              value={form.oz || ""}
              fullWidth
              disabled
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
            <TextField
              label="CM"
              type="number"
              value={form.cm || ""}
              onChange={e => setForm(prev => ({ ...prev, cm: e.target.value }))}
              fullWidth
              disabled={pageAccess === 'view'}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
            <TextField
              label="INCH"
              type="number"
              value={form.inch || ""}
              fullWidth
              disabled
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
            <TextField
              label="Quantity"
              type="number"
              value={form.quantity || ""}
              onChange={e => setForm(prev => ({ ...prev, quantity: e.target.value }))}
              fullWidth
              disabled={pageAccess === 'view'}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
            <Box>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <Button
                variant="outlined"
                onClick={() => fileInputRef.current?.click()}
                startIcon={<ImageIcon />}
                disabled={pageAccess === 'view'}
                sx={{
                  borderRadius: '8px',
                  borderColor: '#bdc3c7',
                  color: '#7f8c8d',
                  '&:hover': {
                    borderColor: '#95a5a6',
                    bgcolor: '#f8f9fa',
                  }
                }}
              >
                {imagePreview ? 'Change Main Image' : 'Upload Main Image'}
              </Button>
              {imagePreview && (
                <Box sx={{ mt: 2 }}>
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={200}
                    height={200}
                    style={{ borderRadius: '8px' }}
                  />
                </Box>
              )}
            </Box>
            <Box>
              <input
                type="file"
                ref={image1InputRef}
                onChange={handleImage1Change}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <Button
                variant="outlined"
                onClick={() => image1InputRef.current?.click()}
                startIcon={<ImageIcon />}
                disabled={pageAccess === 'view'}
                sx={{
                  borderRadius: '8px',
                  borderColor: '#bdc3c7',
                  color: '#7f8c8d',
                  '&:hover': {
                    borderColor: '#95a5a6',
                    bgcolor: '#f8f9fa',
                  }
                }}
              >
                {image1Preview ? 'Change Image 1' : 'Upload Image 1'}
              </Button>
              {image1Preview && (
                <Box sx={{ mt: 2 }}>
                  <Image
                    src={image1Preview}
                    alt="Preview 1"
                    width={200}
                    height={200}
                    style={{ borderRadius: '8px' }}
                  />
                </Box>
              )}
            </Box>
            <Box>
              <input
                type="file"
                ref={image2InputRef}
                onChange={handleImage2Change}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <Button
                variant="outlined"
                onClick={() => image2InputRef.current?.click()}
                startIcon={<ImageIcon />}
                disabled={pageAccess === 'view'}
                sx={{
                  borderRadius: '8px',
                  borderColor: '#bdc3c7',
                  color: '#7f8c8d',
                  '&:hover': {
                    borderColor: '#95a5a6',
                    bgcolor: '#f8f9fa',
                  }
                }}
              >
                {image2Preview ? 'Change Image 2' : 'Upload Image 2'}
              </Button>
              {image2Preview && (
                <Box sx={{ mt: 2 }}>
                  <Image
                    src={image2Preview}
                    alt="Preview 2"
                    width={200}
                    height={200}
                    style={{ borderRadius: '8px' }}
                  />
                </Box>
              )}
            </Box>
            {/* Video upload */}
            <Box>
              <input
                type="file"
                accept="video/mp4"
                style={{ display: 'none' }}
                ref={videoInputRef}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setForm(prev => ({ ...prev, video: file }));
                    setVideoPreview(URL.createObjectURL(file));
                  }
                }}
              />
              <Button
                variant="outlined"
                onClick={() => videoInputRef.current?.click()}
                startIcon={<ImageIcon />}
                disabled={pageAccess === 'view'}
                sx={{
                  borderRadius: '8px',
                  borderColor: '#bdc3c7',
                  color: '#7f8c8d',
                  '&:hover': {
                    borderColor: '#95a5a6',
                    bgcolor: '#f8f9fa',
                  }
                }}
              >
                {videoPreview ? 'Change Video' : 'Upload Video'}
              </Button>
              {videoPreview && (
                <Box sx={{ mt: 2 }}>
                  <video
                    src={videoPreview}
                    controls
                    style={{ maxWidth: '200px', borderRadius: '8px' }}
                  />
                </Box>
              )}
            </Box>
          </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa' }}>
          <Button onClick={handleClose} sx={{ color: '#7f8c8d' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={pageAccess === 'view' || submitting}
            sx={{
              bgcolor: '#3498db',
              '&:hover': { bgcolor: '#2980b9' },
              borderRadius: '8px',
              px: 3
            }}
          >
            {submitting ? 'Saving...' : (editId ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewOpen} onClose={handleViewClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ 
          bgcolor: '#f8f9fa', 
          borderBottom: '1px solid #ecf0f1',
          fontWeight: 600,
          color: '#2c3e50'
        }}>
          Product Details
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedProduct && (
            <Box sx={{ display: 'grid', gap: 3 }}>
              {/* Media row with labels */}
              <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 3 }}>
                {/* Main Image */}
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>Main Image</Typography>
                  {selectedProduct.img && (
                    <Box>
                      <Image
                        src={getImageUrl(selectedProduct.img) || ""}
                        alt="Main"
                        width={200}
                        height={200}
                        style={{ borderRadius: '8px' }}
                        onLoad={e => {
                          const target = e.target as HTMLImageElement;
                          setImgDims(dims => ({ ...dims, img: [target.naturalWidth, target.naturalHeight] }));
                        }}
                      />
                      {imgDims.img && (
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                          w: {imgDims.img[0]} h: {imgDims.img[1]}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
                {/* Image 1 */}
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>Image 1</Typography>
                  {selectedProduct.image1 && (
                    <Box>
                      <Image
                        src={getImageUrl(selectedProduct.image1) || ""}
                        alt="Image 1"
                        width={200}
                        height={200}
                        style={{ borderRadius: '8px' }}
                        onLoad={e => {
                          const target = e.target as HTMLImageElement;
                          setImgDims(dims => ({ ...dims, image1: [target.naturalWidth, target.naturalHeight] }));
                        }}
                      />
                      {imgDims.image1 && (
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                          w: {imgDims.image1[0]} h: {imgDims.image1[1]}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
                {/* Image 2 */}
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>Image 2</Typography>
                  {selectedProduct.image2 && (
                    <Box>
                      <Image
                        src={getImageUrl(selectedProduct.image2) || ""}
                        alt="Image 2"
                        width={200}
                        height={200}
                        style={{ borderRadius: '8px' }}
                        onLoad={e => {
                          const target = e.target as HTMLImageElement;
                          setImgDims(dims => ({ ...dims, image2: [target.naturalWidth, target.naturalHeight] }));
                        }}
                      />
                      {imgDims.image2 && (
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                          w: {imgDims.image2[0]} h: {imgDims.image2[1]}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
                {/* Video */}
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>Video</Typography>
                  {selectedProduct.video && (
                    <Box>
                      <video
                        src={getImageUrl(selectedProduct.video) || ""}
                        controls
                        poster={getImageUrl(selectedProduct.videoThumbnail) || undefined}
                        style={{ maxWidth: '200px', borderRadius: '8px' }}
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
              {/* Product name and ID above details grid */}
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50', mb: 1 }}>
                  {selectedProduct.name}
                </Typography>
                <Typography variant="body2" sx={{ color: '#7f8c8d', mb: 2 }}>
                  ID: {selectedProduct._id}
                </Typography>
              </Box>
              {/* Details grid */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                {dropdownFields.filter(field => field.key !== 'motif').map((field) => {
                  const value = (selectedProduct as unknown as Record<string, unknown>)[field.key];
                  return (
                    <Box key={field.key}>
                      <Typography variant="caption" sx={{ color: '#7f8c8d', textTransform: 'uppercase', fontWeight: 600 }}>
                        {field.label}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#2c3e50', mt: 0.5 }}>
                        {isNameObject(value)
                          ? value.name || '-'
                          : value !== undefined && value !== null && typeof value !== 'object'
                            ? String(value)
                            : '-'}
                      </Typography>
                    </Box>
                  );
                })}
                {/* Motif and new fields */}
                <Box>
                  <Typography variant="caption" sx={{ color: '#7f8c8d', textTransform: 'uppercase', fontWeight: 600 }}>Motif</Typography>
                  <Typography variant="body2" sx={{ color: '#2c3e50', mt: 0.5 }}>{hasName(selectedProduct.motif) ? selectedProduct.motif.name || '-' : selectedProduct.motif || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#7f8c8d', textTransform: 'uppercase', fontWeight: 600 }}>UM</Typography>
                  <Typography variant="body2" sx={{ color: '#2c3e50', mt: 0.5 }}>{selectedProduct.um || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#7f8c8d', textTransform: 'uppercase', fontWeight: 600 }}>Currency</Typography>
                  <Typography variant="body2" sx={{ color: '#2c3e50', mt: 0.5 }}>{selectedProduct.currency || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#7f8c8d', textTransform: 'uppercase', fontWeight: 600 }}>GSM</Typography>
                  <Typography variant="body2" sx={{ color: '#2c3e50', mt: 0.5 }}>{selectedProduct.gsm || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#7f8c8d', textTransform: 'uppercase', fontWeight: 600 }}>OZ</Typography>
                  <Typography variant="body2" sx={{ color: '#2c3e50', mt: 0.5 }}>{selectedProduct.oz || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#7f8c8d', textTransform: 'uppercase', fontWeight: 600 }}>CM</Typography>
                  <Typography variant="body2" sx={{ color: '#2c3e50', mt: 0.5 }}>{selectedProduct.cm || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#7f8c8d', textTransform: 'uppercase', fontWeight: 600 }}>INCH</Typography>
                  <Typography variant="body2" sx={{ color: '#2c3e50', mt: 0.5 }}>{selectedProduct.inch || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#7f8c8d', textTransform: 'uppercase', fontWeight: 600 }}>Quantity</Typography>
                  <Typography variant="body2" sx={{ color: '#2c3e50', mt: 0.5 }}>{selectedProduct.quantity ?? '-'}</Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa' }}>
          <Button onClick={handleViewClose} sx={{ color: '#7f8c8d' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onClose={() => { setDeleteId(null); setDeleteError(null); }}>
        <DialogTitle sx={{ fontWeight: 600, color: '#2c3e50' }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this product? This action cannot be undone.
          </Typography>
          {deleteError && (
            <Typography sx={{ color: 'error.main', mt: 2 }}>
              {deleteError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDeleteId(null); setDeleteError(null); }} sx={{ color: '#7f8c8d' }}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            sx={{
              bgcolor: '#e74c3c',
              '&:hover': { bgcolor: '#c0392b' },
              borderRadius: '8px'
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