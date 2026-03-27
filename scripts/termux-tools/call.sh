#!/data/data/com.termux/files/usr/bin/bash
# TERMUX PATCH: Termux-API Tool Call dispatcher for Gemini CLI
# Usage: call.sh <tool_name> < params.json
# Author: DioNanos

TOOL_NAME="$1"

# Read JSON params from stdin
PARAMS=$(cat)

case "$TOOL_NAME" in
  termux_battery_status)
    termux-battery-status
    ;;

  termux_clipboard_get)
    termux-clipboard-get
    ;;

  termux_clipboard_set)
    TEXT=$(echo "$PARAMS" | jq -r '.text // empty')
    if [ -n "$TEXT" ]; then
      echo "$TEXT" | termux-clipboard-set
      echo '{"status": "ok"}'
    else
      echo '{"error": "text parameter required"}'
      exit 1
    fi
    ;;

  termux_toast)
    MSG=$(echo "$PARAMS" | jq -r '.message // empty')
    SHORT=$(echo "$PARAMS" | jq -r '.short // false')
    GRAVITY=$(echo "$PARAMS" | jq -r '.gravity // empty')
    BG=$(echo "$PARAMS" | jq -r '.background_color // empty')
    TC=$(echo "$PARAMS" | jq -r '.text_color // empty')

    ARGS=""
    [ "$SHORT" = "true" ] && ARGS="$ARGS -s"
    [ -n "$GRAVITY" ] && ARGS="$ARGS -g $GRAVITY"
    [ -n "$BG" ] && ARGS="$ARGS -c $BG"
    [ -n "$TC" ] && ARGS="$ARGS -C $TC"

    echo "$MSG" | termux-toast $ARGS
    echo '{"status": "ok"}'
    ;;

  termux_notification)
    TITLE=$(echo "$PARAMS" | jq -r '.title // empty')
    CONTENT=$(echo "$PARAMS" | jq -r '.content // empty')
    ID=$(echo "$PARAMS" | jq -r '.id // empty')
    PRIORITY=$(echo "$PARAMS" | jq -r '.priority // empty')
    SOUND=$(echo "$PARAMS" | jq -r '.sound // false')
    VIBRATE=$(echo "$PARAMS" | jq -r '.vibrate // empty')
    ONGOING=$(echo "$PARAMS" | jq -r '.ongoing // false')

    ARGS="-t \"$TITLE\" -c \"$CONTENT\""
    [ -n "$ID" ] && ARGS="$ARGS --id $ID"
    [ -n "$PRIORITY" ] && ARGS="$ARGS --priority $PRIORITY"
    [ "$SOUND" = "true" ] && ARGS="$ARGS --sound"
    [ -n "$VIBRATE" ] && ARGS="$ARGS --vibrate $VIBRATE"
    [ "$ONGOING" = "true" ] && ARGS="$ARGS --ongoing"

    eval "termux-notification $ARGS"
    echo '{"status": "ok"}'
    ;;

  termux_notification_remove)
    ID=$(echo "$PARAMS" | jq -r '.id // empty')
    termux-notification-remove --id "$ID"
    echo '{"status": "ok"}'
    ;;

  termux_tts_speak)
    TEXT=$(echo "$PARAMS" | jq -r '.text // empty')
    LANG=$(echo "$PARAMS" | jq -r '.language // empty')
    PITCH=$(echo "$PARAMS" | jq -r '.pitch // empty')
    RATE=$(echo "$PARAMS" | jq -r '.rate // empty')

    ARGS=""
    [ -n "$LANG" ] && ARGS="$ARGS -l $LANG"
    [ -n "$PITCH" ] && ARGS="$ARGS -p $PITCH"
    [ -n "$RATE" ] && ARGS="$ARGS -r $RATE"

    echo "$TEXT" | termux-tts-speak $ARGS
    echo '{"status": "ok"}'
    ;;

  termux_vibrate)
    DUR=$(echo "$PARAMS" | jq -r '.duration // 1000')
    FORCE=$(echo "$PARAMS" | jq -r '.force // false')

    ARGS="-d $DUR"
    [ "$FORCE" = "true" ] && ARGS="$ARGS -f"

    termux-vibrate $ARGS
    echo '{"status": "ok"}'
    ;;

  termux_torch)
    STATE=$(echo "$PARAMS" | jq -r '.state // empty')
    termux-torch "$STATE"
    echo '{"status": "ok"}'
    ;;

  termux_wifi_connectioninfo)
    termux-wifi-connectioninfo
    ;;

  termux_location)
    PROVIDER=$(echo "$PARAMS" | jq -r '.provider // "gps"')
    REQUEST=$(echo "$PARAMS" | jq -r '.request // "once"')
    termux-location -p "$PROVIDER" -r "$REQUEST"
    ;;

  termux_audio_info)
    termux-audio-info
    ;;

  termux_volume)
    STREAM=$(echo "$PARAMS" | jq -r '.stream // empty')
    VOL=$(echo "$PARAMS" | jq -r '.volume // empty')

    if [ -n "$STREAM" ] && [ -n "$VOL" ]; then
      termux-volume "$STREAM" "$VOL"
      echo '{"status": "ok"}'
    else
      termux-volume
    fi
    ;;

  termux_brightness)
    BRIGHTNESS=$(echo "$PARAMS" | jq -r '.brightness // empty')
    termux-brightness "$BRIGHTNESS"
    echo '{"status": "ok"}'
    ;;

  termux_camera_info)
    termux-camera-info
    ;;

  termux_camera_photo)
    CAM_ID=$(echo "$PARAMS" | jq -r '.camera_id // 0')
    OUTPUT=$(echo "$PARAMS" | jq -r '.output_file // empty')
    termux-camera-photo -c "$CAM_ID" "$OUTPUT"
    echo "{\"status\": \"ok\", \"file\": \"$OUTPUT\"}"
    ;;

  termux_dialog)
    TITLE=$(echo "$PARAMS" | jq -r '.title // empty')
    TYPE=$(echo "$PARAMS" | jq -r '.type // "confirm"')
    VALUES=$(echo "$PARAMS" | jq -r '.values // empty')
    HINT=$(echo "$PARAMS" | jq -r '.hint // empty')

    ARGS=""
    [ -n "$TITLE" ] && ARGS="$ARGS -t \"$TITLE\""

    case "$TYPE" in
      confirm) ARGS="$ARGS confirm" ;;
      text) ARGS="$ARGS -i" ;;
      spinner) ARGS="$ARGS spinner --values \"$VALUES\"" ;;
      date) ARGS="$ARGS date" ;;
      time) ARGS="$ARGS time" ;;
      counter) ARGS="$ARGS counter" ;;
    esac

    [ -n "$HINT" ] && ARGS="$ARGS -i \"$HINT\""

    eval "termux-dialog $ARGS"
    ;;

  termux_share)
    TEXT=$(echo "$PARAMS" | jq -r '.text // empty')
    FILE=$(echo "$PARAMS" | jq -r '.file // empty')
    TITLE=$(echo "$PARAMS" | jq -r '.title // empty')
    ACTION=$(echo "$PARAMS" | jq -r '.action // "send"')

    ARGS="-a $ACTION"
    [ -n "$TITLE" ] && ARGS="$ARGS -t \"$TITLE\""

    if [ -n "$TEXT" ]; then
      echo "$TEXT" | termux-share $ARGS
    elif [ -n "$FILE" ]; then
      termux-share $ARGS "$FILE"
    fi
    echo '{"status": "ok"}'
    ;;

  termux_open_url)
    URL=$(echo "$PARAMS" | jq -r '.url // empty')
    termux-open-url "$URL"
    echo '{"status": "ok"}'
    ;;

  *)
    echo "{\"error\": \"Unknown tool: $TOOL_NAME\"}"
    exit 1
    ;;
esac
