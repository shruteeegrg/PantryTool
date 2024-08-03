'use client'; 
import { useState } from 'react';
import { auth, firestore } from '../../lib/firebase';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Box, TextField, Button, Typography } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      
      router.push('/');

    } catch (error) {
      console.error("Error signing up:", error);
      alert("Failed to create account. Please check your details.");
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
      <Typography variant="h4" gutterBottom>Sign Up</Typography>
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
        onClick={handleSignUp}
      >
        Sign Up
      </Button>
      <Typography variant="body2" marginTop={2}>
        Already have an account? <Link href="/Login">Login Here</Link>
      </Typography>
    </Box>
  );
};

export default SignUp;
