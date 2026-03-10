import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Blogs from './pages/Blogs'
import StoryDetails from './pages/StoryDetails'
import CreateBlog from './pages/CreateBlog'
import SymptomAnalysis from './pages/SymptomAnalysis'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="blogs" element={<Blogs />} />
        <Route path="blogs/create" element={<CreateBlog />} />
        <Route path="story/:id" element={<StoryDetails />} />
        <Route path="symptom-analysis" element={<SymptomAnalysis />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  )
}

export default App
