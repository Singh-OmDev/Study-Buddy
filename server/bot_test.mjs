import axios from 'axios';
async function run() {
  try {
    const res = await axios.post('http://localhost:5000/api/match/bot', {
       message: "Test",
       context: "None",
       image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
    });
    console.log(res.data);
  } catch (err) {
    console.log("Status:", err.response?.status);
    console.log("Data:", err.response?.data);
  }
}
run();
