import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "@/index.css";
import Layout from "@/components/organisms/Layout";
import TimeTracking from "@/components/pages/TimeTracking";
import TeamMembers from "@/components/pages/TeamMembers";
import TeamMemberDetail from "@/components/pages/TeamMemberDetail";
import Reports from "@/components/pages/Reports";
import Tasks from "@/components/pages/Tasks";
import Clients from "@/components/pages/Clients";
import ClientDetail from "@/components/pages/ClientDetail";
import ProjectDetail from "@/components/pages/ProjectDetail";
import Dashboard from "@/components/pages/Dashboard";
import Projects from "@/components/pages/Projects";
import TeamChat from "@/components/pages/TeamChat";

function App() {
  return (
<BrowserRouter>
      <Layout>
<Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/:id" element={<ClientDetail />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/team" element={<TeamMembers />} />
          <Route path="/team/:id" element={<TeamMemberDetail />} />
          <Route path="/chat" element={<TeamChat />} />
          <Route path="/time-tracking" element={<TimeTracking />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Layout>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        className="z-50"
      />
    </BrowserRouter>
  );
}

export default App;