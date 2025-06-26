// Banglish: Ei script prothome local data check kore, pore API use kore user info dey

const fetch = require("node-fetch"); // ✅ fetch require korlam Node.js er jonno

const localUsers = [
  { name: "Asif", age: 25 },
  { name: "Joy", age: 30 },
  { name: "Sumaiya", age: 22 }
];

async function getUserInfo(username) {
  // Banglish: Prothome local data check korchi
  const user = localUsers.find(u => u.name.toLowerCase() === username.toLowerCase());
  if (user) {
    return `✅ User (Local): ${user.name}, Age: ${user.age}`;
  }

  // Banglish: Jodi local e na paoa jai, API theke user anar try korchi
  try {
    const res = await fetch('https://dummyjson.com/users');
    const data = await res.json();
    const users = data.users;

    // Banglish: Random user select korchi
    const randomIndex = Math.floor(Math.random() * users.length);
    const apiUser = users[randomIndex];

    return `🌐 User (API): ${apiUser.firstName} ${apiUser.lastName}, Email: ${apiUser.email}, Country: ${apiUser.address.country}`;
  } catch (error) {
    return "❌ Kono user pawa jai nai! Error: " + error.message;
  }
}

// Banglish: Output dekhar jonno
getUserInfo("Sadia").then(console.log);
