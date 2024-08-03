'use client';

import { Box, Button, Typography, Container, AppBar,Toolbar,IconButton } from '@mui/material';
import { useRouter } from 'next/navigation';
import { Home as HomeIcon } from '@mui/icons-material';

export default function Welcome() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/Login');
  };

  return (
   <>
    <AppBar position="fixed" sx={{ backgroundColor: "white", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="home" >
            <HomeIcon sx={{ color: "#6482AD" }} />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, color: "#6482AD" }}>
            PantryTool
          </Typography>
        </Toolbar>
      </AppBar>

    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        textAlign: 'center',
        padding: '20px',
      }}
    >
      <Container maxWidth="sm">
        <Typography
          variant="h3"
          sx={{
            color: '#6482AD',
            fontWeight: 'bold',
            marginBottom: '20px',
            animation: 'fadeIn 1.5s ease-in-out',
            '@keyframes fadeIn': {
              from: { opacity: 0.2 },
              to: { opacity: 1 },
            },
          }}
        >
          Welcome to Pantry Manager
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: '#7FA1C3',
            marginBottom: '40px',
          }}
        >
          Keep your pantry organized and never run out of your essentials!
        </Typography>
        <Button
          variant="contained"
          sx={{
            backgroundColor: '#FF6F61',
            color: 'white',
            fontSize: '1.2rem',
            padding: '10px 20px',
            borderRadius: '8px',
            '&:hover': { backgroundColor: '#FF3B30' },
          }}
          onClick={handleLogin}
        >
          Get Started
        </Button>
      </Container>
    </Box>
    </>
  );
}
