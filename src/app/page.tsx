"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = document.cookie.includes('admin-auth=true') || 
                           localStorage.getItem('admin-auth') === 'true';
    
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [router]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{ 
        textAlign: 'center', 
        color: 'white',
        fontSize: '18px',
        fontWeight: '500'
      }}>
        Loading...
      </div>
    </div>
  );
}
