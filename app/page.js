'use client' // For simplicity, this is a client sided app
import Image from "next/image";
import {useState, useEffect} from "react";
import {firestore} from "@/firebase";
import {Box, Typography, Stack, Modal, TextField, Button, createTheme, ThemeProvider, Dialog, DialogActions, DialogTitle} from '@mui/material';
import {collection, deleteDoc, doc, getDocs, query, getDoc, setDoc} from 'firebase/firestore';
import DeleteIcon from '@mui/icons-material/Delete';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import { DataGrid } from '@mui/x-data-grid';
import {pink} from '@mui/material/colors';
import { render } from "react-dom";

const theme = createTheme({
  palette: {
    primary: {
      main: pink[600],
      dark: pink[900],
      light: pink[100],
    },
    secondary: {
      main: pink[600],
      dark: pink[900],
      light: pink[200],
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
});



export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemCount, setItemCount] = useState();
  const [selectedItem, setSelectedItem] = useState('');

  const columns = [
    {field: "item" , headerName: 'Item', width: 400},
    {field: "quantity", headerName: 'Quantity', width: 200},
    {field: "add", headerName: '', renderCell: (params)=>{
      return (
        <Button variant='contained' onClick={()=>{addItem(params.row.item.toLowerCase(), 1)}}><AddIcon/></Button>
      )
    }},
    {field: "remove", headerName: '', renderCell: (params)=>{
      return (
        <Button variant='contained' onClick={()=>{removeItem(params.row.item.toLowerCase())}}><RemoveIcon/></Button>
      )
    }},
    {field: "delete", headerName: '', renderCell: (params)=>{
      return (
        <Button variant='contained' onClick={()=>clickedDelete(params.row.item.toLowerCase())}><DeleteIcon/></Button>
      )
    }},
  ]

  const clickedDelete = (item) => {
    console.log("clicked delete for " + item)
    setSelectedItem(item)
    setOpenDeleteAlert(true);
  }
  // CRUD operations 
  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach(doc => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  }
  const addItem = async (item, newCount) => {
    const docRef = doc(collection(firestore, 'inventory'), item.toLowerCase());
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const {count} = docSnap.data();
      await setDoc(docRef, {count : Number(count) + Number(newCount)});
    } else {
      await setDoc(docRef, {count : Number(newCount)});
    }
    await updateInventory();
  }
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item.toLowerCase());
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const {count} = docSnap.data();
      if (count === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, {count : count - 1});
      }
    }
    await updateInventory();
  }

  const deleteItem = async (item) => {
    // create alert to confirm deletion
    const docRef = doc(collection(firestore, 'inventory'), item.toLowerCase());
    await deleteDoc(docRef);
    await updateInventory();
  }

  const getRows = (inventory) => {
    const rows = [];
    inventory.forEach(({name, count}) => {
      rows.push({
        "id": name,
        "item": name.charAt(0).toUpperCase() + name.slice(1),
        "quantity": count,
      });
    });
    // console.log(rows)
    return rows; 
  }
  // Handle Functions
  const handleOpen =  () => setOpen(true);
  const handleClose = () => setOpen(false);


  useEffect(() => {
    updateInventory();
  }, []);

  return (
    <ThemeProvider theme={theme}>
    <Box 
      width='100vw' 
      height='100vh' 
      display='flex' 
      flexDirection='column'
      alignItems='center' 
      gap={2}
    >
      <Modal open={open} onClose={handleClose}>
        <Box position='absolute' top='50%' left='50%' sx={{transform: 'translate(-50%, -50%)'}} width={400} bgcolor='white' border='2px solid #000' boxShadow={24} p={4} display='flex' flexDirection='column' gap={3}>
          <Typography variant='h6'>Add Item</Typography>
          <Stack width='100%' direction='row' spacings={2}>
            <TextField 
            variant='outlined'
            fullWidth
            label='Item'
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            />
            <TextField 
            variant='outlined'
            fullWidth
            label='Quantity'
            value={itemCount}
            onChange={(e) => setItemCount(e.target.value)}
            />
            
          </Stack>
          <Button variant='outlined' onClick={() => {
              addItem(itemName, itemCount);
              setItemName('');
              setItemCount(1);
              handleClose();
            }}>Add</Button>
        </Box>
      </Modal>
      <Typography variant='h2' fontWeight={400} color={"primary.dark"}> Inventory Tracker </Typography>
      <Button variant='contained' onClick={() => handleOpen()}>Add New Item</Button>
      <Box border="1px solid #333"> 
      <Box display='flex' width="100vw" height="100px" bgcolor={"primary.light"} alignItems="center" justifyContent="center">
          <Typography variant='h4'>Inventory Items</Typography>
      </Box>
      
      <Stack width='100vw' height="100vh" spacing={2} overflow="auto" direction='column'>
      <DataGrid
        rows={getRows(inventory)}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 5,
            },
          },
        }}
        pageSizeOptions={[5]}
        checkboxSelection
        disableRowSelectionOnClick
        disableColumnFilter
        disableColumnMenu
        disableColumnResize
        disableColumnSelector
        disableAutosize
        disableDensitySelector
        disableEval
        disableMultipleRowSelection
        disableVirtualization
      />
      {/* {inventory.map(({name, count}) => (
        <Box key={name} width="100%"  display="flex" alignItems="center" justifyContent="space-between" bgColor="#f0f0f0" padding={3}>
          <Typography variant='h5' color='#333' textAlign={'center'}>{name.charAt(0).toUpperCase() + name.slice(1)}</Typography>
          <Typography variant='h5' color='#333' textAlign={'center'}>{count}</Typography>
          <Stack direction='row' spacing={2}>
            <Button variant='contained' onClick={()=>{addItem(name, 1)}}>
              <AddIcon/>
            </Button>
            <Button variant='contained' onClick={()=>{removeItem(name)}}>
              <RemoveIcon/>
            </Button>
            <Button variant='contained' onClick={()=>{deleteItem(name)}}>
              <DeleteIcon/>
            </Button>
          </Stack>
        </Box>
      ))} */}
      </Stack>
      <Dialog
        open={openDeleteAlert}
        onClose={()=>setOpenDeleteAlert(false)}>
        <DialogTitle>
          Are you sure you want to delete {selectedItem}?
        </DialogTitle>
        <DialogActions>
          <Button onClick={()=>setOpenDeleteAlert(false)} autoFocus>No</Button>
          <Button onClick={()=>{
            deleteItem(selectedItem);
            setOpenDeleteAlert(false);
            setSelectedItem('');
          }}>Yes</Button>
        </DialogActions>
      </Dialog>
      </Box>
    </Box>
    </ThemeProvider>
    );
}
