import React, { useEffect, useState } from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import io from 'socket.io-client'
import { LandingPage } from './landing-page'
import { ChatPage } from './chat-page'
import './App.scss'

export interface Messages {
  username: string
  message: string
}

function App() {
  const [username, setUsername] = useState<string>(localStorage.getItem('chat-username') || '')
  const [chatMessages, setChatMessages] = useState<Messages[]>([])

  useEffect(() => {
    localStorage.setItem('chat-username', username)
  }, [username])

  const chatServiceEndpoint =
    process.env.NODE_ENV === 'production'
      ? 'wss://intense-plateau-11880.herokuapp.com'
      : 'ws://localhost:34000'

  const socket = io(chatServiceEndpoint)

  socket.on('connect', function () {
    console.log('WebSocket Client Connected')
    socket.send('Hi this is web client.')
    // setInterval(() => {
    //   socket.emit('chat message', displayName)
    // }, 1000)
  })

  socket.on('event', function (data: any) {
    console.log('Received: ' + data)
  })

  socket.on('chat_room', (data: any) => {
    const { username, message } = data
    chatMessages.push({ username, message })
    setChatMessages(chatMessages)
  })

  socket.on('disconnect', function () {
    console.log('WebSocket Client Disconnected')
  })

  const sendMessageHandler = (message: string): void => {
    socket.emit('new_message', { message, username })
  }

  return (
    <BrowserRouter>
      <div className="App">
        <Switch>
          <Route exact path="/chat">
            <ChatPage
              chatMessages={chatMessages}
              sendMessageHandler={sendMessageHandler}
              username={username}
            />
          </Route>
          <Route path="/">
            <LandingPage setUsername={setUsername} />
          </Route>
        </Switch>
      </div>
    </BrowserRouter>
  )
}

export default App
