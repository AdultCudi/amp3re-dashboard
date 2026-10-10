import { PAGE_TITLES, type FloorMetric } from './data';
import { useDashboard, type Theme } from './useDashboard';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import ControlRoom from './components/ControlRoom';
import { LoadingSkeleton, OutageBanner } from './components/Status';
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
  theme?: Theme;
  /** Start disconnected from the edge cluster, to show the outage state. */
  simulateOutage?: boolean;
}

export default function App({ live = true, floorMetric = 'status', showSidebar = true, theme = 'dark', simulateOutage = false }: AppProps) {
  const dash = useDashboard({ live, floorMetric, theme, simulateOutage });
  const { page, tv, narrow, loading } = dash.state;
  const shown = loading ? null : page;
  return (
    <div className="shell" data-amp={dash.state.theme}>
      {showSidebar && !narrow && !tv && <Sidebar dash={dash} />}
      {tv ? (
        <ControlRoom dash={dash} />
      ) : (
        <main className="main">
          <Header dash={dash} title={PAGE_TITLES[page]} />
          <OutageBanner dash={dash} />
          {loading && <LoadingSkeleton />}
          {shown === 'Overview' && <Overview dash={dash} />}
          {shown === 'Devices' && <Devices dash={dash} />}
          {shown === 'Lines' && <Lines dash={dash} />}
          {shown === 'Telemetry' && <Telemetry dash={dash} />}
          {shown === 'Alerts' && <Alerts dash={dash} />}
          {shown === 'Deployments' && <Deployments dash={dash} />}
          {shown === 'Settings' && <Settings dash={dash} />}
          {narrow && <BottomNav dash={dash} />}
        </main>
      )}
    </div>
  );
}
