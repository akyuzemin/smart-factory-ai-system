import { Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Machines from './pages/Machines';
import MachineDetail from './pages/MachineDetail';
import Sensors from './pages/Sensors';
import SensorDetail from './pages/SensorDetail';
import Alarms from './pages/Alarms';
import Production from './pages/Production';
import Operators from './pages/Operators';
import Maintenance from './pages/Maintenance';
import Reports from './pages/Reports';
import AiQualityControl from './pages/AiQualityControl';
import AiAnalysisDetail from './pages/AiAnalysisDetail';
import Settings from './pages/Settings';
import AppLayout from './layout/AppLayout';

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="machines" element={<Machines />} />
        <Route path="machines/:id" element={<MachineDetail />} />
        <Route path="sensors" element={<Sensors />} />
        <Route path="sensors/:id" element={<SensorDetail />} />
        <Route path="alarms" element={<Alarms />} />
        <Route path="production" element={<Production />} />
        <Route path="operators" element={<Operators />} />
        <Route path="maintenance" element={<Maintenance />} />
        <Route path="reports" element={<Reports />} />
        <Route path="ai-quality-control" element={<AiQualityControl />} />
        <Route path="ai-quality-control/:id" element={<AiAnalysisDetail />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;
