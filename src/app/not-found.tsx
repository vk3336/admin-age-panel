"use client";
import { Typography, Button } from '@mui/material';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="h2" color="error" gutterBottom>404</Typography>
      <Typography variant="h5" gutterBottom>Page Not Found</Typography>
      <Button variant="contained" color="primary" component={Link} href="/dashboard">Go to Dashboard</Button>
    </main>
  );
} 