import { PAGE_TITLES, type FloorMetric } from './data';
import { useDashboard } from './useDashboard';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Overview from './pages/Overview';
import Devices from './pages/Devices';
import Lines from './pages/Lines';
import Telemetry from './pages/Telemetry';
import Alerts from './pages/Alerts';
import Deployments from './pages/Deployments';
import Settings from './pages/Settings';

export interface AppProps {
  /** Start with the live stream running. */
  live?: boolean;
  /** Initial colouring of the plant floor map. */
  floorMetric?: FloorMetric;
  showSidebar?: boolean;
}

export default function App({ live = true, floorMetric = 'status', showSidebar = true }: AppProps) {
  const dash = useDashboard({ live, floorMetric });
  const { page } = dash.state;
  return (
    <div className="shell">
      {showSidebar && <Sidebar dash={dash} />}
      <main className="main">
        <Header dash={dash} title={PAGE_TITLES[page]} />
        {page === 'Overview' && <Overview dash={dash} />}
        {page === 'Devices' && <Devices dash={dash} />}
        {page === 'Lines' && <Lines dash={dash} />}
        {page === 'Telemetry' && <Telemetry dash={dash} />}
        {page === 'Alerts' && <Alerts dash={dash} />}
        {page === 'Deployments' && <Deployments dash={dash} />}
        {page === 'Settings' && <Settings dash={dash} />}
      </main>
    </div>
  );
}
