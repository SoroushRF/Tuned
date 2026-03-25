async function testApi() {
  const url = 'http://localhost:3000/api/gemini/process';
  const data = {
    text: "This is a test document about mitosis.",
    vector: { audio: 0.5, adhd: 0.5, scholar: 0.5, lastUpdated: Date.now(), manualOverride: false }
  };
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    console.log("Status:", res.status);
    const json = await res.json();
    console.log("Response Type:", typeof json);
    console.log("Has required keys:", !!(json.sprintCards && json.scholar && json.podcast));
    console.log("JSON Length:", JSON.stringify(json).length);
  } catch (err) {
    console.error("Fetch/Parse failed:", err.message);
  }
}
testApi();
