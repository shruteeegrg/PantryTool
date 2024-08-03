'use client'; 

import { useState } from 'react';
import { auth, firestore } from '../../lib/firebase';
import { signInWithEmailAndPassword } from "firebase/auth";
import { Box, TextField, Button, Typography } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      router.push('/');
    } catch (error) {
      console.error("Error logging in:", error);
      alert("Failed to log in. Please check your credentials.");
    }
  };

  return (
    <Box 
      width="100%" 
      maxWidth="400px" 
      margin="0 auto" 
      padding="20px" 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      gap={2}
    >
      <Typography variant="h4" gutterBottom>Login</Typography>
      <TextField 
        label="Email" 
        fullWidth 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        margin="normal"
      />
      <TextField 
        label="Password" 
        type="password" 
        fullWidth 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        margin="normal"
      />
      <Button 
        variant="contained" 
        color="primary" 
        fullWidth 
        onClick={handleLogin}
      >
        Login
      </Button>
      <Typography variant="body2" marginTop={2}>
  No account yet? <Link href="/SignUp">Create one here</Link>
</Typography>


    </Box>
  );
};

export default Login;
