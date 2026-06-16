const DAILY_API = "https://api.daily.co/v1";

function getApiKey(): string {
  const key = process.env.DAILY_API_KEY;
  if (!key) {
    throw new Error("DAILY_API_KEY is not configured");
  }
  return key;
}

interface DailyRoom {
  name: string;
  url: string;
}

export async function getOrCreateRoom(roomName: string): Promise<DailyRoom> {
  const apiKey = getApiKey();
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  const getRes = await fetch(`${DAILY_API}/rooms/${roomName}`, { headers });
  if (getRes.ok) {
    return (await getRes.json()) as DailyRoom;
  }

  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 4;
  const createRes = await fetch(`${DAILY_API}/rooms`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      name: roomName,
      privacy: "private",
      properties: {
        exp,
        enable_chat: true,
        start_video_off: false,
        start_audio_off: false,
        max_participants: 2,
      },
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Failed to create Daily room: ${err}`);
  }

  return (await createRes.json()) as DailyRoom;
}

export async function createMeetingToken(
  roomName: string,
  userName: string
): Promise<string> {
  const apiKey = getApiKey();
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 2;

  const res = await fetch(`${DAILY_API}/meeting-tokens`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        room_name: roomName,
        user_name: userName,
        exp,
        is_owner: userName.startsWith("Dr."),
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to create meeting token: ${err}`);
  }

  const data = (await res.json()) as { token: string };
  return data.token;
}

export function buildRoomName(appointmentId: string): string {
  return `mc-${appointmentId.replace(/-/g, "").slice(0, 20)}`;
}
