import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import type { FloorMetric } from './data';
import './styles.css';

// The prototype's Tweaks panel, exposed as URL params on the static site:
// ?theme=light  ?outage=1  ?live=0  ?metric=temperature|cpu  ?sidebar=0
const q = new URLSearchParams(window.location.search);
const metric = q.get('metric');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App
      theme={q.get('theme') === 'light' ? 'light' : 'dark'}
      simulateOutage={q.get('outage') === '1'}
      live={q.get('live') !== '0'}
      floorMetric={metric === 'temperature' || metric === 'cpu' ? (metric as FloorMetric) : 'status'}
      showSidebar={q.get('sidebar') !== '0'}
    />
  </StrictMode>,
);
