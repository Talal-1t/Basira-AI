import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import Chat from '../pages/Chat.jsx';
import ChatCombined from '../pages/ChatCombined.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard/:fileId" element={<Dashboard />} />
      <Route path="/chat/combined" element={<ChatCombined />} />
      <Route path="/chat/:fileId" element={<Chat />} />
    </Routes>
  );
}
