"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, Typography, TextField, Button, Box, CircularProgress, InputAdornment, Avatar } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import { apiFetch } from '../../utils/apiFetch';
import { AdminRole } from '../types';

export default function LoginPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [year, setYear] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const setAuthCookie = () => {
    document.cookie = "admin-auth=true; path=/; max-age=86400";
    localStorage.setItem("admin-auth", "true");
    localStorage.setItem("admin-email", email.trim());
  };

  const fetchRoleByEmail = async (email: string) => {
    const res = await apiFetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:7000'}/api/roles`);
    if (!res.ok) throw new Error('Failed to fetch roles');
    const data = await res.json();
    return data.find((role: AdminRole) => role.email.toLowerCase() === email.toLowerCase());
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const superAdmin = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
      if (email.trim() === superAdmin) {
        // Allow super admin to send OTP
        const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000/api"}/admin/sendotp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim() }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setStep(2);
          setError("");
        } else {
          setError(data.message || "Invalid email address or failed to send OTP.");
        }
        setLoading(false);
        return;
      }
      // Check if email exists in roles collection
      const role = await fetchRoleByEmail(email.trim());
      if (!role) {
        setError("This email is not allowed. Please use an authorized admin email.");
        setLoading(false);
        return;
      }
      // Proceed to send OTP
      const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000/api"}/admin/sendotp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setStep(2);
        setError("");
      } else if (res.status === 403) {
        setError("This email is not allowed. Please use an authorized admin email.");
      } else {
        setError(data.message || "Invalid email address or failed to send OTP.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const superAdmin = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
      const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000/api"}/admin/verifyotp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
        credentials: "include",
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setAuthCookie();
        if (email.trim() === superAdmin) {
          // Give super admin full permissions
          localStorage.setItem('admin-permissions', JSON.stringify({
            filter: 'all access',
            product: 'all access',
            seo: 'all access',
            name: 'Super Admin',
            email: superAdmin,
          }));
        } else {
          // Fetch and store permissions for this email
          try {
            const role = await fetchRoleByEmail(email.trim());
            if (role) {
              localStorage.setItem('admin-permissions', JSON.stringify({
                filter: role.filter,
                product: role.product,
                seo: role.seo,
                name: role.name,
                email: role.email,
              }));
            }
          } catch {}
        }
        router.push("/dashboard");
        setError("");
      } else {
        setError(data.message || "Invalid OTP or email.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      p: 2
    }}>
      <Box sx={{ 
        width: '100%', 
        maxWidth: 450, 
        mx: 'auto'
      }}>
        <Card sx={{ 
          borderRadius: '16px', 
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)', 
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              mb: 4 
            }}>
              <Avatar sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: '#3498db', 
                mb: 2,
                boxShadow: '0 4px 20px rgba(52,152,219,0.3)'
              }}>
                <PersonIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h4" sx={{ 
                fontWeight: 600, 
                color: '#2c3e50',
                mb: 1,
                textAlign: 'center'
              }}>
                Admin Login
              </Typography>
              <Typography variant="body1" sx={{ 
                color: '#7f8c8d',
                textAlign: 'center',
                fontSize: '16px'
              }}>
                Welcome back! Please sign in to your account.
              </Typography>
            </Box>
            
            
            {step === 1 && (
              <form onSubmit={handleSendOtp}>
                <TextField
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  fullWidth
                  margin="normal"
                  required
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      '&:hover fieldset': {
                        borderColor: '#3498db',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#3498db',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#3498db',
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: '#7f8c8d' }} />
                      </InputAdornment>
                    ),
                  }}
                />
                {error && (
                  <Typography color="error" sx={{ mt: 1, mb: 1, textAlign: 'center' }}>
                    {error}
                  </Typography>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{ 
                    mt: 3, 
                    mb: 2,
                    fontWeight: 600, 
                    borderRadius: '8px', 
                    py: 1.5, 
                    fontSize: '16px',
                    bgcolor: '#3498db',
                    '&:hover': {
                      bgcolor: '#2980b9',
                    }
                  }}
                  disabled={loading}
                  endIcon={loading && <CircularProgress size={20} color="inherit" />}
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </Button>
              </form>
            )}
            
            {step === 2 && (
              <form onSubmit={handleVerifyOtp}>
                <TextField
                  label="Email Address"
                  value={email}
                  fullWidth
                  margin="normal"
                  disabled
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      bgcolor: '#f8f9fa',
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: '#7f8c8d' }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="OTP Code"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  fullWidth
                  margin="normal"
                  required
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      '&:hover fieldset': {
                        borderColor: '#3498db',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#3498db',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#3498db',
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: '#7f8c8d' }} />
                      </InputAdornment>
                    ),
                  }}
                />
                {error && (
                  <Typography color="error" sx={{ mt: 1, mb: 1, textAlign: 'center' }}>
                    {error}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{ 
                      fontWeight: 600, 
                      borderRadius: '8px', 
                      py: 1.5, 
                      fontSize: '16px',
                      bgcolor: '#3498db',
                      '&:hover': {
                        bgcolor: '#2980b9',
                      }
                    }}
                    disabled={loading}
                    endIcon={loading && <CircularProgress size={20} color="inherit" />}
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </Button>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    onClick={() => setStep(1)} 
                    disabled={loading} 
                    sx={{ 
                      fontWeight: 600, 
                      borderRadius: '8px', 
                      py: 1.5, 
                      fontSize: '16px',
                      borderColor: '#bdc3c7',
                      color: '#7f8c8d',
                      '&:hover': {
                        borderColor: '#95a5a6',
                        bgcolor: '#f8f9fa',
                      }
                    }}
                  >
                    Back
                  </Button>
                </Box>
              </form>
            )}
            
            <Box
              sx={{
                mt: 4,
                textAlign: 'center',
                pt: 2,
                borderTop: '1px solid #ecf0f1'
              }}
            >
              {year && (
                <Typography variant="body2" sx={{ 
                  color: '#7f8c8d',
                  fontSize: '14px'
                }}>
                  © {year} Vivek Project Admin Panel
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
} 