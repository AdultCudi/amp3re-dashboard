# amp3re edge fleet dashboard

React + TypeScript + Vite implementation of the Claude Design handoff in `../project/amp3re Dashboard.dc.html`.

```sh
npm install
npm run dev      # local dev server
npm run build    # static build in dist/
```

Pages: Overview, Devices, Lines, Telemetry, Alerts, Deployments, Settings. All plant, device and alert data is
placeholder demo data generated in `src/data.ts`; live values are simulated on the stream interval.

`<App live floorMetric showSidebar />` props mirror the prototype's Tweaks panel.

Deployed as a static site to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.
