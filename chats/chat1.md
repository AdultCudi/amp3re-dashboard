# Factory Edge Dashboard Design

_Started 2026-10-10 05:37 UTC_

---

## User

Build a dashboard page for amp3re.com. They specialize in edge devices in factory devices. Give me a proper design based on the industry.

## Assistant

_[tool: list_files]_

_[tool: dc_write]_

_[tool: ready_for_verification]_

I built the amp3re dashboard as a dark control-room screen for one plant's fleet of edge devices. It's open in your preview now; a check is still running in the background.

**What's on it:**
- **Headline numbers:** devices online, edge response time, plant efficiency (OEE), data processed on site, and open alerts.
- **Plant floor map:** 6 production lines × 18 stations. You can colour it by status, temperature or CPU load, and clicking a station opens its details on the right. From there you can reboot a device and watch it come back online.
- **Below the map:** a throughput and response-time chart against a 15 ms target, an alert feed you can acknowledge, a table of devices needing attention filtered by line, and a firmware update rollout.
- **Live demo values:** the numbers update every 2 seconds. You can pause that from the header.

**Things to know:**
- The design system attached to this project is empty, so I picked the look myself: IBM Plex fonts, a dark background and a lime accent.
- Everything shown is made-up placeholder content: the plant name and location, device names, alerts and all the figures. Swap in real details before showing it to anyone.
- In the Tweaks panel you can turn the live updates on or off, choose what the floor map is coloured by at start, and hide the sidebar.

## User

Found issues — fixing…

## User

Please make it symmetrical. Look at this. It is wrongly put together.

## User

Please make it symmetrical. Look at this. It is wrongly put together.

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

The three rows below the headline numbers now use the same two-column split, so the right-hand panels (device details, Alerts, OTA rollout) line up as one column. Before, each row split slightly differently, which is the mismatch you spotted. I haven't looked at the result myself; it reloaded with no errors.

The blank boxes in your screenshot were the page caught mid-load, before the data filled in. They're separate from the alignment fix.

## User

In the left pane, please show the MTY-04 in the main itself. I must not scroll to see it. Also the center page must scroll not the left pane also.

## Assistant

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

The left pane now stays fixed at full window height. The MTY-04 box shows at its bottom without scrolling, and only the main page scrolls. It reloaded with no errors, but I haven't looked at it myself. In a very short window the left pane would get its own scroll so nothing is cut off.

## User

Can you add pagess for all the left pane? Currently only overview has stuff. I can't cliuck any other thing in the left pane.

## Assistant

_[tool: read_file]_

_[tool: run_script]_

_[tool: run_script]_

_[tool: ready_for_verification]_

Every item in the left pane now opens its own page. The page loaded without errors; a check of the new pages is still running in the background.

- **Devices:** a table of all 108 devices with search and line/status filters. Each row has a reboot button.
- **Lines:** one card per production line with its station status and key numbers. Clicking a card opens Devices filtered to that line.
- **Telemetry:** switch between response time, throughput, CPU and temperature. Shows current/min/average/max, a 60-minute chart, and a comparison by line.
- **Alerts:** filter by severity. Acknowledging an alert moves it to an "Acknowledged" list.
- **Deployments:** the firmware update rollout (with a pause/resume button), how many devices are on each firmware version, and a release history.
- **Settings:** plant name, update speed (1s/2s/5s), the response-time target, and notification and firmware switches.

The update speed and response-time target change the rest of the dashboard live. "Save changes" doesn't store anything yet; it only shows "Saved".

