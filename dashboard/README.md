# amp3re edge fleet dashboard

React + TypeScript + Vite implementation of the Claude Design handoff. Current design: `../project-v3/amp3re Dashboard v3.dc.html` (v1 kept in `../project/`).

```sh
npm install
npm run dev      # local dev server
npm run build    # static build in dist/
```

Pages: Overview, Devices, Lines, Telemetry, Alerts, Deployments, Settings. All plant, device and alert data is
placeholder demo data generated in `src/data.ts`; live values are simulated on the stream interval.

`<App live floorMetric showSidebar theme simulateOutage />` props mirror the prototype's Tweaks panel. On the deployed site they can be set with URL params: `?theme=light`, `?outage=1`, `?live=0`, `?metric=temperature|cpu`, `?sidebar=0`.

Deployed as a static site to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.
