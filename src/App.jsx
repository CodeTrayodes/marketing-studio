import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import CommandCentre from './pages/CommandCentre';
import PipelinePage from './pages/PipelinePage';
import ContentTracker from './pages/ContentTracker';
import GateManager from './pages/GateManager';
import PerformancePage from './pages/PerformancePage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<CommandCentre />} />
          <Route path="pipeline" element={<PipelinePage />} />
          <Route path="content" element={<ContentTracker />} />
          <Route path="gates" element={<GateManager />} />
          <Route path="performance" element={<PerformancePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
