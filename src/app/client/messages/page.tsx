"use client"
import { useState } from 'react'
import { Search, MoreVertical, Phone, Video, Paperclip, Send, Image as ImageIcon, Smile, Check, CheckCheck } from 'lucide-react'

const MOCK_CONVERSATIONS = [
  { id: 1, name: 'Alex Rivera', role: 'Full Stack Engineer', project: 'E-commerce Redesign', lastMessage: 'I have pushed the latest commits to the staging branch.', time: '10:42 AM', unread: 2, online: true, img: 'A', bg: 'bg-blue-100', text: 'text-blue-700' },
  { id: 2, name: 'Emily Chen', role: 'UI/UX Designer', project: 'Mobile App Design', lastMessage: 'Here is the Figma link for the final review.', time: 'Yesterday', unread: 0, online: false, img: 'E', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  { id: 3, name: 'David Kim', role: 'Backend Developer', project: 'API Gateway Build', lastMessage: 'The database migration is complete.', time: 'Tuesday', unread: 0, online: true, img: 'D', bg: 'bg-purple-100', text: 'text-purple-700' },
  { id: 4, name: 'Sarah Smith', role: 'Mobile Developer', project: 'Fitness Tracking App', lastMessage: 'Can we schedule a quick call tomorrow?', time: 'Monday', unread: 0, online: false, img: 'S', bg: 'bg-orange-100', text: 'text-orange-700' },
]

const MOCK_CHAT_HISTORY = [
  { id: 1, sender: 'Alex Rivera', isMe: false, message: 'Hi there! I just wanted to update you on the progress.', time: '10:30 AM', status: 'read' },
  { id: 2, sender: 'Me', isMe: true, message: 'Great, thanks Alex. How is the payment integration coming along?', time: '10:32 AM', status: 'read' },
  { id: 3, sender: 'Alex Rivera', isMe: false, message: 'Almost done. I ran into a small issue with the webhook testing, but it\'s resolved now.', time: '10:35 AM', status: 'read' },
  { id: 4, sender: 'Alex Rivera', isMe: false, message: 'I have pushed the latest commits to the staging branch.', time: '10:42 AM', status: 'read' },
]

export default function Messages() {
  const [activeChat, setActiveChat] = useState(MOCK_CONVERSATIONS[0])
  const [messageText, setMessageText] = useState('')

  return (
    <div className="flex h-full bg-white overflow-hidden">
      
      {/* Left Sidebar - Conversations */}
      <div className="w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col h-full bg-gray-50/30 shrink-0">
        
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search messages..."
              className="w-full pl-9 pr-4 py-2 bg-gray-100 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all text-gray-900"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {MOCK_CONVERSATIONS.map((chat) => (
            <button 
              key={chat.id}
              onClick={() => setActiveChat(chat)}
              className={`w-full text-left p-4 flex gap-4 transition-colors border-b border-gray-50 ${
                activeChat.id === chat.id ? 'bg-teal-50/50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="relative shrink-0">
                <div className={`w-12 h-12 rounded-full ${chat.bg} ${chat.text} flex items-center justify-center font-bold text-lg`}>
                  {chat.img}
                </div>
                {chat.online && (
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-gray-900 truncate pr-2">{chat.name}</h3>
                  <span className={`text-xs whitespace-nowrap ${chat.unread > 0 ? 'text-teal-600 font-bold' : 'text-gray-400'}`}>
                    {chat.time}
                  </span>
                </div>
                <p className="text-xs text-teal-600 font-medium truncate mb-1">{chat.project}</p>
                <div className="flex justify-between items-center gap-2">
                  <p className={`text-sm truncate ${chat.unread > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                    {chat.lastMessage}
                  </p>
                  {chat.unread > 0 && (
                    <span className="w-5 h-5 bg-teal-500 text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Window */}
      <div className="hidden md:flex flex-1 flex-col h-full bg-white relative">
        
        {/* Chat Header */}
        <div className="h-16 border-b border-gray-200 px-6 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full ${activeChat.bg} ${activeChat.text} flex items-center justify-center font-bold`}>
              {activeChat.img}
            </div>
            <div>
              <h2 className="font-bold text-gray-900">{activeChat.name}</h2>
              <p className="text-xs text-gray-500 flex items-center gap-1.5">
                {activeChat.online ? (
                  <><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Online</>
                ) : (
                  <><span className="w-2 h-2 rounded-full bg-gray-400"></span> Offline</>
                )}
                <span className="mx-1">•</span>
                <span>{activeChat.role}</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
              <Video className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-gray-200 mx-1"></div>
            <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#f8fafc]">
          <div className="flex justify-center mb-6">
            <span className="bg-gray-200 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full">
              Today
            </span>
          </div>
          
          <div className="space-y-6">
            {MOCK_CHAT_HISTORY.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                {!msg.isMe && (
                  <div className={`w-8 h-8 rounded-full ${activeChat.bg} ${activeChat.text} flex items-center justify-center font-bold text-xs mr-3 mt-auto shrink-0`}>
                    {activeChat.img}
                  </div>
                )}
                
                <div className={`max-w-[70%] ${msg.isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className={`px-5 py-3 rounded-2xl shadow-sm ${
                    msg.isMe 
                      ? 'bg-teal-600 text-white rounded-br-sm' 
                      : 'bg-white text-gray-900 border border-gray-100 rounded-bl-sm'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.message}</p>
                  </div>
                  
                  <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-400 px-1">
                    <span>{msg.time}</span>
                    {msg.isMe && (
                      <CheckCheck className="w-3.5 h-3.5 text-teal-500 ml-1" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Typing Indicator */}
        <div className="h-6 px-6 bg-[#f8fafc]">
          {activeChat.id === 1 && (
            <p className="text-xs text-gray-400 italic">Alex Rivera is typing...</p>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200 shrink-0">
          <div className="flex items-end gap-3 bg-gray-50 border border-gray-200 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all">
            <div className="flex gap-1 pb-1">
              <button className="p-2 text-gray-400 hover:text-teal-600 rounded-full transition-colors">
                <Paperclip className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-teal-600 rounded-full transition-colors hidden sm:block">
                <ImageIcon className="w-5 h-5" />
              </button>
            </div>
            
            <textarea 
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-transparent border-none focus:outline-none text-sm text-gray-900 resize-none py-3 max-h-32 min-h-[44px]"
              rows={1}
            />
            
            <div className="flex gap-2 pb-1">
              <button className="p-2 text-gray-400 hover:text-teal-600 rounded-full transition-colors hidden sm:block">
                <Smile className="w-5 h-5" />
              </button>
              <button 
                className={`p-2.5 rounded-full flex items-center justify-center transition-all ${
                  messageText.trim() 
                    ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-md shadow-teal-500/20' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
