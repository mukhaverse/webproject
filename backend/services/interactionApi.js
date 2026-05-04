// services/interactionApi.js

const checkInteraction = async (drug1, drug2) => {
  const response = await fetch(
    "https://drug-interaction-checker.p.rapidapi.com/interactions/check",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
        "X-RapidAPI-Host": process.env.RAPIDAPI_HOST
      },
      body: JSON.stringify({ drug1, drug2 })
    }
  );

  // Handle API-level errors
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`RapidAPI error: ${errorText}`);
  }

  const data = await response.json();
  return data;
};

module.exports = { checkInteraction };