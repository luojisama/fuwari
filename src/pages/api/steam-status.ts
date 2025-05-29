import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  const apiKey = "B89666D475069AA7F6FAA9E9277A5F50";
  const steamId = "76561199251859222";
  const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId}`;
  try {
    const resp = await fetch(url);
    const data = await resp.json();
    const player = data.response.players[0];
    return new Response(JSON.stringify({
      personaname: player.personaname,
      avatar: player.avatarfull,
      state: player.personastate,
      game: player.gameextrainfo || null
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Steam API 访问失败" }), { status: 500 });
  }
};