"use client"
import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, Clock, Video, Users, Plus, ChevronLeft, ChevronRight, MoreHorizontal, MapPin, FileText, Loader2, X } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function Interviews() {
  const [interviews, setInterviews] = useState<any[]>([])
  const [freelancers, setFreelancers] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    freelancer_id: '',
    project_id: '',
    scheduled_at_date: '',
    scheduled_at_time: '',
    meeting_link: '',
    notes: ''
  })

  const supabase = createClient()

  useEffect(() => {
    loadData()

    const channel = supabase.channel('client_interviews_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'interviews' }, (payload) => {
        loadData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      const [interviewsRes, freelancersRes, projectsRes] = await Promise.all([
        supabase.from('interviews').select('*, freelancer:users!interviews_freelancer_id_fkey(full_name, username), freelancer_profiles(full_name, profile_image), project:projects(title)').eq('client_id', user.id).order('scheduled_at', { ascending: true }),
        supabase.from('freelancer_profiles').select('user_id, full_name, username'),
        supabase.from('projects').select('id, title').eq('client_id', user.id)
      ])

      if (interviewsRes.data) setInterviews(interviewsRes.data)
      if (freelancersRes.data) setFreelancers(freelancersRes.data)
      if (projectsRes.data) setProjects(projectsRes.data)

    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const datetimeStr = `${formData.scheduled_at_date}T${formData.scheduled_at_time}:00`
    const scheduled_at = new Date(datetimeStr).toISOString()

    const { error } = await supabase.from('interviews').insert({
      client_id: user.id,
      freelancer_id: formData.freelancer_id,
      project_id: formData.project_id || null,
      scheduled_at,
      meeting_link: formData.meeting_link,
      notes: formData.notes,
      status: 'Scheduled'
    })

    setIsSubmitting(false)
    if (!error) {
      setShowScheduleModal(false)
      loadData()
      setFormData({
        freelancer_id: '',
        project_id: '',
        scheduled_at_date: '',
        scheduled_at_time: '',
        meeting_link: '',
        notes: ''
      })
    } else {
      alert('Error scheduling interview: ' + error.message)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('interviews').update({ status }).eq('id', id)
    loadData()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-10 text-gray-900 h-full overflow-y-auto bg-gray-50/50">
      
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Interview Scheduling</h1>
          <p className="text-gray-500">Manage your calendar and upcoming meetings with candidates.</p>
        </div>
        <button onClick={() => setShowScheduleModal(true)} className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-6 rounded-xl transition-colors shadow-sm shadow-teal-500/20 flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Schedule Interview
        </button>
      </header>

      <div className="space-y-6">
        {interviews.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
            <Video className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No interviews scheduled</h3>
            <p className="text-gray-500 mb-6">You don't have any upcoming or past interviews. Schedule one to get started.</p>
            <button onClick={() => setShowScheduleModal(true)} className="text-teal-600 font-semibold hover:text-teal-700">Schedule your first interview</button>
          </div>
        ) : (
          <div className="grid gap-4">
            {interviews.map(interview => (
              <div key={interview.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                      <Users className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">Interview with {interview.freelancer_profiles?.full_name || interview.freelancer?.full_name || 'Candidate'}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span className="flex items-center"><CalendarIcon className="w-4 h-4 mr-1" /> {new Date(interview.scheduled_at).toLocaleDateString()}</span>
                        <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {new Date(interview.scheduled_at).toLocaleTimeString()}</span>
                      </div>
                      {interview.project?.title && <p className="text-sm text-teal-600 mt-1">Project: {interview.project.title}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      interview.status === 'Scheduled' ? 'bg-blue-50 text-blue-600' :
                      interview.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                      interview.status === 'Cancelled' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {interview.status}
                    </span>
                    {interview.status === 'Scheduled' && (
                      <div className="flex gap-2 ml-auto md:ml-0">
                        {interview.meeting_link && (
                          <a href={interview.meeting_link} target="_blank" rel="noreferrer" className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition">Join</a>
                        )}
                        <button onClick={() => updateStatus(interview.id, 'Cancelled')} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition">Cancel</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Schedule Interview</h2>
              <button onClick={() => setShowScheduleModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleScheduleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Freelancer</label>
                <select required className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-teal-500" value={formData.freelancer_id} onChange={e => setFormData({...formData, freelancer_id: e.target.value})}>
                  <option value="">Select a freelancer</option>
                  {freelancers.map(f => (
                    <option key={f.user_id} value={f.user_id}>{f.full_name} (@{f.username || 'unknown'})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project (Optional)</label>
                <select className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-teal-500" value={formData.project_id} onChange={e => setFormData({...formData, project_id: e.target.value})}>
                  <option value="">None</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" required className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-teal-500" value={formData.scheduled_at_date} onChange={e => setFormData({...formData, scheduled_at_date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input type="time" required className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-teal-500" value={formData.scheduled_at_time} onChange={e => setFormData({...formData, scheduled_at_time: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link (Zoom, Meet, etc)</label>
                <input type="url" placeholder="https://..." className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-teal-500" value={formData.meeting_link} onChange={e => setFormData({...formData, meeting_link: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea rows={3} className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-teal-500" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowScheduleModal(false)} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-teal-600 text-white font-medium hover:bg-teal-700 rounded-lg transition disabled:opacity-50">
                  {isSubmitting ? 'Scheduling...' : 'Schedule Interview'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
