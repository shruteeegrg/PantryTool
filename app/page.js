'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { auth, firestore } from '../lib/firebase'; 
import { Box, Typography, LinearProgress, Stack, TextField, Button, AppBar, Toolbar, IconButton, Container, InputAdornment, MenuItem, Select } from '@mui/material';
import { collection, deleteDoc, doc, getDocs, query, getDoc, setDoc } from 'firebase/firestore';
import { AddCircleOutline, RemoveCircleOutline, Home as HomeIcon, Download as ExportIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

export default function HomePage() {
  const [user] = useAuthState(auth); 
  const [inventory, setInventory] = useState([]);
  const [itemName, setItemName] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [supplier, setSupplier] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const router = useRouter();
  

  const exportToCSV = () => {
    const csvRows = [];
    const headers = ['Name', 'Quantity', 'Expiration Date', 'Description', 'Price', 'Supplier'];
    csvRows.push(headers.join(','));
    filteredInventory.forEach(item => {
      const values = [
        item.name,
        item.quantity,
        item.expirationDate,
        item.description || '',
        item.price || '',
        item.supplier || ''
      ];
      csvRows.push(values.join(','));
    });
    const csvData = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const csvUrl = URL.createObjectURL(csvData);
    const link = document.createElement('a');
    link.href = csvUrl;
    link.setAttribute('download', 'inventory.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

const [openEditDialog, setOpenEditDialog] = useState(false);
const [currentItem, setCurrentItem] = useState({
  name: '',
  expirationDate: '',
  description: '',
  price: '',
  supplier: ''
});

const handleEditClick = async (itemName) => {
  const itemDoc = doc(collection(firestore, 'inventory', user.uid, 'items'), itemName);
  const itemSnap = await getDoc(itemDoc);

  if (itemSnap.exists()) {
    setCurrentItem({ ...itemSnap.data(), name: itemSnap.id });
    setOpenEditDialog(true);
  }
};

const handleSaveChanges = async () => {
  if (!user) return;
  try {
    const docRef = doc(collection(firestore, 'inventory', user.uid, 'items'), currentItem.name);
    await setDoc(docRef, {
      ...currentItem
    }, { merge: true });
    await updateInventory();
    setOpenEditDialog(false);
  } catch (error) {
    console.error("Error updating item:", error);
  }
};

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/Login'); 
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/Welcome'); 
    } else {
      updateInventory();
    }
  }, [user, router]); 

  useEffect(() => {
    filterInventory();
  }, [inventory, searchQuery, filter]);

  const updateInventory = async () => {
    if (!user) return;
    try {
      const snapshot = query(collection(firestore, 'inventory', user.uid, 'items'));
      const docs = await getDocs(snapshot);
      const inventoryList = [];
      docs.forEach((doc) => {
        inventoryList.push({
          name: doc.id,
          ...doc.data(),
        });
      });
      setInventory(inventoryList);
    } catch (error) {
      console.error("Error updating inventory:", error);
    }
  };

  const filterInventory = () => {
    let filtered = inventory;
    if (searchQuery) {
      filtered = filtered.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (filter) {
      filtered = filtered.filter(item => item.expirationDate === filter);
    }
    setFilteredInventory(filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage));
  };

  const addItem = async (item, expiration) => {
    if (!user) return;
    if (item.trim() === '' || !expiration) {
      alert("Item name and expiration date can't be empty");
      return;
    }
    try {
      const docRef = doc(collection(firestore, 'inventory', user.uid, 'items'), item);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { quantity, expirationDate: existingDate, description, price, supplier } = docSnap.data();
        await setDoc(docRef, { quantity: quantity + 1, expirationDate: existingDate || expiration, description, price, supplier });
      } else {
        await setDoc(docRef, { quantity: 1, expirationDate: expiration, description,price, supplier });
      }
      await updateInventory();
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const removeItem = async (item) => {
    if (!user) return;
    try {
      const docRef = doc(collection(firestore, 'inventory', user.uid, 'items'), item);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { quantity, expirationDate: existingDate, description, price, supplier } = docSnap.data();
        if (quantity === 1) {
          await deleteDoc(docRef);
        } else {
          await setDoc(docRef, { quantity: quantity - 1, expirationDate: existingDate, description, price, supplier });
        }
        await updateInventory();
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    filterInventory();
  };

  if (!user) {
    return <LinearProgress />;
  }

  return (
    <>
      <AppBar position="fixed" sx={{ backgroundColor: "white", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="home" onClick={() => router.push('/')}>
            <HomeIcon sx={{ color: "#6482AD" }} />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, color: "#6482AD" }}>
            Pantry Tool
          </Typography>
          <Button
            sx={{
              backgroundColor: "#6482AD",
              color: "white",
              '&:hover': { backgroundColor: "#7FA1C3" },
              borderRadius: "8px"
            }}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
      <DialogTitle>Edit Item</DialogTitle>
      <DialogContent>
        <TextField
          label="Item Name"
          fullWidth
          value={currentItem.name}
          onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
          margin="normal"
          disabled
        />
        <TextField
          label="Expiration Date"
          fullWidth
          value={currentItem.expirationDate}
          onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
          margin="normal"
          disabled
        />
        <TextField
          label="Description"
          fullWidth
          value={currentItem.description || ''}
          onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
          margin="normal"
        />
        <TextField
          label="Price"
          fullWidth
          type="number"
          value={currentItem.price || ''}
          onChange={(e) => setCurrentItem({ ...currentItem, price: e.target.value })}
          margin="normal"
        />
        <TextField
          label="Supplier"
          fullWidth
          value={currentItem.supplier || ''}
          onChange={(e) => setCurrentItem({ ...currentItem, supplier: e.target.value })}
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
        <Button onClick={handleSaveChanges}>Save</Button>
      </DialogActions>
    </Dialog>

    <Box
  width="100%"
  maxWidth="1200px"
  margin="0 auto"
  padding="20px"
  display="flex"
  flexDirection="column"
  alignItems="center"
  gap={2}
  bgcolor="white"
  pt={8} 
  mt={4}
>
  <Container maxWidth="lg" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <Stack
      width="100%"
      spacing={2}
      alignItems="center"
    >
      <Box
        width="100%"
        display="flex"
        flexDirection={{ xs: 'column', md: 'row' }}
        gap={2}
      >
        {/* Add New Item Form */}
        <Box
          flex="1"
          border="1px solid #7FA1C3"
          boxShadow="0 4px 8px rgba(0,0,0,0.1)"
          bgcolor="white"
          borderRadius="8px"
          padding="20px"
          display="flex"
          flexDirection="column"
          gap={2}
          alignItems="center"
          height="600px" 
        >
          <Typography variant="h6" color="#6482AD" fontWeight="bold" mb={2}>Add New Item</Typography>
          <Stack spacing={2} width="100%">
            <TextField
              label="Item Name"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
            <TextField
              label="Expiration Date"
              variant="outlined"
              fullWidth
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Description"
              variant="outlined"
              fullWidth
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Price"
              variant="outlined"
              fullWidth
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Supplier"
              variant="outlined"
              fullWidth
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              InputLabelProps={{ shrink: true }}
            />
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#7FA1C3",
                color: "white",
                '&:hover': { backgroundColor: "#6482AD" },
                borderRadius: '8px'
              }}
              onClick={() => {
                addItem(itemName, expirationDate,description,price, supplier);
                setItemName('');
                setExpirationDate('');
                setDescription('');
                setPrice('');
                setSupplier('');
              }}
            >
              Add Item
            </Button>
          </Stack>
        </Box>

        {/* Inventory Items List */}
        <Box
          flex="1"
          border="1px solid #7FA1C3"
          boxShadow="0 4px 8px rgba(0,0,0,0.1)"
          bgcolor="white"
          borderRadius="8px"
          padding="10px"
          display="flex"
          flexDirection="column"
          gap={2}
          alignItems="center"
          minHeight="400px" // Set a minimum height
        >
          <Typography variant="h6" color="#6482AD" fontWeight="bold" mb={2}>Inventory Items</Typography>
          <Stack spacing={2} width="100%">
            <Stack direction="row" spacing={2} mb={2}>
              <TextField
                label="Search"
                variant="outlined"
                fullWidth
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">🔍</InputAdornment>
                  )
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
              <Select
                value={filter}
                onChange={handleFilterChange}
                displayEmpty
                sx={{ minWidth: 120, borderRadius: '8px' }}
              >
                <MenuItem value="">All Expiration Dates</MenuItem>
              </Select>
            </Stack>
            <Button
                variant="outlined"
                startIcon={<ExportIcon />}
                sx={{
                color: "#6482AD",
                borderColor: "#6482AD",
                '&:hover': { borderColor: "#FF6F61", color: "#FF6F61" },
                 borderRadius: '8px'
                 }}
                onClick={exportToCSV}
                >
                Export to CSV
            </Button>
            <Stack
              width="100%"
              spacing={2}
              padding="20px"
              overflow="auto"
            >
            
              {filteredInventory.map(({ name, quantity, expirationDate, description, price, supplier }) => (
                <Box
                  key={name}
                  width="100%"
                  minHeight="120px"
                  display="flex"
                  flexDirection="column"
                  alignItems="flex-start"
                  justifyContent="center"
                  backgroundColor="white"
                  padding={2}
                  border="1px solid #DDD"
                  borderRadius="8px"
                  boxShadow="0 2px 4px rgba(0,0,0,0.1)"
                  mb={2}
                >
                  <Typography variant="h6" color="#333" fontWeight="bold" mb={1}>
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Typography>
                  <Typography variant="body2" color="#555" mb={1}>
                    Quantity: {quantity}
                  </Typography>
                  <Typography variant="body2" color="#555" mb={1}>
                    Expiration Date: {expirationDate}
                  </Typography>
                  <Typography variant="body2" color="#555" mb={1}>
                    Description: {description}
                  </Typography>
                  <Typography variant="body2" color="#555" mb={1}>
                    Price: {price ? `$${price}` : 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="#555" mb={1}>
                    Supplier: {supplier}
                  </Typography>
                  <Stack direction="row" spacing={1} mt={1}>
                    <Button
                      variant="outlined"
                      startIcon={<AddCircleOutline />}
                      sx={{
                        color: "#FF6F61",
                        borderColor: "#FF6F61",
                        '&:hover': { borderColor: "#6482AD", color: "#6482AD" },
                        borderRadius: '8px'
                      }}
                      onClick={() => addItem(name, expirationDate, description, price,supplier)}
                    >
                      Add
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<RemoveCircleOutline />}
                      sx={{
                        color: "#FF6F61",
                        borderColor: "#FF6F61",
                        '&:hover': { borderColor: "#6482AD", color: "#6482AD" },
                        borderRadius: '8px'
                      }}
                      onClick={() => removeItem(name)}
                    >
                      Remove
                    </Button>
                    <Button
                      variant="outlined"
                      sx={{
                        color: "#FF6F61",
                        borderColor: "#FF6F61",
                        '&:hover': { borderColor: "#6482AD", color: "#6482AD" },
                        borderRadius: '8px'
                      }}
                      onClick={() => handleEditClick(name)}
                    >
                      Edit
                    </Button>
                  </Stack>
                </Box>
                
              ))}
            </Stack>
            {/* Pagination Controls */}
            <Stack direction="row" spacing={2} mt={2}>
              <Button
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
              >
                Previous
              </Button>
              <Button
                disabled={(page * itemsPerPage) >= inventory.length}
                onClick={() => handlePageChange(page + 1)}
              >
                Next
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Stack>
  </Container>
</Box>


      <Box
        component="footer"
        width="100%"
        height="80px"
        bgcolor="white"
        boxShadow="0 -4px 8px rgba(0,0,0,0.1)"
        py={3}
        mt={4}
      >
        <Container maxWidth="lg" sx={{ height: '100%' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ height: '100%' }}>
            <Typography variant="body1" color="#333">
              © {new Date().getFullYear()} Pantry Tool
            </Typography>
            <Stack direction="row" spacing={2}>
              <Typography variant="body2" color="#6482AD" component="a" href="#">
                LinkedIn
              </Typography>
              <Typography variant="body2" color="#6482AD" component="a" href="#">
                Instagram
              </Typography>
              <Typography variant="body2" color="#6482AD" component="a" href="#">
                Facebook
              </Typography>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </>
  );
}
