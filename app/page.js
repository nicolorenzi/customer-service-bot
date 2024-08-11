'use client'
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HomeIcon from '@mui/icons-material/Home';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { createTheme, ThemeProvider} from '@mui/material';
import { useState, useEffect, useRef } from 'react';
const drawerWidth = 200;
const headerHeight = 64;


export default function Home() {
  const scrollRef = useRef(null);
  const [name, setName] = useState('Chris')

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I'm the Headstarter career coach. How can I help you today ${name}?`,
    },
  ])

  const [message, setMessage] = useState('')

  const sendMessage = async () => {
    if (!message.trim()) return;  // Don't send empty messages
  
    setMessage('')
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ])
  
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      })
  
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
  
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
  
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ]
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ])
    }
  }

  // aut scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const theme = createTheme({
    palette: {
      background: {
        default: '#edf0fa',
        white: '#ffffff'
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
          disableRipple: false
        },
        styleOverrides: {
          root: {
            borderRadius: '14px'
          }
        }
      }
    }
  });

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
            {/* Home */}
            <ListItem key={'Home'} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <HomeIcon/>
                </ListItemIcon>
                <ListItemText primary={'Home'} />
              </ListItemButton>
            </ListItem>
            {/* Chat */}
            <ListItem key={'Chat'} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <ChatBubbleIcon/>
                </ListItemIcon>
                <ListItemText primary={'Chat'} />
              </ListItemButton>
            </ListItem>
            {/* Login */}
            <ListItem key={'Login'} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <AccountCircleIcon/>
                </ListItemIcon>
                <ListItemText primary={'Login'} />
              </ListItemButton>
            </ListItem>
          </List>
        </Drawer>
        <Box
          component="main"
          height={'100vh'}
          sx={{ flexGrow: 1, bgcolor: 'background.white', p: 3, paddingTop: 0}}
        >
          {/* offset by headerheight so bot takes full space */}
          <Box height={headerHeight}> 
          </Box>
          {/* chat bot goes here */}
          <Box
            width="100%"
            height={`calc(100vh - ${headerHeight}px)`}
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            sx={{ bgcolor: 'background.default'}}
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
                {/* This box will always be in view, thus facilitating an auto scroll feature when new messages are sent and recieved */}
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
                <Button variant="contained" onClick={sendMessage} sx={{ borderRadius: '14px'}}>
                  Send
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}