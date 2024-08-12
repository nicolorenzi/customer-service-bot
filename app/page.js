'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Drawer, CssBaseline, AppBar, Toolbar, List, Typography, Divider, ListItem, ListItemButton, ListItemIcon, ListItemText, Stack, TextField, createTheme, ThemeProvider, IconButton, Input } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { storage } from '/firebase'; // Adjust the path as necessary
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const drawerWidth = 200;
const headerHeight = 64;

export default function Home() {
  const scrollRef = useRef(null);
  const [name, setName] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm the Career Coach support assistant. How can I help you today?",
    },
  ]);
  const [message, setMessage] = useState('');
  const [view, setView] = useState('home'); // 'home', 'login', 'chat'
  // const [username, setUsername] = useState('');
  // const [password, setPassword] = useState('');



  const sendMessage = async () => {
    if (!message.trim()) return;

    setMessage('');
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ]);
    }
  };


  const [file, setFile] = useState(null);
  const [response, setResponse] = useState('');

  const handleFileUpload = (event) => {
    setFile(event.target.files[0]);
  };

  const uploadResume = async (event) => {
    event.preventDefault();

    if (!file) {
      alert('Please select a file.');
      return;
    }

    const storageRef = ref(storage, `uploads/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      snapshot => {},
      error => {
        console.error('Upload error:', error);
        setResponse('Failed to upload resume.');
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          // Send the download URL to your API for further processing
          const res = await fetch('/api/process-file', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: downloadURL }),
          });
          const result = await res.json();
          setResponse(result.message || 'Resume uploaded and processed successfully!');
        } catch (error) {
          console.error('Error processing file:', error);
          setResponse('Failed to process resume.');
        }
      }
    );
  };


  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const theme = createTheme({
    palette: {
      background: {
        default: '#edf0fa',
        white: '#ffffff',
      },
      primary: {
        main: '#6a83f5',
      },
      secondary: {
        main: '#ffffff',
      },
    },
    components: {
      MuiButtonBase: {
        defaultProps: {
          disableRipple: false,
        },
        styleOverrides: {
          root: {
            borderRadius: '14px',
          },
        },
      },
    },
  });

  // const handleLogin = () => {
  //   if (username === 'user' && password === 'pass') {
  //     setView('chat');
  //   } else {
  //     alert('Invalid credentials');
  //   }
  // };

  const renderContent = () => {
    switch (view) {
      case 'home':
        return (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh" bgcolor="background.default">
            <Typography variant="h2" gutterBottom>
              Welcome to Pathfinder AI
            </Typography>
            <Typography variant="h5" gutterBottom>
              Your personal career coach chatbot.
            </Typography>
            <Button variant="contained" color="primary" sx={{ borderRadius: '14px', marginTop: 4 }} onClick={() => setView('chat')}>
              Start Chatting
            </Button>
          </Box>
        );
      // case 'login':
      //   return (
      //     <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh" bgcolor="background.default">
      //       <Typography variant="h4" gutterBottom>
      //         Login to Pathfinder AI
      //       </Typography>
      //       <TextField
      //         label="Username"
      //         value={username}
      //         onChange={(e) => setUsername(e.target.value)}
      //         sx={{ marginBottom: 2, borderRadius: '14px'}}
      //       />
      //       <TextField
      //         label="Password"
      //         type="password"
      //         value={password}
      //         onChange={(e) => setPassword(e.target.value)}
      //         sx={{ marginBottom: 2, borderRadius: '14px'}}
      //       />
      //       <Button variant="contained" color="primary" onClick={handleLogin} sx={{ borderRadius: '14px'}}>
      //         Login
      //       </Button>
      //     </Box>
      //   );
      case 'chat':
        return (
          <Box
            component="main"
            height={'100vh'}
            sx={{ flexGrow: 1, bgcolor: 'background.white', p: 3, paddingTop: 0 }}
          >
            <Box height={headerHeight}></Box>
            <Box
              width="100%"
              height={`calc(100vh - ${headerHeight}px)`}
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              sx={{ bgcolor: 'background.default' }}
              borderRadius={5}
            >
              <Stack
                direction={'column'}
                width="100%"
                height="100%"
                p={2}
                spacing={3}
              >
                <Stack
                  direction={'column'}
                  spacing={2}
                  flexGrow={1}
                  overflow="auto"
                  maxHeight="100%"
                >
                  {messages.map((message, index) => (
                    <Box
                      key={index}
                      display="flex"
                      justifyContent={
                        message.role === 'assistant' ? 'flex-start' : 'flex-end'
                      }
                    >
                      <Box
                        maxWidth={'65%'}
                        bgcolor={
                          message.role === 'assistant'
                            ? 'secondary.main'
                            : 'primary.main'
                        }
                        color={
                          message.role === 'assistant'
                            ? 'black'
                            : 'white'
                        }
                        borderRadius={5}
                        p={3}
                      >
                        {message.content}
                      </Box>
                    </Box>
                  ))}
                  <Box ref={scrollRef}></Box>
                </Stack>
                <Stack direction={'row'} spacing={2}>
                  <TextField
                    label="Message . . ."
                    fullWidth
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disableBorder
                    InputProps={{
                      style: {
                        borderRadius: "14px",
                      }
                    }}
                  />
                  <Button variant="contained" onClick={sendMessage} sx={{ borderRadius: '14px' }}>
                    Send
                  </Button>
                  {/* <Input
                    type="file"
                    onChange={handleFileUpload}
                    inputProps={{ accept: ".pdf" }}
                    style={{ display: 'none' }}
                    id="resume-upload"
                  />
                  <label htmlFor="resume-upload">
                    <IconButton color="primary" component="span">
                      <AttachFileIcon />
                    </IconButton>
                  </label>
                  <Button variant="contained" onClick={uploadResume} sx={{ borderRadius: '14px' }}>
                    Upload Resume
                  </Button> */}
                </Stack>
              </Stack>
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar
          position="fixed"
          height={headerHeight}
          elevation={0}
          sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
        >
          <Toolbar elevation={0} sx={{ bgcolor: 'background.white', color: 'black'}} spacing={2} >
            <AccountCircleIcon/>
            <Typography variant="h6" noWrap component="div">
              Hello {name}
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
          variant="permanent"
          anchor="left"
        >
          <Toolbar elevation={0} sx={{ bgcolor: 'background.white', color: 'black'}} spacing={2} >
            <Typography variant="h6" noWrap component="div">
              Pathfinder AI
            </Typography>
          </Toolbar>
          <Divider />
          <List color='black' spacing={1}>
            <ListItem key={'Home'} disablePadding>
              <ListItemButton onClick={() => setView('home')}>
                <ListItemIcon>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText primary={'Home'} />
              </ListItemButton>
            </ListItem>
            <ListItem key={'Chat'} disablePadding>
              <ListItemButton onClick={() => setView('chat')}>
                <ListItemIcon>
                  <ChatBubbleIcon />
                </ListItemIcon>
                <ListItemText primary={'Chat'} />
              </ListItemButton>
            </ListItem>
            {/* <ListItem key={'Login'} disablePadding>
              <ListItemButton onClick={() => setView('login')}>
                <ListItemIcon>
                  <AccountCircleIcon />
                </ListItemIcon>
                <ListItemText primary={'Login'} />
              </ListItemButton>
            </ListItem> */}
          </List>
        </Drawer>
        {renderContent()}
      </Box>
    </ThemeProvider>
  );
}
