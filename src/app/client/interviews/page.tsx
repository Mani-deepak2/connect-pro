"use client"
import { useState } from 'react'
import { Calendar as CalendarIcon, Clock, Video, Users, Plus, ChevronLeft, ChevronRight, MoreHorizontal, MapPin } from 'lucide-react'

const MOCK_INTERVIEWS = [
  { id: 1, title: 'Technical Interview', candidate: 'Alex Rivera', role: 'Full Stack Engineer', date: '2026-06-18', time: '10:00 AM - 11:00 AM', status: 'upcoming', type: 'Video Call', link: 'https://meet.google.com/abc-defg-hij', img: 'A', bg: 'bg-blue-100', text: 'text-blue-700' },
  { id: 2, title: 'Portfolio Review', candidate: 'Emily Chen', role: 'UI/UX Designer', date: '2026-06-19', time: '2:00 PM - 2:45 PM', status: 'upcoming', type: 'Video Call', link: 'https://zoom.us/j/123456789', img: 'E', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  { id: 3, title: 'Initial Screening', candidate: 'David Kim', role: 'Backend Developer', date: '2026-06-17', time: '11:00 AM - 11:30 AM', status: 'completed', type: 'Phone Call', link: '+1 (555) 123-4567', img: 'D', bg: 'bg-purple-100', text: 'text-purple-700' },
]

export default function Interviews() {
  const [currentDate, setCurrentDate] = useState(new Date('2026-06-17'))
  const [activeTab, setActiveTab] = useState('upcoming')

  const daysInMonth = 30 // Simplified for mock
  const startDay = 1 // Monday

  return (
    <div className="p-6 md:p-10 text-gray-900 h-full overflow-y-auto bg-gray-50/50">
      
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Interview Scheduling</h1>
          <p className="text-gray-500">Manage your calendar and upcoming meetings with candidates.</p>
        </div>
        <button className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-6 rounded-xl transition-colors shadow-sm shadow-teal-500/20 flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Schedule Interview
        </button>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Calendar & Filters */}
        <div className="space-y-8">
          
          {/* Mini Calendar Widget */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-gray-900">June 2026</h2>
              <div className="flex gap-2">
                <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><ChevronLeft className="w-4 h-4 text-gray-600" /></button>
                <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><ChevronRight className="w-4 h-4 text-gray-600" /></button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
                <div key={day} className="text-xs font-semibold text-gray-400 py-1">{day}</div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center">
              {[...Array(startDay)].map((_, i) => (
                <div key={`empty-${i}`} className="p-2"></div>
              ))}
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1;
                const isToday = day === 17;
                const hasInterview = day === 18 || day === 19;
                
                return (
                  <button 
                    key={day} 
                    className={`p-2 w-full aspect-square rounded-full flex items-center justify-center text-sm font-medium transition-all relative ${
                      isToday 
                        ? 'bg-teal-600 text-white shadow-md shadow-teal-500/30' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {day}
                    {hasInterview && !isToday && (
                      <span className="absolute bottom-1 w-1 h-1 bg-teal-500 rounded-full"></span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Connected Calendars */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Connected Calendars</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded flex items-center justify-center shadow-sm">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" alt="Google" className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Google Calendar</p>
                    <p className="text-xs text-gray-500">Synced just now</p>
                  </div>
                </div>
                <div className="w-10 h-6 bg-teal-500 rounded-full flex items-center p-1 cursor-pointer transition-colors">
                  <div className="w-4 h-4 bg-white rounded-full translate-x-4 shadow-sm transition-transform"></div>
                </div>
              </div>
              
              <button className="w-full py-2.5 border border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-teal-600 hover:border-teal-300 transition-colors flex items-center justify-center">
                <Plus className="w-4 h-4 mr-2" /> Connect Another Calendar
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Interviews List */}
        <div className="xl:col-span-2">
          
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm h-full flex flex-col">
            
            {/* Tabs */}
            <div className="flex gap-4 px-6 pt-6 border-b border-gray-100">
              {['upcoming', 'past', 'cancelled'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-sm font-semibold capitalize transition-colors relative ${
                    activeTab === tab ? 'text-teal-700' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-600 rounded-t-full"></span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex-1 p-6">
              <div className="space-y-4">
                {MOCK_INTERVIEWS.filter(i => activeTab === 'all' || (activeTab === 'upcoming' && i.status === 'upcoming') || (activeTab === 'past' && i.status === 'completed')).map(interview => (
                  <div key={interview.id} className="border border-gray-200 rounded-2xl p-5 hover:border-teal-200 hover:shadow-md transition-all group relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-teal-500 rounded-l-2xl"></div>
                    
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{interview.title}</h3>
                          <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${
                            interview.type === 'Video Call' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                          }`}>
                            {interview.type}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-8 h-8 rounded-full ${interview.bg} ${interview.text} flex items-center justify-center font-bold text-sm`}>
                            {interview.img}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{interview.candidate}</p>
                            <p className="text-xs text-gray-500">{interview.role}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                            {interview.date}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {interview.time}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-start md:items-end justify-between gap-4 pl-0 md:pl-6 md:border-l border-gray-100">
                        <button className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                        
                        {interview.status === 'upcoming' ? (
                          <div className="flex gap-2 w-full md:w-auto">
                            <button className="flex-1 md:flex-none px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                              Reschedule
                            </button>
                            <a href={interview.link} target="_blank" rel="noopener noreferrer" className="flex-1 md:flex-none px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-700 transition-colors shadow-sm shadow-teal-500/20 text-center flex items-center justify-center gap-2">
                              <Video className="w-4 h-4" /> Join Call
                            </a>
                          </div>
                        ) : (
                          <button className="w-full md:w-auto px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center gap-2">
                            <FileText className="w-4 h-4" /> View Notes
                          </button>
                        )}
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
