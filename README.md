# Samsung SmartThings Shutdown Connector

A Node.js-based SmartApp that integrates with Samsung SmartThings and allows you to remotely trigger a system shutdown using a virtual switch.

## 🚀 Features

* Configure a SmartThings virtual switch to trigger system shutdown.
* Securely integrates using SmartThings SmartApp lifecycle events.
* Subscribes to `switch.on` events to trigger shutdown.
* Automatically deletes/re-creates subscriptions on update.
* Turns off the switch after triggering shutdown.
* **Optional Telegram Notifications**: Sends detailed system shutdown status notifications to Telegram.
* **Optional Remote Shutdown Web Hook**: Triggers host system shutdown by calling a custom host web service (useful when running the SmartApp inside a Docker container).

---

## 📦 Requirements

* Node.js (v16 or later recommended)
* A SmartThings developer account
* A Raspberry Pi (or any Linux system that supports `shutdown`)

---

## 📁 Project Structure

```
smartthings-shutdown-connector/
├── app.js           # Main application logic
├── .env             # Environment variable configuration
├── host-shutdown/   # Scripts to set up host-side shutdown service
│   ├── shutdown.py  # Python HTTP server to execute host shutdown
│   └── shutdown.service # Systemd service unit file
├── package.json     # Project dependencies and scripts
└── README.md        # You're reading it!
```

---

## 🔧 Installation

```bash
# Clone the repo
git clone https://github.com/your-username/smartthings-shutdown-connector.git
cd smartthings-shutdown-connector

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env and add required values
```

### Environment Variables

| Variable | Description | Required | Example |
|---|---|---|---|
| `PORT` | Local port for the Node.js server. | No (Defaults to `5166`) | `5166` |
| `APP_NAME` | SmartThings app name. | Yes | `SmartThings Shutdown` |
| `APP_DESCRIPTION` | SmartThings app description. | Yes | `Trigger system shutdown from SmartThings` |
| `APP_ID` | SmartThings App ID. | Yes | `your-app-id` |
| `SHUTDOWN_HOST_URL` | Endpoint of the host shutdown service. If not specified, the app executes `shutdown -h now` locally. | No | `http://192.168.1.6:9999` |
| `TELEGRAM_NOTIFICATION_SERVER` | Telegram bot/notification server URL. If set, sends notifications to this URL. | No | `http://192.168.1.6:5387?token=secret` |

---

## 🏃‍♂️ Usage

Start the server:

```bash
npm start
```

Make sure the server is publicly accessible (you can use [ngrok](https://ngrok.com) during development).

Then, install your SmartApp on Samsung SmartThings Developer Workspace:

* Use your public endpoint (e.g., via ngrok) as the SmartApp URL.
* Grant permissions for `switch` capability.
* Choose your virtual switch during configuration.

---

## 🔌 Host Shutdown Service Setup

When running this connector inside a Docker container, it cannot easily shut down the host OS directly. Use the provided Python service in `host-shutdown/` to run a helper service on the host:

1. Copy `host-shutdown/shutdown.py` to `/bin/shutdown.py` on the host:
   ```bash
   sudo cp host-shutdown/shutdown.py /bin/shutdown.py
   sudo chmod 644 /bin/shutdown.py
   ```
2. Copy `host-shutdown/shutdown.service` to `/etc/systemd/system/shutdown.service` on the host:
   ```bash
   sudo cp host-shutdown/shutdown.service /etc/systemd/system/shutdown.service
   sudo chmod 644 /etc/systemd/system/shutdown.service
   ```
3. Enable and start the systemd service:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable shutdown
   sudo systemctl start shutdown
   ```

Specify the URL (e.g., `http://localhost:9999`) in the `SHUTDOWN_HOST_URL` environment variable of the Docker container.

---

## ⚙️ Lifecycle Events Supported

* `CONFIGURATION`
* `INSTALL`
* `UPDATE`
* `EVENT`
* `UNINSTALL`

---

## ⚠️ Important Notes

* Without `SHUTDOWN_HOST_URL`, your server running the Node.js app needs `sudo` permission to run `shutdown`.
* It’s recommended to configure your system to allow passwordless shutdown for your service user if executing locally.
* The virtual switch will be turned off automatically after triggering.

---

## 👨‍💻 Author

**Febin Baiju**
