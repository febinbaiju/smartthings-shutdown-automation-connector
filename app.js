require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { exec } = require("child_process");

const app = express();
const PORT = process.env.PORT || 5166;
const baseUrl = "https://api.smartthings.com";

app.use(bodyParser.json());

function createConfigInitializeSetting() {
  return {
    name: process.env.APP_NAME,
    description: process.env.APP_DESCRIPTION,
    id: process.env.APP_ID,
    firstPageId: "1", // Do not change
  };
}

function handleConfig(configData) {
  if (!configData.config) {
    throw new Error("No config section set in request.");
  }
  let config = {};
  const phase = configData.phase;
  const pageId = configData.pageId;
  const settings = configData.config;

  switch (phase) {
    case "INITIALIZE":
      config.initialize = createConfigInitializeSetting();
      break;
    case "PAGE":
      config.page = createConfigPage(pageId, settings);
      break;
    default:
      throw new Error(`Unsupported config phase: ${phase}`);
  }
  return config;
}

function createConfigPage(pageId, currentConfig) {
  if (pageId !== "1") {
    throw new Error(`Unsupported page name: ${pageId}`);
  }

  return {
    pageId: "1",
    name: "Configure",
    nextPageId: null,
    previousPageId: null,
    complete: true,
    sections: [
      {
        name: "Choose a virtual switch to control the action",
        settings: [
          {
            id: "switch",
            name: "Virtual Switch",
            description: "Tap to select",
            type: "DEVICE",
            required: true,
            multiple: false,
            capabilities: ["switch"],
            permissions: ["r", "x"],
          },
        ],
      },
    ],
  };
}

async function handleInstall(installedApp, authToken) {
  await createSubscription(installedApp, authToken);
}

async function handleUpdate(installedApp, authToken) {
  await deleteSubscriptions(installedApp.installedAppId, authToken);
  await createSubscription(installedApp, authToken);
}

async function createSubscription(installedApp, authToken) {
  const deviceConfig = installedApp.config.switch[0].deviceConfig;
  const path = `/installedapps/${installedApp.installedAppId}/subscriptions`;

  await callSmartThingsApi(
    `${baseUrl}${path}`,
    "POST",
    authToken,
    {
      sourceType: "DEVICE",
      device: {
        componentId: deviceConfig.componentId,
        deviceId: deviceConfig.deviceId,
        capability: "switch",
        attribute: "switch",
        stateChangeOnly: true,
        subscriptionName: "switch_on_subscription",
        value: "on",
      },
    },
    "subscription created"
  );
}

async function deleteSubscriptions(installedAppId, authToken) {
  const path = `/installedapps/${installedAppId}/subscriptions`;
  await callSmartThingsApi(
    `${baseUrl}${path}`,
    "DELETE",
    authToken,
    null,
    "subscriptions deleted"
  );
}

async function turnOffSwitch(deviceId, authToken) {
  await callSmartThingsApi(
    `${baseUrl}/v1/devices/${deviceId}/commands`,
    "POST",
    authToken,
    {
      commands: [
        {
          component: "main",
          capability: "switch",
          command: "off",
        },
      ],
    },
    "Switch turned off"
  );
}

async function callSmartThingsApi(
  url,
  method,
  authToken,
  body = null,
  successLog = "",
  returnRaw = false
) {
  try {
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : null,
    });

    if (response.ok) {
      if (successLog) console.log(successLog);
      const json = await response.json().catch(() => ({}));
      return returnRaw ? { json, response } : json;
    } else {
      const errText = await response.text();
      console.error(`Request failed [${method} ${url}]:`, errText);
    }
  } catch (err) {
    console.error(`Error making SmartThings request [${method} ${url}]:`, err);
  }
}

async function handleShutdown() {
  exec("sudo shutdown -h now", (error, stdout, stderr) => {
    if (error) {
      console.error(`Shutdown error: ${error.message}`);
    }
    if (stderr) {
      console.error(`Shutdown stderr: ${stderr}`);
    }
    console.log(`Shutdown stdout: ${stdout}`);
  });
}

// Routes

app.get("/", (req, res) => {
  return res.json({ statusCode: 200, message: "Server is up!" });
});

app.post("/", async (req, resp) => {
  const evt = req.body;
  const lifecycle = evt.lifecycle;

  try {
    switch (lifecycle) {
      case "CONFIGURATION":
      case "CONFIGURE": {
        const config = handleConfig(evt.configurationData);
        return resp.json({
          statusCode: 200,
          message: "Configured",
          data: config,
        });
      }
      case "CONFIRMATION": {
        const confirmationUrl = evt.confirmationData.confirmationUrl;
        const res = await fetch(confirmationUrl);
        const data = await res.json();
        console.log("Confirmation URL:", confirmationUrl);
        return resp.json({
          statusCode: 200,
          message: "Installed",
          data,
          confirmationUrl,
        });
      }
      case "INSTALL": {
        await handleInstall(
          evt.installData.installedApp,
          evt.installData.authToken
        );
        return resp.json({ statusCode: 200, message: "Installed" });
      }
      case "UPDATE": {
        await handleUpdate(
          evt.updateData.installedApp,
          evt.updateData.authToken
        );
        return resp.json({ statusCode: 200, message: "Updated" });
      }
      case "EVENT": {
        const event = evt.eventData.events[0].deviceEvent;
        const authToken = evt.eventData.authToken;
        if (event.subscriptionName === "switch_on_subscription") {
          console.log("shutdown command received!");
          await turnOffSwitch(deviceId, authToken); // Turns off the Virtual Switch if the Event Capture was Successful
          await handleShutdown(); // Shuts down the system
        }
        break;
      }
      case "UNINSTALL": {
        return resp.json({ statusCode: 200, message: "Uninstalled!" });
      }
      default:
        console.log(`lifecycle ${lifecycle} not supported`);
    }
  } catch (error) {
    console.error("Error handling lifecycle:", error);
    resp.status(500).send("Internal Server Error");
  }
});

app.listen(PORT, () => {
  console.log(`SmartThings SmartApp Connector listening on port ${PORT}`);
});
