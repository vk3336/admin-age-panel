"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import PaletteIcon from '@mui/icons-material/Palette';
import ArticleIcon from '@mui/icons-material/Article';
import BrushIcon from '@mui/icons-material/Brush';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CodeIcon from '@mui/icons-material/Code';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import LayersIcon from '@mui/icons-material/Layers';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import BusinessIcon from '@mui/icons-material/Business';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { keyframes } from '@mui/system';
import { apiFetch } from '../../utils/apiFetch';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: none; }
`;

// DattaAble styled components
const StatCard = React.memo(({ value, subtitle, icon, color }: {
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
}) => {
  return (
    <Card sx={{
      background: `linear-gradient(135deg, #fff 60%, ${color}10 100%)`,
      borderRadius: '18px',
      boxShadow: '0 6px 32px 0 rgba(34, 41, 47, 0.10)',
      border: 'none',
      transition: 'all 0.3s cubic-bezier(.4,2,.3,1)',
      animation: `${fadeIn} 0.7s cubic-bezier(.4,2,.3,1)`,
      '&:hover': {
        boxShadow: '0 12px 40px 0 rgba(34, 41, 47, 0.18)',
        transform: 'scale(1.045)',
        background: `linear-gradient(135deg, #fff 40%, ${color}22 100%)`,
      },
      m: 1,
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <Box sx={{ 
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: `radial-gradient(circle at 60% 40%, ${color} 60%, #fff 100%)`,
              display: 'flex', 
              alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: `0 2px 12px 0 ${color}33`,
            position: 'relative',
          }}>
            <Box sx={{
              position: 'absolute',
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: `conic-gradient(${color}33 0% 40%, transparent 40% 100%)`,
              zIndex: 0,
              top: '-8px',
              left: '-8px',
              filter: 'blur(2px)',
            }} />
            <Box sx={{ position: 'relative', zIndex: 1, color: '#fff', fontSize: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {icon}
            </Box>
          </Box>
        </Box>
        <Typography variant="h3" sx={{ 
          fontWeight: 800, 
          color: color,
          mb: 0.5,
          textAlign: 'center',
          letterSpacing: 1,
        }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Typography>
        <Typography variant="subtitle1" sx={{ 
          color: 'text.secondary',
          fontWeight: 500,
          fontSize: '16px',
          textAlign: 'center',
          letterSpacing: 0.5,
        }}>
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );
});

StatCard.displayName = 'StatCard';

const ProgressCard = React.memo(({ title, value, progress, color }: {
  title: string;
  value: string;
  progress: number;
  color: string;
}) => {
  return (
    <Card sx={{
      background: 'background.paper',
      borderRadius: '6px',
      boxShadow: '0 4px 24px 0 rgba(34, 41, 47, 0.24)',
      border: '1px solid',
      borderColor: 'divider',
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {title}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: color }}>
            {value}
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
      sx={{
            height: 8, 
            borderRadius: 4,
            backgroundColor: 'rgba(115, 103, 240, 0.12)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: color,
              borderRadius: 4,
            }
          }} 
        />
        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
          {progress}% Complete
        </Typography>
      </CardContent>
    </Card>
  );
});

ProgressCard.displayName = 'ProgressCard';

const RecentActivityCard = React.memo(() => {
  return (
    <Card sx={{
      background: 'background.paper',
      borderRadius: '6px',
      boxShadow: '0 4px 24px 0 rgba(34, 41, 47, 0.24)',
      border: '1px solid',
      borderColor: 'divider',
    }}>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Recent Activity
          </Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          {[
            { user: 'John Doe', action: 'added a new product', time: '2 minutes ago', color: '#7367f0' },
            { user: 'Jane Smith', action: 'updated category', time: '1 hour ago', color: '#28c76f' },
            { user: 'Mike Johnson', action: 'deleted vendor', time: '3 hours ago', color: '#ea5455' },
            { user: 'Sarah Wilson', action: 'created new design', time: '5 hours ago', color: '#ff9f43' },
          ].map((activity, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: activity.color, fontSize: '12px' }}>
                {activity.user.split(' ').map(n => n[0]).join('')}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                  <strong>{activity.user}</strong> {activity.action}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {activity.time}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
});

RecentActivityCard.displayName = 'RecentActivityCard';

const ProductsTable = React.memo(() => {
  return (
    <Card sx={{
      background: 'background.paper',
      borderRadius: '6px',
      boxShadow: '0 4px 24px 0 rgba(34, 41, 47, 0.24)',
      border: '1px solid',
      borderColor: 'divider',
    }}>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Recent Products
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                { name: 'Product A', category: 'Electronics', status: 'Active' },
                { name: 'Product B', category: 'Clothing', status: 'Inactive' },
                { name: 'Product C', category: 'Home', status: 'Active' },
                { name: 'Product D', category: 'Sports', status: 'Active' },
              ].map((product, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ color: 'text.primary' }}>{product.name}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{product.category}</TableCell>
                  <TableCell>
                    <Chip 
                      label={product.status} 
                      size="small"
                      sx={{ 
                        bgcolor: product.status === 'Active' ? 'success.main' : 'error.main',
                        color: 'white',
                        fontWeight: 500
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton size="small" sx={{ color: 'primary.main' }}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" sx={{ color: 'warning.main' }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" sx={{ color: 'error.main' }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
});

ProductsTable.displayName = 'ProductsTable';

export default function DashboardPage() {
  const router = useRouter();
  const [counts, setCounts] = useState<{ [key: string]: number }>({});
  const [productCount, setProductCount] = useState<number>(0);
  const [seoCount, setSeoCount] = useState<number>(0);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const hasAuthCookie = document.cookie.includes('admin-auth=true');
      const hasLocalStorage = localStorage.getItem('admin-auth') === 'true';
      
      if (!hasAuthCookie && !hasLocalStorage) {
        router.push('/login');
        return;
      }
      
      setIsAuthenticated(true);
    };
    
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchAll = async () => {
      const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000/api";
      const filterKeys = [
        'category', 'color', 'content', 'design', 'finish', 'groupcode',
        'structure', 'subfinish', 'substructure', 'subsuitable', 'suitablefor', 'vendor'
      ];
      const filterPromises = filterKeys.map(f => apiFetch(`${base}/${f}`).then(r => r.json()));
      const productPromise = apiFetch(`${base}/product`).then(r => r.json());
      const seoPromise = apiFetch(`${base}/seo`).then(r => r.json());
      const results = await Promise.all([...filterPromises, productPromise, seoPromise]);
      const newCounts: { [key: string]: number } = {};
      filterKeys.forEach((f, i) => {
        newCounts[f] = Array.isArray(results[i].data) ? results[i].data.length : 0;
      });
      setCounts(newCounts);
      setProductCount(Array.isArray(results[filterKeys.length].data) ? results[filterKeys.length].data.length : 0);
      setSeoCount(Array.isArray(results[filterKeys.length + 1].data) ? results[filterKeys.length + 1].data.length : 0);
    };
    fetchAll();
  }, [isAuthenticated]);

  if (isAuthenticated === null) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #7367f0 0%, #9c8cfc 100%)'
      }}>
        <Box sx={{ 
          textAlign: 'center', 
          color: 'white',
          fontSize: '18px',
          fontWeight: '500'
        }}>
          Loading...
        </Box>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Card data for dashboard
  const cardData = [
    {
      title: 'Products',
      value: productCount,
      subtitle: 'Total Products',
      icon: <InventoryIcon />,
      color: '#7367f0',
      href: '/products',
    },
    {
      title: 'SEO',
      value: seoCount,
      subtitle: 'SEO Entries',
      icon: <InventoryIcon />,
      color: '#00cfe8',
      href: '/seo',
    },
    ...[
      { key: 'category', label: 'Categories', icon: <CategoryIcon />, color: '#7367f0' },
      { key: 'color', label: 'Colors', icon: <PaletteIcon />, color: '#ea5455' },
      { key: 'content', label: 'Contents', icon: <ArticleIcon />, color: '#ff9f43' },
      { key: 'design', label: 'Designs', icon: <BrushIcon />, color: '#28c76f' },
      { key: 'finish', label: 'Finishes', icon: <CheckCircleIcon />, color: '#00cfe8' },
      { key: 'groupcode', label: 'Groupcodes', icon: <CodeIcon />, color: '#9c8cfc' },
      { key: 'structure', label: 'Structures', icon: <ArchitectureIcon />, color: '#ff6b6b' },
      { key: 'subfinish', label: 'Subfinishes', icon: <LayersIcon />, color: '#4ecdc4' },
      { key: 'substructure', label: 'Substructures', icon: <ArchitectureIcon />, color: '#45b7d1' },
      { key: 'subsuitable', label: 'Subsuitables', icon: <ThumbUpIcon />, color: '#96ceb4' },
      { key: 'suitablefor', label: 'Suitablefors', icon: <ThumbUpIcon />, color: '#feca57' },
      { key: 'vendor', label: 'Vendors', icon: <BusinessIcon />, color: '#ff9ff3' },
    ].map(f => ({
      title: f.label,
      value: counts[f.key] || 0,
      subtitle: f.label,
      icon: f.icon,
      color: f.color,
      href: `/${f.key}`,
    })),
  ];

  return (
    <Box sx={{ p: 0 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 600, 
          color: 'text.primary',
          mb: 1
        }}>
          AGE
        </Typography>
        <Typography variant="body1" sx={{ 
          color: 'text.secondary',
          fontSize: '16px'
        }}>
          Overview of your product, SEO, and filter data.
        </Typography>
      </Box>
      {/* Main Cards */}
      <Grid container spacing={3}>
        {cardData.map((card, idx) => (
          // @ts-expect-error MUI Grid type workaround
          <Grid component="div" item xs={12} sm={6} md={4} lg={3} key={card.title + idx}>
            <Card
              sx={{
                background: 'background.paper',
                borderRadius: '6px',
                boxShadow: '0 4px 24px 0 rgba(34, 41, 47, 0.24)',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 4px 25px 0 rgba(34, 41, 47, 0.24)',
                  transform: 'translateY(-2px)',
                  background: 'rgba(115, 103, 240, 0.04)',
                },
              }}
              onClick={() => router.push(card.href)}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Avatar sx={{ 
                    bgcolor: card.color, 
                    color: 'white', 
                    width: 48, 
                    height: 48,
                    fontSize: '20px'
                  }}>
                    {card.icon}
                  </Avatar>
                </Box>
                <Typography variant="h4" sx={{ 
                  fontWeight: 700, 
                  color: 'text.primary',
                  mb: 1
                }}>
                  {card.value}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: 'text.secondary',
                  fontWeight: 500,
                  fontSize: '14px'
                }}>
                  {card.subtitle}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      </Box>
  );
} 