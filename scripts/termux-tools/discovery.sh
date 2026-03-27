#!/data/data/com.termux/files/usr/bin/bash
# TERMUX PATCH: Termux-API Tool Discovery for Gemini CLI
# Returns FunctionDeclarations for Termux commands
# Author: DioNanos

cat << 'EOF'
[
  {
    "name": "termux_battery_status",
    "description": "Get device battery status including percentage, health, temperature, and charging state. Returns JSON with: health (GOOD/OVERHEAT/DEAD/etc), percentage (0-100), plugged (AC/USB/WIRELESS/UNPLUGGED), status (CHARGING/DISCHARGING/FULL/NOT_CHARGING), temperature (Celsius), current (microamperes).",
    "parametersJsonSchema": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "name": "termux_clipboard_get",
    "description": "Read the current content of the Android clipboard. Returns the clipboard text content to stdout.",
    "parametersJsonSchema": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "name": "termux_clipboard_set",
    "description": "Set the Android clipboard content. The text parameter will be copied to the system clipboard.",
    "parametersJsonSchema": {
      "type": "object",
      "properties": {
        "text": {
          "type": "string",
          "description": "Text to copy to clipboard"
        }
      },
      "required": ["text"]
    }
  },
  {
    "name": "termux_toast",
    "description": "Show a toast notification message on screen. Optional parameters control appearance and duration.",
    "parametersJsonSchema": {
      "type": "object",
      "properties": {
        "message": {
          "type": "string",
          "description": "Message to display in toast"
        },
        "short": {
          "type": "boolean",
          "description": "Use short duration (default: false for long)"
        },
        "gravity": {
          "type": "string",
          "enum": ["top", "middle", "bottom"],
          "description": "Toast position on screen"
        },
        "background_color": {
          "type": "string",
          "description": "Background color (e.g., 'red', '#FF0000')"
        },
        "text_color": {
          "type": "string",
          "description": "Text color (e.g., 'white', '#FFFFFF')"
        }
      },
      "required": ["message"]
    }
  },
  {
    "name": "termux_notification",
    "description": "Create a persistent notification in the Android notification shade. Supports title, content, icons, actions, buttons, LED, sound, and vibration.",
    "parametersJsonSchema": {
      "type": "object",
      "properties": {
        "title": {
          "type": "string",
          "description": "Notification title"
        },
        "content": {
          "type": "string",
          "description": "Notification body text"
        },
        "id": {
          "type": "string",
          "description": "Unique ID to update/remove notification later"
        },
        "priority": {
          "type": "string",
          "enum": ["high", "low", "default"],
          "description": "Notification priority"
        },
        "sound": {
          "type": "boolean",
          "description": "Play notification sound"
        },
        "vibrate": {
          "type": "string",
          "description": "Vibration pattern (e.g., '500,500,500')"
        },
        "ongoing": {
          "type": "boolean",
          "description": "Make notification persistent (cannot be swiped away)"
        }
      },
      "required": ["title", "content"]
    }
  },
  {
    "name": "termux_notification_remove",
    "description": "Remove a notification by its ID.",
    "parametersJsonSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "description": "Notification ID to remove"
        }
      },
      "required": ["id"]
    }
  },
  {
    "name": "termux_tts_speak",
    "description": "Speak text using Android Text-to-Speech engine. Supports language, pitch, and rate settings.",
    "parametersJsonSchema": {
      "type": "object",
      "properties": {
        "text": {
          "type": "string",
          "description": "Text to speak"
        },
        "language": {
          "type": "string",
          "description": "Language code (e.g., 'en', 'it', 'de')"
        },
        "pitch": {
          "type": "number",
          "description": "Pitch multiplier (default: 1.0)"
        },
        "rate": {
          "type": "number",
          "description": "Speech rate multiplier (default: 1.0)"
        }
      },
      "required": ["text"]
    }
  },
  {
    "name": "termux_vibrate",
    "description": "Vibrate the device for specified duration.",
    "parametersJsonSchema": {
      "type": "object",
      "properties": {
        "duration": {
          "type": "integer",
          "description": "Vibration duration in milliseconds (default: 1000)"
        },
        "force": {
          "type": "boolean",
          "description": "Vibrate even if device is in silent mode"
        }
      }
    }
  },
  {
    "name": "termux_torch",
    "description": "Control the device flashlight/torch.",
    "parametersJsonSchema": {
      "type": "object",
      "properties": {
        "state": {
          "type": "string",
          "enum": ["on", "off"],
          "description": "Turn torch on or off"
        }
      },
      "required": ["state"]
    }
  },
  {
    "name": "termux_wifi_connectioninfo",
    "description": "Get current WiFi connection information. Returns JSON with SSID, BSSID, IP address, link speed, RSSI signal strength, and more.",
    "parametersJsonSchema": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "name": "termux_location",
    "description": "Get device GPS location. Returns JSON with latitude, longitude, altitude, accuracy, speed, bearing, and provider information.",
    "parametersJsonSchema": {
      "type": "object",
      "properties": {
        "provider": {
          "type": "string",
          "enum": ["gps", "network", "passive"],
          "description": "Location provider (gps=high accuracy, network=fast, passive=lowest power)"
        },
        "request": {
          "type": "string",
          "enum": ["once", "last", "updates"],
          "description": "Request type: once (single fix), last (cached), updates (continuous)"
        }
      }
    }
  },
  {
    "name": "termux_audio_info",
    "description": "Get audio system information including speaker, bluetooth, and headset states.",
    "parametersJsonSchema": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "name": "termux_volume",
    "description": "Get or set system volume levels. Without parameters returns all volume levels. With parameters sets specific stream volume.",
    "parametersJsonSchema": {
      "type": "object",
      "properties": {
        "stream": {
          "type": "string",
          "enum": ["alarm", "music", "notification", "ring", "system", "call"],
          "description": "Audio stream to control"
        },
        "volume": {
          "type": "integer",
          "description": "Volume level to set (0-15 typically)"
        }
      }
    }
  },
  {
    "name": "termux_brightness",
    "description": "Set screen brightness level.",
    "parametersJsonSchema": {
      "type": "object",
      "properties": {
        "brightness": {
          "type": "string",
          "description": "Brightness value 0-255 or 'auto'"
        }
      },
      "required": ["brightness"]
    }
  },
  {
    "name": "termux_camera_info",
    "description": "Get information about available cameras. Returns JSON array with camera IDs, facing direction, and supported resolutions.",
    "parametersJsonSchema": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "name": "termux_camera_photo",
    "description": "Take a photo with the device camera.",
    "parametersJsonSchema": {
      "type": "object",
      "properties": {
        "camera_id": {
          "type": "integer",
          "description": "Camera ID (0=back, 1=front typically)"
        },
        "output_file": {
          "type": "string",
          "description": "Output file path for the photo"
        }
      },
      "required": ["output_file"]
    }
  },
  {
    "name": "termux_dialog",
    "description": "Show an interactive dialog to the user. Supports various input types.",
    "parametersJsonSchema": {
      "type": "object",
      "properties": {
        "title": {
          "type": "string",
          "description": "Dialog title"
        },
        "type": {
          "type": "string",
          "enum": ["confirm", "text", "spinner", "date", "time", "counter"],
          "description": "Dialog type"
        },
        "values": {
          "type": "string",
          "description": "Comma-separated values for spinner/radio"
        },
        "hint": {
          "type": "string",
          "description": "Input hint for text dialogs"
        }
      }
    }
  },
  {
    "name": "termux_share",
    "description": "Share content using Android share intent.",
    "parametersJsonSchema": {
      "type": "object",
      "properties": {
        "text": {
          "type": "string",
          "description": "Text to share"
        },
        "file": {
          "type": "string",
          "description": "File path to share"
        },
        "title": {
          "type": "string",
          "description": "Share dialog title"
        },
        "action": {
          "type": "string",
          "enum": ["send", "view", "edit"],
          "description": "Share action type"
        }
      }
    }
  },
  {
    "name": "termux_open_url",
    "description": "Open a URL in the default browser.",
    "parametersJsonSchema": {
      "type": "object",
      "properties": {
        "url": {
          "type": "string",
          "description": "URL to open"
        }
      },
      "required": ["url"]
    }
  }
]
EOF
